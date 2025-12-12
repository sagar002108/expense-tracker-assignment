const router = require('express').Router();
const ExpenseSchema = require('../models/ExpenseModel');

router.post('/add-income', async (req, res) => {
    const {title, amount, category, description, date}  = req.body;
    const income = new ExpenseSchema({
        title, amount, category, description, date
    });

    try {
        if(!title || !category || !description || !date){
            return res.status(400).json({message: 'All fields are required!'})
        }
        if(amount <= 0 || !amount === 'number'){
            return res.status(400).json({message: 'Amount must be a positive number!'})
        }
        await income.save()
        res.status(200).json({message: 'Expense Added'})
    } catch (error) {
        res.status(500).json({message: 'Server Error'})
    }
});

router.get('/get-incomes', async (req, res) =>{
    try {
        const incomes = await ExpenseSchema.find().sort({createdAt: -1})
        res.status(200).json(incomes)
    } catch (error) {
        res.status(500).json({message: 'Server Error'})
    }
});

router.delete('/delete-income/:id', async (req, res) =>{
    const {id} = req.params;
    try {
        await ExpenseSchema.findByIdAndDelete(id)
        res.status(200).json({message: 'Expense Deleted'})
    } catch (error) {
        res.status(500).json({message: 'Server Error'})
    }
})

module.exports = router;