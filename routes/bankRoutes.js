const express = require("express");
const router = express.Router();
const { addBank, getAllBanks, deleteBank, updateBank ,getTransactionHistory} = require("../controllers/bankController");
const protect = require("../middleWare/authMiddleware"); // Use lowercase 'middleware'
const checkPrivileges = require("../middleWare/checkPrivileges"); // Use lowercase 'middleware'

// Route to add a new bank (requires authentication)
router.post("/add", protect, addBank);

// Route to get all banks (requires authentication)
router.get("/all", protect, getAllBanks);

// Route to delete a bank (requires authentication and delete privilege)
router.delete("/delete/:id", protect, checkPrivileges("deleteBank"), deleteBank);

// Route to update a bank (requires authentication)
router.put("/update/:id", protect, updateBank);

router.get("/:id/transactions", protect, getTransactionHistory); // New route for transaction history

module.exports = router;
