const express = require('express');
const router = express.Router();
const protect = require("../middleWare/authMiddleware");

const { getAllSuppliers, createSupplier, addTransaction } = require('../controllers/supplierController');

router.get('/',protect, getAllSuppliers);
router.post('/add',protect, createSupplier);
router.post('/:id/transaction',protect, addTransaction);

module.exports = router;