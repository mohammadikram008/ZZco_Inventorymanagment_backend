const express = require("express");
const router = express.Router();
const { AddSale, GetAllSale } = require("../controllers/salesController");
const protect = require("../middleWare/authMiddleware");
const { upload } = require("../utils/fileUpload"); // Assuming you have a fileUpload.js as configured

// Use the upload middleware for image handling
router.post("/", protect, upload.single("image"), AddSale);
router.get("/allsales", protect, GetAllSale);

module.exports = router;
