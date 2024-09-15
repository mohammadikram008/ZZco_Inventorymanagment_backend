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
    balance:amount,
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

  // Delete a bank by ID
const deleteBank = asyncHandler(async (req, res) => {
  const bankId = req.params.id;

  const bank = await Bank.findByIdAndDelete(bankId);

  if (bank) {
    res.status(200).json({ message: "Bank deleted successfully" });
  } else {
    res.status(404);
    throw new Error("Bank not found");
  }
});


// Update a bank by ID
const updateBank = asyncHandler(async (req, res) => {
  const { bankName, amount } = req.body;
  const bankId = req.params.id;

  const bank = await Bank.findById(bankId);

  if (bank) {
    bank.bankName = bankName || bank.bankName;
    bank.balance = amount !== undefined ? amount : bank.balance;

    const updatedBank = await bank.save();
    res.status(200).json(updatedBank);
  } else {
    res.status(404);
    throw new Error("Bank not found");
  }
});


module.exports = {
  addBank,
  getAllBanks,
  deleteBank,
  updateBank,
};

