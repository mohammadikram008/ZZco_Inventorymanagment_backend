const Supplier = require('../models/supplier');

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().select('-password');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  const supplier = new Supplier(req.body);
  console.log(req.body);
  try {
    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    supplier.transactionHistory.push(req.body);
    supplier.balance += req.body.type === 'credit' ? req.body.amount : -req.body.amount;
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};