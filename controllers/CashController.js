// controllers/bankController.js

const asyncHandler = require("express-async-handler");
const Cash = require("../models/Cash"); // Correctly import the Bank model

// Add a new bank
const addCash = asyncHandler(async (req, res) => {
  const { balance, type } = req.body;

  // Validation for type and balance
  if (balance === undefined || (type !== 'add' && type !== 'deduct')) {
    return res.status(400).json({ message: "Please provide both balance and a valid type ('add' or 'deduct')" });
  }

  const latestCash = await Cash.findOne().sort({ createdAt: -1 });
  let currentTotalBalance = 0;
  
  if (latestCash && latestCash.totalBalance !== undefined) {
    currentTotalBalance = latestCash.totalBalance;
  }

  const numericBalance = Number(balance);
  if (isNaN(numericBalance)) {
    throw new Error("Balance must be a valid number");
  }

  let newTotalBalance;
  if (type === 'add') {
    newTotalBalance = currentTotalBalance + numericBalance;
  } else if (type === 'deduct') {
    newTotalBalance = currentTotalBalance - numericBalance;
  }

  const cash = await Cash.create({
    balance: numericBalance,
    totalBalance: newTotalBalance,
    type,
  });

  if (cash) {
    res.status(201).json({ message: "Cash entry created successfully", cash });
  } else {
    res.status(400).json({ message: "Error creating cash entry" });
  }
});






// Get all banks
const getAllCash = asyncHandler(async (req, res) => {
  try {
    const cashs = await Cash.find().sort({ createdAt: -1 });
    res.status(200).json(cashs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Cash", error });
  }
});
// Add this new function to get the current total balance
const getCurrentTotalBalance = asyncHandler(async (req, res) => {
  try {
    const latestCash = await Cash.findOne().sort({ createdAt: -1 });
    const currentTotalBalance = latestCash ? latestCash.totalBalance : 0;
    
    // Fetch all cash entries, sorted by createdAt in descending order
    const allCashEntries = await Cash.find().sort({ createdAt: -1 });

    res.status(200).json({
      totalBalance: currentTotalBalance,
      latestEntry: latestCash,
      allEntries: allCashEntries
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cash data", error });
  }
});

// Update a cash entry by ID
const updateCash = asyncHandler(async (req, res) => {
  const { balance, type } = req.body;

  console.log("Received balance:", balance); // Log balance for debugging
  console.log("Received type:", type);       // Log type for debugging

  if (balance === undefined || (type !== 'add' && type !== 'deduct')) {
    res.status(400);
    throw new Error("Please provide both balance and a valid type (add/deduct)");
  }

  // Find the cash entry by ID
  const cash = await Cash.findById(req.params.id);

  if (!cash) {
    res.status(404);
    throw new Error("Cash entry not found");
  }

  // Check if balance update is possible based on type
  if (type === "deduct") {
    // Ensure the deduction does not take the balance below zero
    if (cash.balance < Math.abs(balance)) {
      res.status(400);
      throw new Error("Insufficient balance for deduction");
    }
    // Deduct the balance
    cash.balance -= Math.abs(balance);
  } else if (type === "add") {
    // Add the balance for "add" type
    cash.balance += Math.abs(balance);
  }

  cash.type = type;

  await cash.save();

  res.status(200).json({ message: "Cash entry updated successfully", cash });
});






// Delete a cash entry by ID
const deleteCash = asyncHandler(async (req, res) => {
  const cashId = req.params.id;

  // Find the cash entry by ID
  const cash = await Cash.findById(cashId);

  if (!cash) {
    res.status(404);
    throw new Error("Cash entry not found");
  }

  // Get the latest total balance
  const latestCash = await Cash.findOne().sort({ createdAt: -1 });
  let currentTotalBalance = latestCash ? latestCash.totalBalance : 0;

  // Calculate the new total balance after deletion
  const newTotalBalance = cash.type === 'add'
    ? currentTotalBalance - cash.balance
    : currentTotalBalance + cash.balance;

  // Remove the cash entry
  await cash.remove();

  // Optionally: create a new entry for the total balance after deletion (if needed)

  res.status(200).json({ message: "Cash entry deleted successfully", newTotalBalance });
});



module.exports = {
  addCash,
  getAllCash,
  getCurrentTotalBalance,
  updateCash,
  deleteCash,
};

