const asyncHandler = require("express-async-handler");
const Sale = require("../models/Sale");
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
    if (!productID || !customerID || !stockSold || !saleDate || !totalSaleAmount || !paymentMethod) {
        res.status(400);
        throw new Error("Please fill in all fields");
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

        if (paymentMethod === 'online') {
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
                throw new Error('Cash account not found');
            }
            const newTotalBalance = latestCash.totalBalance + parseFloat(totalSaleAmount);
            console.log(newTotalBalance);
            await Cash.create({
                balance: parseFloat(totalSaleAmount),
                totalBalance: newTotalBalance,
                type: 'add'
            });
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
            balance,
        });
        res.status(201).json({ message: 'Sale added successfully!', sale });
    } catch (error) {
        console.error('Error adding sale:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all Sales
const GetAllSale = asyncHandler(async (req, res) => {
    try {
        const sales = await Sale.find();
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Sales', error });
    }
});

module.exports = {
    AddSale,
    GetAllSale,
};
