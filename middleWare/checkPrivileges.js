// middleware/checkPrivileges.js
const asyncHandler = require("express-async-handler");
const Manager = require("../models/Manager");

const checkPrivileges = (privilege) => asyncHandler(async (req, res, next) => {
  const userRole = req.user.role; // Assuming `req.user.role` is set to either 'admin' or 'manager'
  const userId = req.user._id;

  if (userRole === "admin") {
    // If the user is an admin, bypass the privilege check
    return next();
  }

  // If the user is a manager, perform the privilege check
  if (userRole === "manager") {
    const manager = await Manager.findById(userId);
    if (!manager) {
      return res.status(401).json({ message: "Manager not found, unauthorized" });
    }

    // Check if the manager has the required privilege
    if (manager.privileges[privilege] !== true) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
  } else {
    // Unauthorized role
    return res.status(401).json({ message: "Unauthorized role" });
  }

  next(); // Proceed to the delete handler if permission is granted
});

module.exports = checkPrivileges;
