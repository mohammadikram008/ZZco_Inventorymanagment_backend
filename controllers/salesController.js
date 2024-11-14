const asyncHandler = require("express-async-handler");
const Sale = require("../models/Sale");
const CustomerUser = require("../models/customer");
const Product = require("../models/productModel");

const Bank = require('../models/Bank');
const Cash = require('../models/Cash');
const { fileSizeFormatter } = require("../utils/fileUpload");
const History = require("../models/history");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add Sale
const AddSale = asyncHandler(async (req, res) => {
    // Extract sale details from request body
    const { productID, customerID, stockSold, saleDate, totalSaleAmount, paymentMethod, chequeDate, bankID, warehouseID, status } = req.body;
    // Validation
    console.log("reqbpdySale",  req.body);

    if (!productID || !customerID || !stockSold || !saleDate || !totalSaleAmount || !paymentMethod) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }
    const product = await Product.findById(productID); // Assuming you have a Product model
    if (!product || product.quantity < stockSold) {
        return res.status(400).json({ message: "Out of stock or limit exceeded" });
    }
    product.quantity -= stockSold; // Decrease the product quantity
    await product.save();
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

    // Create Sale
    try {
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
        const totalAmount = stockSold * totalSaleAmount;


        const customer = await CustomerUser.findById(customerID);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const transaction = {
            productName: product.name, // Add product name to transaction
            amount: parseFloat(totalSaleAmount),
            paymentMethod: paymentMethod.toLowerCase(),
            date: new Date(saleDate),
            type: "credit", // Mark as credit for sale
            description: "Sale transaction",
        };

        // Update the customer balance (credit amount)
        customer.balance += parseFloat(totalSaleAmount);
        customer.transactionHistory.push(transaction);
        await customer.save();
        if (paymentMethod === 'online' || paymentMethod === 'cheque') {
            if (!bankID) {
                throw new Error('Bank ID is required for online payments');
            }
            const bank = await Bank.findById(bankID);
            if (!bank) {
                throw new Error('Bank not found');
            }
            bank.balance += parseFloat(totalSaleAmount);
            await bank.save();
        } else if (paymentMethod === 'cash') {
            const latestCash = await Cash.findOne().sort({ createdAt: -1 });
            if (!latestCash) {
                const newTotalBalance = parseFloat(totalSaleAmount);
                console.log(newTotalBalance);
                await Cash.create({
                    balance: parseFloat(totalSaleAmount),
                    totalBalance: newTotalBalance,
                    type: 'add'
                });
            } else {
                const newTotalBalance = latestCash.totalBalance + parseFloat(totalSaleAmount);
                console.log(newTotalBalance);
                await Cash.create({
                    balance: parseFloat(totalSaleAmount),
                    totalBalance: newTotalBalance,
                    type: 'add'
                });
            }
        }
        await History.create({
            user: req.user._id,
            action: 'ADD_SALE',
            entityType: 'SALE',
            entityId: sale._id,
            amount: parseFloat(totalSaleAmount),
            debit: 0,
            quantity: stockSold,
            credit: parseFloat(totalSaleAmount),
            // balance,
        });
        res.status(201).json({ message: 'Sale added successfully!', sale });
    } catch (error) {
        console.error('Error adding sale:', error);
        res.status(500).json({ message: `Internal Server Error,${error}` });
    }
});

// Get all Sales
const GetAllSale = asyncHandler(async (req, res) => {
    try {
        const sales = await Sale.find().populate('customerID', 'username').populate('productID', 'name');
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Sales', error });
    }
});

module.exports = {
    AddSale,
    GetAllSale,
};
