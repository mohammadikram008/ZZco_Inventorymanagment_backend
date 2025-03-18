const asyncHandler = require("express-async-handler");
const Sale = require("../models/Sale");
const CustomerUser = require("../models/customer");
const Product = require("../models/productModel");

const Bank = require('../models/Bank');
const Cash = require('../models/Cash');
const { fileSizeFormatter } = require("../utils/fileUpload");
const History = require("../models/history");
const cloudinary = require("cloudinary").v2;
const Transaction = require("../models/Transaction"); 
const cashTransactionSchema = require("../models/cashTransactionModel"); 
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add Sale

const AddSale = asyncHandler(async (req, res) => {
    try {
      // Extract sale details from request body
      const { 
        productID, 
        customerID, 
        stockSold, 
        saleDate, 
        totalSaleAmount, 
        paymentMethod, 
        chequeDate, 
        bankID, 
        warehouseID, 
        status 
      } = req.body;
  
      // Validation: Check required fields
      if (!productID || !customerID || !stockSold || !saleDate || !totalSaleAmount || !paymentMethod) {
        return res.status(400).json({ message: "Please fill in all fields" });
      }
  
      // Fetch product details to check stock
      const product = await Product.findById(productID);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Check if stock is sufficient
      if (product.quantity < stockSold) {
        return res.status(400).json({ 
          message: `Only ${product.quantity} items are available. Cannot sell ${stockSold}.` 
        });
      }
  
      // ✅ Safe stock update (avoid validation errors)
      await Product.findByIdAndUpdate(
        productID,
        { $inc: { quantity: -stockSold } },
        { new: true }
      );
  
      // Handle Image upload (if any)
      let fileData = {};
      if (req.file) {
        fileData = {
          fileName: req.file.filename,
          filePath: req.file.path.replace(/\\/g, "/"),
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        };
      }
  
      // Create Sale
      const sale = new Sale({
        productID,
        customerID,
        stockSold,
        saleDate,
        totalSaleAmount,
        paymentMethod,
        chequeDate,
        bankID,
        warehouseID,
        image: fileData,
        status
      });
  
      await sale.save();
  
      // Calculate total sale value
      const totalAmount = stockSold * totalSaleAmount;
  
      // Fetch customer details
      const customer = await CustomerUser.findById(customerID);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
  
      // Create transaction record for the customer
      const transaction = {
        productName: product.name, 
        amount: parseFloat(totalSaleAmount),
        paymentMethod: paymentMethod.toLowerCase(),
        date: new Date(saleDate),
        type: "credit", 
        description: "Sale transaction",
      };
  
      // Update customer balance & transaction history
      customer.balance += parseFloat(totalSaleAmount);
      customer.transactionHistory.push(transaction);
      await customer.save();
  
      // Handle payment processing
      if (paymentMethod === 'online') {
        if (!bankID) {
          return res.status(400).json({ message: "Bank ID is required for online payments" });
        }
        const bank = await Bank.findById(bankID);
        if (!bank) {
          return res.status(404).json({ message: "Bank not found" });
        }
  
        // ✅ Update bank balance and log in bank.transactions[]
        bank.balance += parseFloat(totalSaleAmount);
        bank.transactions.push({ amount: totalSaleAmount, type: 'add' });
        await bank.save();
  
        // ✅ Log transaction in Transaction model
        await Transaction.create({
            bankId: bankID,
            amount: totalAmount,
            type: 'add',
            description: `Sale: ${product.name} to ${customer.username}`,
            saleId: sale._id, // Optional: if you want to link the sale
            date: new Date(saleDate),
          });
          
  
      }else if (sale.paymentMethod === 'cash') {
        const latestCash = await Cash.findOne().sort({ createdAt: -1 });
      
        if (!latestCash) {
          return res.status(400).json({ message: "No cash entry found" });
        }
      
        latestCash.balance += totalAmount;
        await latestCash.save();
      
        await cashTransactionSchema.create({
          cashEntryId: latestCash._id,
          amount: totalAmount,
          type: 'add',
          description: `Sale: ${product.name} to ${customer.username}`,
          date: new Date(saleDate),
        });
      }
      
      
  
      // Add sale to history log
      await History.create({
        user: req.user._id,
        action: 'ADD_SALE',
        entityType: 'SALE',
        entityId: sale._id,
        amount: parseFloat(totalSaleAmount),
        debit: 0,
        quantity: stockSold,
        credit: parseFloat(totalSaleAmount),
      });
  
      res.status(201).json({ message: 'Sale added successfully!', sale });
  
    } catch (error) {
      console.error("Error adding sale:", error);
      res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
  });

// Get all Sales
const GetAllSale = asyncHandler(async (req, res) => {
    try {
        const sales = await Sale.find()
            .populate({
                path: 'customerID',
                select: 'username',
                model: 'Customer'
            })
            .populate({
                path: 'productID',
                select: 'name',
                model: 'Product'
            });
        console.log("sale", sales);
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Sales', error });
    }
});

module.exports = {
    AddSale,
    GetAllSale,
};
