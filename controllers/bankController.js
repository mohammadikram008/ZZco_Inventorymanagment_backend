// controllers/bankController.js

const asyncHandler = require("express-async-handler");
const Bank = require("../models/Bank"); // Correctly import the Bank model
const Transaction = require("../models/Transaction"); // Import the Transaction model

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
    transactions: [{ amount, type: 'add' }], // Add transaction to the bank's history

  });  
 // Create a transaction entry
//  await Transaction.create({
//   bankId: bank._id,
//   amount,
//   type: 'add',
// });

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
  // Push a new transaction into the bank's transactions array
  bank.transactions.push({
    amount: amount !== undefined ? amount - bank.balance : 0, // Record the change in balance
    type: 'update', // This indicates the type of transaction
  });
    const updatedBank = await bank.save();
    res.status(200).json(updatedBank);
  } else {
    res.status(404);
    throw new Error("Bank not found");
  }
});

const getTransactionHistory = asyncHandler(async (req, res) => {
  const bankId = req.params.id;

  const transactions = await Transaction.find({ bankId }).sort({ createdAt: -1 });

  if (transactions) {
    res.status(200).json(transactions);
  } else {
    res.status(404).json({ message: "No transactions found for this bank" });
  }
});


const addBankTransaction = asyncHandler(async (req, res) => {
  const bankId = req.params.id;
  const { amount, type, description } = req.body;

  const bank = await Bank.findById(bankId);
  if (!bank) {
    res.status(404);
    throw new Error("Bank not found");
  }

  const adjustedAmount = type === "add" ? amount : -Math.abs(amount);
  bank.balance += adjustedAmount;

  bank.transactions.push({
    amount,
    type,
    description,
  });

  // Optional: Save to Transaction model too
  await Transaction.create({
    bankId,
    amount,
    type,
    description,
  });

  await bank.save();
  res.status(200).json({ message: "Transaction recorded", bank });
});


module.exports = {
  addBank,
  getAllBanks,
  deleteBank,
  updateBank,
  getTransactionHistory,
  addBankTransaction,
};

