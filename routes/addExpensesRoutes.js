const express = require("express");
const router = express.Router();
const { addExpense, getAllExpenses } = require("../controllers/addExpenses");

// Route to add a new expense
router.post("/add", addExpense);

// Route to get all expenses
router.get("/all", getAllExpenses);

module.exports = router;
