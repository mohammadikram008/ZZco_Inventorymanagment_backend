const express = require("express");
const router = express.Router();
const { addExpense, getAllExpenses } = require("../controllers/addExpenses");
const multer = require("multer");
const  upload  = require("../utils/fileUpload"); 
// Route to add a new expense
 
router.post("/add", upload.single("image"), addExpense);
// Route to get all expenses
router.get("/all", getAllExpenses);

module.exports = router;
