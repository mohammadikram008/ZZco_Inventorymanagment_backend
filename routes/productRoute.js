const express = require('express');
const router = express.Router();
const protect = require('../middleWare/authMiddleware');
const {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct,
    receiveProduct,
    updateReceivedQuantity
} = require('../controllers/productController');
const upload = require('../utils/fileUpload'); // Updated import to use Multer

// Routes using Multer middleware to handle file uploads
router.post('/', protect, upload.single('image'), createProduct);
router.patch('/:id', protect, upload.single('image'), updateProduct);
router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);
router.delete('/:id', protect, deleteProduct);
router.patch('/receive/:id', protect, receiveProduct);
router.patch('/receive/:id', protect, updateReceivedQuantity);

module.exports = router;
