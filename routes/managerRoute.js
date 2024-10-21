const express = require("express");
const router = express.Router();
const {
    registerManager,
    GetAllManager,
} = require("../controllers/managerController");
const protect = require("../middleware/authMiddleware");

// Manager registration route
router.post("/managerRegister", registerManager);

// Get all managers (protected route)
router.get("/allmanager", protect, GetAllManager);

module.exports = router;
