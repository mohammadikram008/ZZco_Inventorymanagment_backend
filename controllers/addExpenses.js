const asyncHandler = require("express-async-handler");
const Expense = require("../models/addExpensesModel");

// Add a new expense
const addExpense = asyncHandler(async (req, res) => {
  const { expenseName, amount, description } = req.body;

  // Validation
  if (!expenseName || amount === undefined || !description) {
    res.status(400);
    throw new Error("Please provide expense name, amount, and description");
  }

  // Create a new expense entry
  const expense = await Expense.create({
    expenseName,
    amount,
    description,
  });

  if (expense) {
    res.status(201).json(expense);
  } else {
    res.status(400);
    throw new Error("Invalid expense data");
  }
});

// Get all expenses
const getAllExpenses = asyncHandler(async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error });
  }
});

module.exports = {
  addExpense,
  getAllExpenses,
};
