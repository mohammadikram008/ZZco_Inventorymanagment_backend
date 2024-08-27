const asyncHandler = require("express-async-handler");
const Sale = require("../models/Sale");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register Customer
const AddSale = asyncHandler(async (req, res) => {
    try {
        const sale = new Sale(req.body);
        await sale.save();
        res.status(201).json({ message: 'Sale added successfully!' });
      } catch (error) {
        console.error('Error adding sale:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
});

// Get all Cutomser
const GetAllSale = asyncHandler(async (req, res) => {
    try {
        const sale = await Sale.find(); 
        console.log("customers",sale);
        
        res.status(200).json(sale);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching Sales', error });
      }
})



module.exports = {
    AddSale,
    GetAllSale
};
