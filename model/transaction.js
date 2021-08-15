const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    Date:Date,
    Description:String,
    seen: { type:Boolean,
            default:false
        }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;