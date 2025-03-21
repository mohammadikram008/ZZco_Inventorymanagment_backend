const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;
const Bank = require('../models/Bank');
const Cash = require('../models/Cash');
const Supplier = require('../models/supplier');
const History = require('../models/history');
 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const createProduct = asyncHandler(async (req, res) => {
   
 
  const { name, category, quantity, price,image, description, paymentMethod, chequeDate, bank, warehouse, shippingType, supplier, status } = req.body;

  // Ensure the required fields are filled
  if (!name || !category || !quantity || !price ||!description|| !paymentMethod || !shippingType || !supplier) {
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
    description,
    image: fileData, // Optional image field
    paymentMethod,
    chequeDate: paymentMethod === "cheque" ? chequeDate : undefined, // Include only if payment method is cheque
    bank: paymentMethod === "online" || paymentMethod === "cheque" ? bank : undefined, // Save bank for both online and cheque payments
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
    bankAccount.transactions.push({
      amount: totalAmount,
      type: 'deduct', // Indicate that this is a deduction
    });
    await bankAccount.save()  } 
    else if (paymentMethod === 'cash') {
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
// Get all Products without user filtering
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate('supplier', 'username').sort("-createdAt"); // Populate supplier details
  console.log(products);
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



const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Adjust authorization to allow Admins and Managers
  if (product.user.toString() !== req.user.id && !['Admin', 'Manager'].includes(req.user.role)) {
    res.status(401);
    throw new Error("User not authorized");
  }

  // Proceed with the rest of the update logic as usual
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      // your product update fields here
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
