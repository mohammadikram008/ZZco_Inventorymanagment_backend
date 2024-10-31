const express = require("express");
const router = express.Router();
const { addCash, getAllCash, getCurrentTotalBalance, updateCash, deleteCash } = require("../controllers/CashController");
const protect = require("../middleWare/authMiddleware"); // As per your specified path
const checkPrivileges = require("../middleWare/checkPrivileges"); // As per your specified path

// Route to add a new cash entry (requires authentication)
router.post("/add", protect, addCash);

// Route to get all cash entries (requires authentication)
router.get("/all",  getCurrentTotalBalance);

// Route to update a cash entry (requires authentication)
router.put("/update/:id", protect, updateCash);

// Route to delete a cash entry by ID (requires authentication and delete privilege)
router.delete("/delete/:id", protect, checkPrivileges("deleteCash"), deleteCash);

module.exports = router;
