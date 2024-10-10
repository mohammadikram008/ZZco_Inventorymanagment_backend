const asyncHandler = require("express-async-handler");
const Manager = require("../models/Manager");
const jwt = require("jsonwebtoken");

// Register Manager
const registerManager = asyncHandler(async (req, res) => {
    const { username, email, password, phone, privileges } = req.body;
  
    if (!username || !email || !password) {
      res.status(400);
      throw new Error("Please fill in all required fields");
    }
  
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    const manager = await Manager.create({
      username,
      email,
      password: hashedPassword,
      phone,
      privileges: {
        deleteCustomer: privileges.deleteCustomer || false,
        deleteSupplier: privileges.deleteSupplier || false,
        deleteBank: privileges.deleteBank || false,
        deleteProduct: privileges.deleteProduct || false,
        deleteCheque: privileges.deleteCheque || false,
        deleteWarehouse: privileges.deleteWarehouse || false,
      },
    });
  
    res.status(201).json({
      message: "Manager registered successfully",
      manager,
    });
  });



// Get all Managers
const GetAllManager = asyncHandler(async (req, res) => {
  try {
    const managers = await Manager.find(); 
    res.status(200).json(managers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Manager', error });
  }
});

module.exports = {
  registerManager,
  GetAllManager,
};
