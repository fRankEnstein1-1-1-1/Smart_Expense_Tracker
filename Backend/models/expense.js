const mongoose = require("mongoose")
const ExpenseSchema = mongoose.Schema({
    UserId :{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    title:{
        type:String
    },
    Amount:{
        type:Number
    },
    category:{
        type:String,
        enum:["Food", "Clothing", "Healthcare", "Transport", "Entertainment", "Utilities", "Household","Miscellaneous"],
        default:"Miscellaneous"
    },
    billImage:{
        type:String
    },
    items:[
    {
            name:String,
            price:Number,
    }
    ],
    date:{
        type:Date,
        default:Date.now()
    }

})
module.exports = mongoose.model("Expense",ExpenseSchema);