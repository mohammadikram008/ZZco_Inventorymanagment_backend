const express = require("express");
const router = express.Router();
const {
  registerCustomer,
  GetAllCustomer,
  addBalance,
  minusBalance,
  deleteUser,
  getTransactionHistory,
  addSaleTransaction,  // Importing the function to handle sale transactions
} = require("../controllers/customerController");

const protect = require("../middleWare/authMiddleware");
const checkPrivileges = require("../middleWare/checkPrivileges"); // As per your specified path

// Multer setup for handling file uploads (e.g., images for transactions)
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Customer registration route (public access, no protection needed)
router.post("/customerRegister", registerCustomer);

// Protected routes (only accessible when logged in)

// Fetch all customers (admin or protected access)
router.get("/allcustomer", protect, GetAllCustomer);

// Balance-related routes with Multer for file uploads
router.post("/add-customer-balance/:id", protect, upload.single("image"), addBalance);
router.post("/minus-customer-balance/:id", protect, upload.single("image"), minusBalance);

// Route to delete a customer (requires specific privileges)
router.delete("/delete-customer/:id", protect, checkPrivileges("deleteCustomer"), deleteUser);

// Route to fetch transaction history for a customer
router.get("/transactionHistory/:id", protect, getTransactionHistory);

// Route to record a sale transaction as credit in the customer's ledger
// This should be called whenever a sale is recorded
router.post("/sale-transaction", protect, addSaleTransaction);

// Export the router module for use in other parts of the application
module.exports = router;
