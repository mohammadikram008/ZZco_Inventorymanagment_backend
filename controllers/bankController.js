// controllers/bankController.js

const asyncHandler = require("express-async-handler");
const Bank = require("../models/Bank"); // Correctly import the Bank model

// Add a new bank
const addBank = asyncHandler(async (req, res) => {
  const { bankName, amount } = req.body;

  // Validation
  if (!bankName || amount === undefined) {
    res.status(400);
    throw new Error("Please provide both bank name and amount");
  }

  // Create a new bank entry
  const bank = await Bank.create({
    bankName,
    amount,
  });

  if (bank) {
    res.status(201).json(bank);
  } else {
    res.status(400);
    throw new Error("Invalid bank data");
  }
});


// Get all banks
const getAllBanks = asyncHandler(async (req, res) => {
    try {
      const banks = await Bank.find();
      res.status(200).json(banks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching banks", error });
    }
  });

module.exports = {
  addBank,
  getAllBanks,
};
