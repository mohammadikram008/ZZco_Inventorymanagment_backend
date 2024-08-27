const express = require("express");
const router = express.Router();
const {
  registerCustomer,
  GetAllCustomer,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  addBalance,
  minusBalance,
  deleteUser,
  getTransactionHistory
} = require("../controllers/customerController");
const protect = require("../middleWare/authMiddleware");

router.post("/customerResgister", registerCustomer);
router.get("/allcustomer", GetAllCustomer);

router.post("/add-customer-balance/:id", addBalance);
router.post("/minus-customer-balance/:id", minusBalance);
router.delete("/Delete-customers/:id", deleteUser);
router.get("/transactionHistory/:id", getTransactionHistory);

// router.post("/login", loginUser);
// router.get("/logout", logout);
// router.get("/getuser", protect, getUser);
// router.get("/loggedin", loginStatus);
// router.patch("/updateuser", protect, updateUser);
// router.patch("/changepassword", protect, changePassword);
// router.post("/forgotpassword", forgotPassword);
// router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;
