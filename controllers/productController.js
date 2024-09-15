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

// Get single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('warehouse', 'name');
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
  // Create a new object with the product data and the warehouse name
  const productWithWarehouseName = {
    ...product.toObject(),
    warehouseName: product.warehouse ? product.warehouse.name : null
  };
  res.status(200).json(productWithWarehouseName);
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

// Update Product
// Update Product
const updateProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description, paymentMethod, chequeDate, bank, warehouse, status } = req.body;
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

  // Validation
  if (!name || !category || !quantity || !price || !paymentMethod || !warehouse) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Additional validation for payment method specific fields
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

  // Update Product
  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    {
      name,
      sku,
      category,
      quantity,
      price,
      description,
      image: Object.keys(fileData).length === 0 ? product.image : fileData,
      paymentMethod,
      chequeDate: paymentMethod === "cheque" ? chequeDate : undefined,
      bank: paymentMethod === "online" ? bank : undefined,
      warehouse,
      status
    },
    {
      new: true,
      runValidators: true,
    }
  );

  // Handle payment method changes
  const totalAmount = updatedProduct.price * updatedProduct.quantity;

  if (paymentMethod === 'online') {
    if (!bank) {
      throw new Error('Bank ID is required for online payments');
    }
    const bankAccount = await Bank.findById(bank);
    if (!bankAccount) {
      throw new Error('Bank not found');
    }
    if (bankAccount.balance < totalAmount) {
      throw new Error('Insufficient funds in the bank account');
    }
    bankAccount.balance -= totalAmount;
    await bankAccount.save();
  } else if (paymentMethod === 'cash') {
    const cash = await Cash.findOne();
    if (!cash) {
      throw new Error('Cash account not found');
    }
    if (cash.balance < totalAmount) {
      throw new Error('Insufficient cash');
    }
    cash.balance -= totalAmount;
    await cash.save();
  }

  res.status(200).json(updatedProduct);
});


module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
};
