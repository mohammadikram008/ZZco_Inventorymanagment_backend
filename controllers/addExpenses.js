const asyncHandler = require("express-async-handler");
const Expense = require("../models/addExpensesModel");

const addExpense = asyncHandler(async (req, res) => {
  console.log("🔍 Incoming Expense Data:", req.body); // ✅ Debugging log

  const { expenseName, amount, description, paymentMethod, bankID, chequeDate } = req.body;

  if (!expenseName || !amount || !description) {
      return res.status(400).json({ message: "Please provide valid expense name, amount, and description" });
  }

  let fileData = {};
  if (req.file) {
      fileData = {
          fileName: req.file.filename,
          filePath: req.file.path.replace(/\\/g, "/"),
          fileType: req.file.mimetype,
          fileSize: req.file.size,
      };
  }

  // 🚨 Ensure `amount` is stored as negative
  const expense = await Expense.create({
      expenseName: expenseName.trim(),
      amount: -Math.abs(parseFloat(amount)), // ✅ Always store expenses as negative
      description: description.trim(),
      paymentMethod: paymentMethod || "cash", // ✅ Ensure payment method is stored
      chequeDate: chequeDate || null,
      bankID: bankID || null,
      image: fileData,
  });

  console.log("✅ Expense Created:", expense); // ✅ Debugging log
  res.status(201).json(expense);
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
