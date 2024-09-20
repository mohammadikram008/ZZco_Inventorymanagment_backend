const asyncHandler = require("express-async-handler");
const Warehouse = require("../models/WareHouseModel");
const Product = require("../models/productModel");

// Add Warehouse
const addWarehouse = asyncHandler(async (req, res) => {
  const { name, location } = req.body;

  if (!name || !location) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  const warehouse = await Warehouse.create({
    name,
    location,
  });

  res.status(201).json(warehouse);
});

// Get All Warehouses
const getAllWarehouses = asyncHandler(async (req, res) => {
  const warehouses = await Warehouse.find().sort("-createdAt");
  res.status(200).json(warehouses);
});

// Get Single Warehouse
const getWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) {
    res.status(404);
    throw new Error("Warehouse not found");
  }
  res.status(200).json(warehouse);
});

// Update Warehouse
const updateWarehouse = asyncHandler(async (req, res) => {
  const { name, location } = req.body;
  const { id } = req.params;

  const warehouse = await Warehouse.findById(id);

  if (!warehouse) {
    res.status(404);
    throw new Error("Warehouse not found");
  }

  const updatedWarehouse = await Warehouse.findByIdAndUpdate(
    id,
    {
      name,
      location,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedWarehouse);
});

// get warehouse with product
const getProductsByWarehouse = asyncHandler(async (req, res) => {
  const warehouseId = req.params.id;
  const products = await Product.find({ warehouse: warehouseId })

    .populate("warehouse", "name location")
    .sort("-createdAt");
  console.log("products", products);
  if (products.length === 0) {
    res.status(404);
    res.status(200).json({ message: "No products found for this warehouse" });
  }

  res.status(200).json(products);
});
// Delete Warehouse
const deleteWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) {
    res.status(404);
    throw new Error("Warehouse not found");
  }
  await warehouse.remove();
  res.status(200).json({ message: "Warehouse deleted successfully" });
});

module.exports = {
  addWarehouse,
  getAllWarehouses,
  getWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getProductsByWarehouse
};