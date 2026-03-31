const Expense = require("../models/expense");

// Save Expense from Bill Scan
const ExpenseTracker = async (req, res) => {
    try {
        const { items, grandTotal, title } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items found to save" });
        }

        const newExpense = new Expense({
            UserId: req.user.id,                    // Important: from protect middleware
            title: title || `Bill - ${new Date().toLocaleDateString()}`,
            Amount: grandTotal || 0,                // Grand total from scan
            items: items.map(item => ({
                name: item.item || item.name,
                price: parseFloat(item.price) || 0
            })),
            billImage: req.file ? req.file.path : null,   // If you're sending image
        });

        await newExpense.save();

        res.status(201).json({
            success: true,
            message: "Expense saved successfully!",
            expenseId: newExpense._id
        });

    } catch (error) {
        console.error("Save Expense Error:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to save expense" 
        });
    }
};

// Get All Expenses of Logged-in User
const getallExpense = async (req, res) => {
    try {
        const expenses = await Expense.find({ UserId: req.user.id })
            .sort({ date: -1 });   // Latest bills first

        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Failed to fetch expenses" 
        });
    }
};

// Get Category-wise Summary
const getExpenseSummary = async (req, res) => {
    try {
        const summary = await Expense.aggregate([
            {
                $match: { UserId: req.user.id }   // Only current user's data
            },
            {
                $group: {
                    _id: "$category",
                    totalSpent: { $sum: "$Amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { totalSpent: -1 }
            }
        ]);

        res.json(summary);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
};


module.exports = {
    ExpenseTracker,
    getallExpense,
    getExpenseSummary
};