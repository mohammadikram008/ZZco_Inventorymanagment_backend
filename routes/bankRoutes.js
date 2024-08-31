// routes/bankRoutes.js

const express = require("express");
const router = express.Router();
const { addBank, getAllBanks } = require("../controllers/bankController");

// Route to add a new bank
router.post("/add", addBank);

// Route to get all banks
router.get("/all", getAllBanks);

module.exports = router;
