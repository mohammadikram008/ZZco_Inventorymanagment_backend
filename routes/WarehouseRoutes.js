const express = require("express");
const router = express.Router();
const {
  addWarehouse,
  getAllWarehouses,
  getWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getProductsByWarehouse 
} = require("../controllers/wareHouseController");
const protect = require("../middleWare/authMiddleware");

router.post("/", protect, addWarehouse);
router.get("/", protect, getAllWarehouses);
router.get("/:id", protect, getWarehouse);
router.get("/allproducts/:id", protect, getProductsByWarehouse);
router.patch("/:id", protect, updateWarehouse);
router.delete("/:id", protect, deleteWarehouse);

module.exports = router;