const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Sale = require('../models/Sale');

const getCheques = asyncHandler(async (req, res) => {
  try {
    const pendingProductCheques = await Product.find({
      paymentMethod: 'Cheque',
      status: false
    }).select('name chequeDate image status paymentMethod');

    const pendingSaleCheques = await Sale.find({
      paymentMethod: 'cheque',
      status: false
    }).select('customerName chequeDate image status paymentMethod');

    const allPendingCheques = [
      ...pendingProductCheques.map(product => ({
        _id: product._id,
        name: product.name,
        chequeDate: product.chequeDate,
        chequeImage: product.image,
        status: product.status,
        type: 'Product'
      })),
      ...pendingSaleCheques.map(sale => ({
        _id: sale._id,
        name: sale.customerName,
        chequeDate: sale.chequeDate,
        chequeImage: sale.image,
        status: sale.status,
        type: 'Sale'
      }))
    ];
console.log("allPendingCheques", allPendingCheques);
    res.json(allPendingCheques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update cheque status
// @route   PATCH /api/cheques/:id
// @access  Private
const updateChequeStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, type } = req.body;

  try {
    let updatedDoc;
    if (type === 'Product') {
      updatedDoc = await Product.findByIdAndUpdate(
        id,
        { status: status },
        { new: true }
      );
    } else if (type === 'Sale') {
      updatedDoc = await Sale.findByIdAndUpdate(
        id,
        { status: status },
        { new: true }
      );
    } else {
      return res.status(400).json({ message: 'Invalid type specified' });
    }

    if (!updatedDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Cheque status updated successfully', updatedDoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
 
  getCheques,
  updateChequeStatus,
};
