const express = require("express");
const router = express.Router();
const {
    AddSale,
    GetAllSale
  
} = require("../controllers/salesController");
const protect = require("../middleWare/authMiddleware");

router.post("/", AddSale);
router.get("/allsales", GetAllSale);
// router.post("/login", loginUser);
// router.get("/logout", logout);
// router.get("/getuser", protect, getUser);
// router.get("/loggedin", loginStatus);
// router.patch("/updateuser", protect, updateUser);
// router.patch("/changepassword", protect, changePassword);
// router.post("/forgotpassword", forgotPassword);
// router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;
