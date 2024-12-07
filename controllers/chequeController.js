const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Customer = require('../models/customer');
const Sale = require('../models/Sale');
const Bank = require('../models/Bank');

const getCheques = asyncHandler(async (req, res) => {
  try {
    const pendingProductCheques = await Product.find({
      paymentMethod: 'cheque',
      status: false
    }).select('name chequeDate image status paymentMethod quantity price bank');
console.log("pendingProductCheques",pendingProductCheques);

    const pendingSaleCheques = await Sale.find({
      paymentMethod: 'cheque',
      status: false
    }).select('customerID chequeDate image status paymentMethod totalSaleAmount bankID');

    const allPendingCheques = [
      ...pendingProductCheques.map(product => ({
        _id: product._id,
        name: product.name,
        chequeDate: product.chequeDate,
        chequeImage: product.image,
        status: product.status,
        amount: product.quantity * product.price,
        bank: product.bank, // Added bank ID to the response
        type: 'Product'
      })),
      ...(await Promise.all(pendingSaleCheques.map(async sale => {
        const customer = await Customer.findById(sale.customerID);
        
        return {
          _id: sale._id,
          name: customer.username, // Assuming 'name' is the field to access the customer name
          chequeDate: sale.chequeDate,
          chequeImage: sale.image,
          status: sale.status,
          amount:sale.totalSaleAmount,
          bank:sale.bankID,
          type: 'Sale'
        };
      })))
    ];
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
  const { status, type,amount,bank} = req.body;

  try {
    let updatedDoc;
    if (type === 'Product') {
      updatedDoc = await Product.findByIdAndUpdate(
        id,
        { status: status },
        { new: true }
      );
        // Deduct amount from the bank account for Product type
        const bankAccount = await Bank.findById(bank);
        if (!bankAccount || bankAccount.balance < amount) {
          return res.status(400).json({ message: 'Insufficient funds in the bank account.' });
        }
        bankAccount.balance -= amount;
        await bankAccount.save();
    } else if (type === 'Sale') {
      updatedDoc = await Sale.findByIdAndUpdate(
        id,
        { status: status },
        { new: true }
      );
      const bankAccount = await Bank.findById(bank);
      if (!bankAccount) {
        return res.status(400).json({ message: 'Bank account not found.' });
      }
      bankAccount.balance += amount; // Add the amount back
      await bankAccount.save();
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
