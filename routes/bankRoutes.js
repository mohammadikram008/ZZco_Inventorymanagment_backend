const express = require("express");
const router = express.Router();
const { addBank, getAllBanks, deleteBank, updateBank } = require("../controllers/bankController");
const protect = require("../middleware/authMiddleware"); // Use lowercase 'middleware'
const checkPrivileges = require("../middleWare/checkPrivileges"); // Use lowercase 'middleware'

// Route to add a new bank (requires authentication)
router.post("/add", protect, addBank);

// Route to get all banks (requires authentication)
router.get("/all", protect, getAllBanks);

// Route to delete a bank (requires authentication and delete privilege)
router.delete("/delete/:id", protect, checkPrivileges("deleteBank"), deleteBank);

// Route to update a bank (requires authentication)
router.put("/update/:id", protect, updateBank);

module.exports = router;
