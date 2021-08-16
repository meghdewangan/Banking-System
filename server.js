const express = require('express');
const app = express();
const path = require('path')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const Transaction = require("./model/transaction");
const Account = require('./model/account')
mongoose.connect('mongodb://localhost:27017/bank-system',{useNewUrlParser:true,useCreateIndex:true,useUnifiedTopology:true})
const port = process.env.PORT || 3000 ;

const db = mongoose.connection;
db.on('error',console.log.bind(console,"connection error")) 
db.once("open", () => {
    console.log("Database connected")
})
mongoose.set('useFindAndModify', false);

app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))


app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

// update all

app.get('/', async(req,res) => {
    res.render('accounts/home')
})

app.get('/accounts/new',(req,res) => {
    res.render('accounts/new')
})
app.get('/accounts/transaction',async(req,res) => {
    const transaction = await Transaction.find().sort({
        Date: 'desc'})
    res.render('accounts/transaction',{transaction})
})

app.post('/accounts', async(req,res) => {
    const account = new Account(req.body.account);
    await account.save();
    console.log(req.body)
    res.redirect(`/accounts/${account.id}`)
})

app.get('/accounts',async(req,res) => {
    const accounts = await Account.find({});
 res.render('accounts/index',{accounts})
})

app.get('/accounts/:id',async(req,res) => {
    const {name} = req.params
        const transaction = await Transaction.find({name:name}).sort({
            Date: 'desc'}) 
    const account = await Account.findById(req.params.id);
    res.render('accounts/show',{account,transaction });
})
app.get('/accounts/:id/edit',async(req,res) => {
    const account = await Account.findById(req.params.id);
    res.render('accounts/edit',{account});
})
app.put('/accounts/:id',async(req,res) => {
    const {id} = req.params;
    const account = await Account.findByIdAndUpdate(id, {...req.body.account});
    res.redirect(`/accounts/${account.id}`);
});

app.post('/accounts/:id',(req,res) => {
    const id = req.params.id;
    const amt = req.body.account.deposit;
    Account.updateOne({_id:id}, {$inc:{balance:amt}}, () => {res.redirect(`/accounts/${id}`)});
    
})
app.get("/accounts/:id/transfer", async(req, res, next) => {
    const { id } = req.params;
    const cs = await Account.findById(id);
    const cus = await Account.find({});
    if (!cs || !cus) {
        res.send("User Not Found", 401);
    }
    res.render("accounts/transfer", { cus, cs });
});
app.post("/accounts/:id/transfer",async(req, res, next) => {
    const { sender, receiver, deposit } = req.body;
    const senderAc = await Account.findOne({_id:sender})
    const receiverAc = await Account.findOne({_id:receiver})
    console.log(sender, receiver, deposit)
    if (!senderAc || !receiverAc) {
        res.send("User Not Found", 401);
    }
    if (senderAc.balance > 0 && deposit < senderAc.balance && deposit > 0) {
            Account.updateOne({_id:sender},{$inc:{balance:-deposit}}, (err) => {
            Account.updateOne({_id:receiver},{$inc:{balance:deposit}}, async(err) => {
            const tran = new Transaction({ Date: Date(), amount: deposit, Description: `Paid Rs.${deposit} to ${receiverAc.name} from ${senderAc.name}`});
                await tran.save();
                res.redirect('/accounts')
        })
    }) } else if (deposit > senderAc.balance) {
        res.send("You Haven't enough Balance to make payment", 500);
    } else {
        res.send("Amount should be positive", 500);
    }
    
});


app.delete('/accounts/:id',async(req,res) => {
    const { id } = req.params;
    await Account.findByIdAndDelete(id);
    res.redirect('/accounts')
})

app.listen(port,() => {
    console.log('I AM ACTIVATED');
})