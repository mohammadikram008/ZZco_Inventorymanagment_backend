// middleware/checkPrivileges.js
const asyncHandler = require("express-async-handler");
const Manager = require("../models/Manager");

const checkPrivileges = (privilege) => asyncHandler(async (req, res, next) => {
  const managerId = req.user._id; // Assuming `req.user` has the logged-in manager's info after the `protect` middleware

  // Retrieve the manager from the database
  const manager = await Manager.findById(managerId);
  if (!manager) {
    return res.status(401).json({ message: "Manager not found, unauthorized" });
  }

  // Check if the manager has the specific delete privilege
  if (manager.privileges[privilege] !== true) {
    return res.status(403).json({ message: "You do not have permission to perform this action" });
  }

  next(); // Proceed to the delete handler if permission is granted
});

module.exports = checkPrivileges;
