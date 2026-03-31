const express = require("express")
const router = express.Router()
const {ExpenseTracker,getallExpense,getExpenseSummary} = require("../controllers/Expensecontroller")
const protect = require("../middlewares/authMiddleware")


router.get("/getexpense",protect,getallExpense)
router.post("/trackexpense",protect,ExpenseTracker)
router.get("/summary",getExpenseSummary)
module.exports = router