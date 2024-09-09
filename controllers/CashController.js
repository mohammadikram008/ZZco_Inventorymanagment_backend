// controllers/bankController.js

const asyncHandler = require("express-async-handler");
const Cash = require("../models/Cash"); // Correctly import the Bank model

// Add a new bank
const addCash = asyncHandler(async (req, res) => {
  const {amount } = req.body;

  // Validation
  if ( amount === undefined) {
    res.status(400);
    throw new Error("Please provide  amount");
  }

  // Create a new bank entry
  const cash= await Cash.create({
    date:new Date(),
    amount,
  });

  if (cash) {
    res.status(201).json(cash);
  } else {
    res.status(400);
    throw new Error("Invalid Cash data");
  }
});


// Get all banks
const getAllCash = asyncHandler(async (req, res) => {
    try {
      const cashs = await Cash.find();
      res.status(200).json(cashs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching Cash", error });
    }
  });

module.exports = {
  addCash,
  getAllCash,
};
