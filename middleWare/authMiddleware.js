const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Token from cookies:", token); // Debug log

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verified token:", verified); // Debug log

    // Get user id from token
    const user = await User.findById(verified.id).select("-password");
    console.log("User found:", user); // Debug log

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authorization error:", error); // Log the error
    res.status(401).json({ message: "Not authorized, please login" });
  }
});


module.exports = protect;
