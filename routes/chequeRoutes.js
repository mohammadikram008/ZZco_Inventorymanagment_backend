const express = require('express');
const router = express.Router();
const {  getCheques, updateChequeStatus } = require('../controllers/chequeController');
const protect = require("../middleware/authMiddleware");


router.get('/pending', protect, getCheques);
router.patch('/update-status/:id', protect, updateChequeStatus);

module.exports = router;