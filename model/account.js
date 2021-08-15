const mongoose = require('mongoose')
const Transaction = require("./transaction");
const Schema = mongoose.Schema;

const BankAccountSchema = new Schema({

    name: String,
    bankName: String,
    accountNumber: Number,
    accountType:String,
    branch: String,
    city: String,
    email:String,
    balance: Number,
    address: String,
    contactNumber: Number,
    deposit: Number,
});


module.exports = mongoose.model('account', BankAccountSchema)