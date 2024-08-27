const asyncHandler = require("express-async-handler");
const ManagerUser = require("../models/Manager");
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
const registerManager = asyncHandler(async (req, res) => {
    const { username, email, password ,phone} = req.body;
console.log("body",req.body);


    // Validation
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all required fields");
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be up to 6 characters");
    }

    // Check if user email already exists
    const userExists = await ManagerUser.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("Email has already been registered");
    }

    // Create new user
    const manager = await ManagerUser.create({
        username,
        email,
        password,
        phone
    });

    //   Generate Token
    const token = generateToken(manager._id);

    // Send HTTP-only cookie
    //   res.cookie("token", token, {
    //     path: "/",
    //     httpOnly: true,
    //     expires: new Date(Date.now() + 1000 * 86400), // 1 day
    //     sameSite: "none",
    //     secure: true,
    //   });

    if (user) {
        const { _id, name, email, phone, } = manager;
        res.status(201).json({
            _id,
            username,
            email,
            phone,
            token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid Manager data");
    }
});

// Get all Cutomser
const GetAllManager = asyncHandler(async (req, res) => {
    try {
        const managers = await ManagerUser.find(); 
        console.log("customers",managers);
        
        res.status(200).json(managers);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching Manager', error });
      }
})


module.exports = {
    registerManager,
    GetAllManager,
  
};
