// routes/bankRoutes.js

const express = require("express");
const router = express.Router();
const { addCash, getAllCash } = require("../controllers/CashController");

// Route to add a new bank
router.post("/add", addCash);

// Route to get all banks
router.get("/all", getAllCash);

module.exports = router;
