const express = require("express");
const router = express.Router();
const {
  registerCustomer,
  GetAllCustomer,
  addBalance,
  minusBalance,
  deleteUser,
  getTransactionHistory,
} = require("../controllers/customerController");
const protect = require("../middleWare/authMiddleware");

// Multer for handling file uploads
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Customer registration should not be protected
router.post("/customerResgister", registerCustomer);

// Protected routes
router.get("/allcustomer", protect, GetAllCustomer);

// Balance-related routes with Multer for file uploads
router.post("/add-customer-balance/:id", protect, upload.single("image"), addBalance);
router.post("/minus-customer-balance/:id", protect, upload.single("image"), minusBalance);


// Other customer-related routes
// Updated delete route for customer
router.delete("/delete-customer/:id", protect, deleteUser);

router.get("/transactionHistory/:id", protect, getTransactionHistory);

module.exports = router;
