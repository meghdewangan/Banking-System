const mongoose = require("mongoose");
const Account = require("./model/account");

mongoose.connect("mongodb://localhost:27017/bank-system", { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        console.log("connected");
    })
    .catch((err) => {
        console.log("error", err);
    })

const db = async () => {
    await Account.deleteMany({});
    await Account.insertMany([

    ]);
};

db();