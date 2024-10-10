const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Manager = require("../models/Manager"); // Import Manager model
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    // Retrieve token from cookies or Authorization header
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      // If no token is found, respond with an authorization error
      return res.status(401).json({ message: "Not authorized, please login" });
    }

    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ message: "Internal server error, missing configuration" });
    }

    // Decode and verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debug: Log token content

    // Find user in either User or Manager collections based on decoded ID
    const user = await User.findById(decoded.id).select("-password") || await Manager.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found, unauthorized" });
    }

    // Attach user or manager to request and proceed
    req.user = user;
    next();
  } catch (error) {
    console.error("Authorization error:", error.message); // Improved error logging

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token, authorization denied" });
    } else {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }
});

module.exports = protect;
