// routes/bankRoutes.js

const express = require("express");
const router = express.Router();
const { addCash, getAllCash ,getCurrentTotalBalance , updateCash, 
    deleteCash } = require("../controllers/CashController");

// Route to add a new bank
router.post("/add", addCash);

// Route to get all banks
// router.get("/all", getAllCash);
router.get("/all", getCurrentTotalBalance);


router.put('/update/:id', updateCash);

// Delete a cash entry by ID
router.delete('/delete/:id', deleteCash);


module.exports = router;
