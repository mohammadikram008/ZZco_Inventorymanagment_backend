const express = require('express');
const router = express.Router();
const protect = require('../middleWare/authMiddleware');
const checkPrivileges = require('../middleWare/checkPrivileges'); // Import privilege-checking middleware
const {
    createProduct,
    getProducts,
    getProduct,
    deleteProduct,
    updateProduct,
    updateReceivedQuantity
} = require('../controllers/productController');
const upload = require('../utils/fileUpload'); // Updated import to use Multer

// Routes using Multer middleware to handle file uploads
router.post('/', protect, upload.single('image'), createProduct);
router.patch('/:id', protect, upload.single('image'), updateProduct);
router.get('/', protect, getProducts);
router.get('/:id', protect, getProduct);

// Route to delete a product with privilege check
router.delete('/:id', protect, checkPrivileges("deleteProduct"), deleteProduct);

// Route to update received quantity
router.patch('/receive/:id', protect, updateReceivedQuantity);

module.exports = router;
