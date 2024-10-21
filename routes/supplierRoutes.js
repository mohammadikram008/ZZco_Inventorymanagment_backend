const express = require('express');
const router = express.Router();
const multer = require('multer');
const protect = require("../middleware/authMiddleware");
const checkPrivileges = require("../middleWare/checkPrivileges"); // Import privilege-checking middleware

const {
  getAllSuppliers,
  createSupplier,
  addTransaction,
  getTransactionHistory,
  deleteSupplier,
  minusBalance
} = require('../controllers/supplierController');

// Multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Get all suppliers
router.get('/', protect, getAllSuppliers);

// Create a new supplier
router.post('/add', protect, createSupplier);

// Add a transaction (credit/debit) with file uploads (e.g., cheque image)
router.post('/:id/transaction', protect, upload.single('image'), addTransaction);
router.post("/minus-supplier-balance/:id", protect, upload.single("image"), minusBalance);

// Get transaction history for a supplier
router.get('/:id/transaction-history', protect, getTransactionHistory);

// DELETE supplier by id (with privilege check)
router.delete('/delete/:id', protect, checkPrivileges("deleteSupplier"), deleteSupplier);

module.exports = router;
