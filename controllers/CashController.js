// controllers/bankController.js

const asyncHandler = require("express-async-handler");
const Cash = require("../models/Cash"); // Correctly import the Bank model

// Add a new bank
const addCash = asyncHandler(async (req, res) => {
  const { balance } = req.body;
  const type = "add";
  // Validation
  if (balance === undefined) {
    res.status(400);
    throw new Error("Please provide Balance and Type (add/deduct)");
  }

  // Get the latest total balance
  const latestCash = await Cash.findOne().sort({ createdAt: -1 });
  let currentTotalBalance = 0;
  if (latestCash && latestCash.totalBalance !== undefined) {
    currentTotalBalance = latestCash.totalBalance;
  }
  // Ensure balance is a number
  const numericBalance = Number(balance);
  if (isNaN(numericBalance)) {
    throw new Error("Balance must be a valid number");
  }

  // Calculate new total balance
  let newTotalBalance;
  if (type === 'add') {
    newTotalBalance = currentTotalBalance + numericBalance;
  } else if (type === 'deduct') {
    newTotalBalance = currentTotalBalance - numericBalance;
  } else {
    throw new Error("Invalid type. Must be 'add' or 'deduct'");
  }
  console.log("New total balance:", newTotalBalance);

  // Create a new cash entry
  const cash = await Cash.create({
    balance,
    totalBalance: newTotalBalance,
    type,
  });

  if (cash) {
    res.status(201).json({ message: "Cash added successfully", cash });
  } else {
    res.status(400);
    throw new Error("Invalid Cash data");
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

module.exports = {
  addCash,
  getAllCash,
  getCurrentTotalBalance
};
