const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;
const Bank = require('../models/Bank');
const Cash = require('../models/Cash');
const Supplier = require('../models/Supplier');
const History = require('../models/history');

// Create Prouct
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const createProduct = asyncHandler(async (req, res) => {
  console.log(req.body); // Log the request body to debug the incoming data

  const { name, category, quantity, price, paymentMethod, chequeDate, bank, warehouse, shippingType, supplier, status } = req.body;

  // Ensure the required fields are filled
  if (!name || !category || !quantity || !price || !paymentMethod || !shippingType || !supplier) {
    res.status(400);
    throw new Error("Please fill in all required fields, including supplier.");
  }

  // Validate warehouse for local shipping
  if (shippingType === "local" && !warehouse) {
    res.status(400);
    throw new Error("Warehouse is required for local shipping.");
  }

  // Validate supplier
  const existingSupplier = await Supplier.findById(supplier);
  if (!existingSupplier) {
    res.status(400);
    throw new Error("Supplier not found.");
  }

  // Handle cheque validation
  if (paymentMethod === "cheque" && !chequeDate) {
    res.status(400);
    throw new Error("Cheque date is required for cheque payments.");
  }

  // Handle bank validation for online payments
  if (paymentMethod === "online" && !bank) {
    res.status(400);
    throw new Error("Bank is required for online payments.");
  }

  // Initialize totalShipped based on shipping type
  let totalShipped = 0;
  if (shippingType === "international") {
    totalShipped = parseInt(quantity); // Assume all items are shipped initially for international shipping
  }
  const initialQuantity = shippingType.toLowerCase() === 'international' ? 0 : quantity || 0;

  // Handle Image upload (optional)
  let fileData = {};
  if (req.file) {
    fileData = {
      fileName: req.file.filename,
      filePath: req.file.path.replace(/\\/g, "/"),
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    };
  }

  // Calculate the total product amount
  const totalAmount = price * quantity;

  // Create Product
  const product = await Product.create({
    user: req.user.id,
    name,
    category,
    quantity: initialQuantity,
    price: parseFloat(price), // Ensure price is stored as a number
    image: fileData, // Optional image field
    paymentMethod,
    chequeDate: paymentMethod === "cheque" ? chequeDate : undefined, // Include only if payment method is cheque
    bank: paymentMethod === "online" ? bank : undefined, // Include only if payment method is online
    warehouse: shippingType === "local" ? warehouse : undefined, // Include warehouse if shipping type is local
    shippingType,
    supplier, // Add the supplier to the product
    status,
    totalShipped: shippingType === "international" ? parseInt(quantity) : 0,
  });
  // Handle payment method (deducting balances)
  let debit = 0;
  let credit = totalAmount;
  let balance = 0;

  // Handle payment method (deducting balances)
  if (paymentMethod === 'online') {
    const bankAccount = await Bank.findById(bank);
    if (!bankAccount || bankAccount.balance < totalAmount) {
      throw new Error('Insufficient funds in the bank account.');
    }
    bankAccount.balance -= totalAmount;
    balance = bankAccount.balance;
    await bankAccount.save();
  } else if (paymentMethod === 'cash') {
    const latestCash = await Cash.findOne().sort({ createdAt: -1 });
    if (!latestCash || latestCash.totalBalance < totalAmount) {
      throw new Error('Insufficient cash.');
    }
    const newTotalBalance = latestCash.totalBalance - totalAmount;
    balance = newTotalBalance;
    await Cash.create({
      balance: -totalAmount,
      totalBalance: newTotalBalance,
      type: 'deduct',
    });
  }
  await History.create({
    user: req.user._id,
    action: 'ADD_PRODUCT',
    entityType: 'PRODUCT',
    entityId: product._id,
    amount: totalAmount,
    debit,
    credit,
    balance,
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
  console.log("Request Body for Update:", req.body); // Log the complete request body for debugging

  const {
    name,
    category,
    quantity,
    price,
    paymentMethod,
    shippingType,
    status,
    totalShipped,
    receivedQuantity,
    warehouse,
    chequeDate,
    bank,
  } = req.body;

  // Log each individual field
  console.log("Name:", name);
  console.log("Category:", category);
  console.log("Quantity:", quantity);
  console.log("Price:", price);
  console.log("Payment Method:", paymentMethod);
  console.log("Shipping Type:", shippingType);
  console.log("Warehouse:", warehouse);
  console.log("Cheque Date:", chequeDate);
  console.log("Bank:", bank);
  console.log("Supplier:", req.body.supplier); // Check for supplier if it's required

  // Check if product exists
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Authorization check
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // Required fields validation
  if (!name || !category || !quantity || !price || !paymentMethod || !shippingType) {
    console.log("Missing required field(s)");
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Conditional field validation
  if (shippingType === "local" && !warehouse) {
    console.log("Warehouse is required for local shipping");
    res.status(400);
    throw new Error("Warehouse is required for local shipping.");
  }
  if (paymentMethod === "cheque" && !chequeDate) {
    console.log("Cheque date is required for cheque payments");
    res.status(400);
    throw new Error("Cheque date is required for cheque payments.");
  }
  if (paymentMethod === "online" && !bank) {
    console.log("Bank is required for online payments");
    res.status(400);
    throw new Error("Bank is required for online payments.");
  }

  // Updating the product
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      name,
      category,
      quantity,
      price: parseFloat(price),
      paymentMethod,
      shippingType,
      status,
      warehouse: shippingType === "local" ? warehouse : undefined,
      chequeDate: paymentMethod === "cheque" ? chequeDate : undefined,
      bank: paymentMethod === "online" ? bank : undefined,
      totalShipped: totalShipped || product.totalShipped,
      receivedQuantity: receivedQuantity || product.receivedQuantity,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedProduct);
});




// Controller to handle product receiving
// const receiveProduct = asyncHandler(async (req, res) => {
//   const { receivedQuantity } = req.body;
//   const { id } = req.params;

//   const product = await Product.findById(id);

//   if (!product) {
//     res.status(404);
//     throw new Error("Product not found");
//   }

//   if (receivedQuantity > product.totalShipped) {
//     res.status(400);
//     throw new Error("Received quantity cannot exceed shipped quantity");
//   }

//   product.receivedQuantity = receivedQuantity;

//   const updatedProduct = await product.save();

//   res.status(200).json(updatedProduct);
// });

const updateReceivedQuantity = asyncHandler(async (req, res) => {
  const { receivedQuantity, warehouse } = req.body;
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (!warehouse) {
    return res.status(400).json({ message: "Warehouse is required" });
  }

  if (receivedQuantity > product.totalShipped) {
    return res.status(400).json({ message: "Received quantity cannot exceed total shipped quantity" });
  }

  // Update the product's quantities
  product.totalShipped -= receivedQuantity;
  product.receivedQuantity = (product.receivedQuantity || 0) + receivedQuantity;
  product.quantity += receivedQuantity;
  product.warehouse = warehouse;

  // Save the updated product
  await product.save();
  await History.create({
    user: req.user._id,
    action: 'RECEIVE_PRODUCT',
    entityType: 'PRODUCT',
    entityId: product._id,
    amount: 0,
    quantity: receivedQuantity,
    debit: 0,
    credit: 0,
    balance: 0, // You may want to update this based on your business logic
  });
  res.status(200).json({
    message: "Received quantity updated successfully",
    product: {
      ...product.toObject(),
      remainingInShipping: product.totalShipped - product.receivedQuantity,
    }
  });
});



module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  // receiveProduct,
  updateReceivedQuantity
};
