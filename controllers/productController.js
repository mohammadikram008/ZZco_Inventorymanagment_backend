const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;
const Bank = require('../models/Bank');
const Cash = require('../models/Cash');
// Create Prouct
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const createProduct = asyncHandler(async (req, res) => {
  console.log(req.body); // Log the request body to debug the incoming data

  const { name, category, quantity, price, paymentMethod, chequeDate, bank, warehouse, shippingType, status } = req.body;

  // Ensure the required fields are filled
  if (!name || !category || !quantity || !price || !paymentMethod || !shippingType) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Validate warehouse for local shipping
  if (shippingType === "local" && !warehouse) {
    res.status(400);
    throw new Error("Warehouse is required for local shipping");
  }

  // Handle other validations
  if (paymentMethod === "cheque" && !chequeDate) {
    res.status(400);
    throw new Error("Cheque date is required for cheque payments");
  }

  if (paymentMethod === "online" && !bank) {
    res.status(400);
    throw new Error("Bank is required for online payments");
  }

  // Handle Image upload
  let fileData = {};
  if (req.file) {
    fileData = {
      fileName: req.file.filename,
      filePath: req.file.path.replace(/\\/g, "/"),
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    };
  }

  // Create Product
  const product = await Product.create({
    user: req.user.id,
    name,
    category,
    quantity,
    price,
    image: fileData,
    paymentMethod,
    chequeDate: paymentMethod === "cheque" ? chequeDate : undefined,
    bank: paymentMethod === "online" ? bank : undefined,
    warehouse: shippingType === "local" ? warehouse : undefined,
    shippingType,
    status,
  });

  res.status(201).json({ message: "Product created successfully", product });
});




// Get all Products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user.id }).sort("-createdAt");
  res.status(200).json(products);
});
 
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('warehouse', 'name');

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  res.status(200).json({
    ...product.toObject(),
    warehouseName: product.warehouse ? product.warehouse.name : null,
    totalShipped: product.totalShipped, // Add total shipped quantity
    receivedQuantity: product.receivedQuantity, // Add received quantity
    remainingInShipping: product.totalShipped - product.receivedQuantity, // Calculate remaining products in shipping
  });
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  // if product doesnt exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await product.remove();
  res.status(200).json({ message: "Product deleted." });
});

 
 
// Update Product Controller for shipping and stock management
const updateProduct = asyncHandler(async (req, res) => {
  const { name, category, quantity, price, paymentMethod, shippingType, status, totalShipped, receivedQuantity } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);

  // if product doesn't exist
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Match product to its user
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // Validation for required fields
  if (!name || !category || !quantity || !price || !paymentMethod || !shippingType) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Handle updating shipping quantities
  let newTotalShipped = totalShipped || product.totalShipped;
  let newReceivedQuantity = receivedQuantity || product.receivedQuantity;

  if (newReceivedQuantity > newTotalShipped) {
    res.status(400);
    throw new Error("Received quantity cannot exceed total shipped products.");
  }

  // Update Product details
  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    {
      name,
      category,
      quantity,
      price,
      paymentMethod,
      shippingType,
      status,
      totalShipped: newTotalShipped, // Update total shipped quantity
      receivedQuantity: newReceivedQuantity, // Update received quantity
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedProduct);
});

// Controller to handle product receiving
const receiveProduct = asyncHandler(async (req, res) => {
  const { receivedQuantity } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (receivedQuantity > product.totalShipped) {
    res.status(400);
    throw new Error("Received quantity cannot exceed shipped quantity");
  }

  product.receivedQuantity = receivedQuantity;

  const updatedProduct = await product.save();

  res.status(200).json(updatedProduct);
});


const updateReceivedQuantity = asyncHandler(async (req, res) => {
  const { receivedQuantity } = req.body; // New received quantity to update
  const { id } = req.params; // Product ID from request params

  const product = await Product.findById(id); // Find the product by its ID

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const totalShipped = product.totalShipped; // Total products currently in shipping
  const currentReceivedQuantity = product.receivedQuantity || 0; // Current received quantity (default 0)
  
  const newTotalReceived = parseInt(receivedQuantity); // Quantity received from the user input
  const remainingInShipping = totalShipped - newTotalReceived; // Remaining quantity still in shipping

  // Ensure that the received quantity does not exceed the total shipped quantity
  if (newTotalReceived > totalShipped) {
    return res.status(400).json({ message: "Received quantity cannot exceed shipped quantity." });
  }

  // Update product with new quantities
  product.receivedQuantity = currentReceivedQuantity + newTotalReceived; // Increase received quantity
  product.totalShipped = remainingInShipping; // Decrease total shipped by the received amount

  await product.save(); // Save the updated product

  res.status(200).json({
    message: "Received quantity updated successfully",
    product,
    inStock: product.receivedQuantity, // Show the updated received quantity as in stock
    inShipping: product.totalShipped, // Show the updated remaining quantity in shipping
  });
});



module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  receiveProduct,
  updateReceivedQuantity
};
