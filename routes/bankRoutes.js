// routes/bankRoutes.js

const express = require("express");
const router = express.Router();
const { addBank, getAllBanks, deleteBank, updateBank } = require("../controllers/bankController");

// Route to add a new bank
router.post("/add", addBank);

// Route to get all banks
router.get("/all", getAllBanks);


// Delete a bank
router.delete("/delete/:id", deleteBank);

// Update a bank
router.put('/update/:id', updateBank);
module.exports = router;
