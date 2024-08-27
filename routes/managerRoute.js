const express = require("express");
const router = express.Router();
const {
    registerManager,
    GetAllManager,

} = require("../controllers/managerController");
const protect = require("../middleWare/authMiddleware");

router.post("/managerRegister", registerManager);
router.get("/allmanager", GetAllManager);
// router.post("/login", loginUser);
// router.get("/logout", logout);
// router.get("/getuser", protect, getUser);
// router.get("/loggedin", loginStatus);
// router.patch("/updateuser", protect, updateUser);
// router.patch("/changepassword", protect, changePassword);
// router.post("/forgotpassword", forgotPassword);
// router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;
