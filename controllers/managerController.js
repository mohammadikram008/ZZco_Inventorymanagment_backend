const asyncHandler = require("express-async-handler");
const Manager = require("../models/Manager");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register Manager
const registerManager = asyncHandler(async (req, res) => {
    const { username,  phone, privileges } = req.body;
  
    if (!username   ) {
      res.status(400);
      throw new Error("Please fill in all required fields");
    }
  
  
  
    const manager = await Manager.create({
      username,
      
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
