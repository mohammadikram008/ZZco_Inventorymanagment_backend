const express = require('express');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");

const { getAllSuppliers, createSupplier, addTransaction, getTransactionHistory, deleteSupplier, } = require('../controllers/supplierController');

router.get('/', protect, getAllSuppliers);  // Get all suppliers
router.post('/add', protect, createSupplier);  // Create a new supplier
router.post('/:id/transaction', protect, addTransaction);  // Add a transaction (credit/debit)
router.get('/:id/transaction-history', protect, getTransactionHistory);  // Get transaction history for a supplier
 

// Add this DELETE route for deleting a supplier
router.delete('/delete/:id', protect, deleteSupplier); // DELETE supplier by id
module.exports = router;
