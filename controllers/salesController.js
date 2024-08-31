const asyncHandler = require("express-async-handler");
const Sale = require("../models/Sale");
const { fileSizeFormatter } = require("../utils/fileUpload");
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
    const { productID, customerID, stockSold, saleDate, totalSaleAmount, paymentMethod, chequeDate } = req.body;

    // Validation
    if (!productID || !customerID || !stockSold || !saleDate || !totalSaleAmount || !paymentMethod) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }

    // Handle Image upload
    let fileData = {};
    if (req.file) {
        // Save image to Cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "Sales App",
                resource_type: "image",
            });
            fileData = {
                fileName: req.file.originalname,
                filePath: uploadedFile.secure_url,
                fileType: req.file.mimetype,
                fileSize: fileSizeFormatter(req.file.size, 2),
            };
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded");
        }
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
            image: fileData, // Save the image data
        });
        await sale.save();
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
