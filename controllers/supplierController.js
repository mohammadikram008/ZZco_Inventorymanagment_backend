const Supplier = require('../models/Supplier');
const Bank = require('../models/Bank');
const History = require('../models/history');
// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().select('-password');
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new supplier
exports.createSupplier = async (req, res) => {
  const supplier = new Supplier(req.body);
  try {
    const newSupplier = await supplier.save();

    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add transaction (credit/debit)
exports.addTransaction = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const { amount, paymentMethod, chequeDate, description, bankId, type = 'credit' } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    const transaction = {
      amount: parseFloat(amount),
      paymentMethod: paymentMethod.toLowerCase(),
      chequeDate,
      description,
      type: type.toLowerCase(), // Use provided type or default to 'credit'
    };

    if (req.file) {
      transaction.image = req.file;  // Save the uploaded file if available
    }

    if (paymentMethod.toLowerCase() === 'online') {
      if (!bankId) {
        return res.status(400).json({ message: "Bank ID is required for online payments" });
      }
      const bank = await Bank.findById(bankId);
      if (!bank) {
        return res.status(404).json({ message: "Bank not found" });
      }
      transaction.bankName = bank.bankName;
    }

    // Update balance based on transaction type
    supplier.balance += transaction.type === 'debit' ? -parseFloat(amount) : parseFloat(amount);

    // Save transaction
    supplier.transactionHistory.push(transaction);
    await supplier.save();

    // Save to History
    await History.create({
      user: req.user._id,
      action: transaction.type === 'debit' ? 'MINUS_SUPPLIER_BALANCE' : 'ADD_SUPPLIER_TRANSACTION',
      entityType: 'SUPPLIER',
      entityId: supplier._id,
      amount: parseFloat(amount),
      debit: transaction.type === 'debit' ? parseFloat(amount) : 0,
      credit: transaction.type === 'credit' ? parseFloat(amount) : 0,
      balance: supplier.balance,
      description: `${transaction.type === 'debit' ? 'Subtracted' : 'Added'} ${transaction.type} transaction for supplier ${supplier.name}`,
    });

    res.status(201).json({ message: "Transaction added successfully", supplier });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(400).json({ message: error.message });
  }
};


// Get transaction history for a supplier
exports.getTransactionHistory = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({ transactionHistory: supplier.transactionHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.minusBalance = async (req, res) => {
  try {
    // Access fields from the request body
    const { balance, paymentMethod, chequeDate, description, bankId } = req.body;
    console.log(req.body, req.file, "from minusBalance");

    const numericAmount = parseFloat(balance);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ message: 'Invalid amount. Must be a number' });
    }

    // Find the supplier by ID
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    if (supplier.balance < numericAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // If there's an uploaded file (image), process it
    if (req.file) {
      // You can store the image using a cloud provider or local storage.
      // For now, you can just log the file details
      console.log("Image received:", req.file);
    }

    // Subtract the balance and update supplier
    supplier.balance -= numericAmount;
    supplier.transactionHistory.push({
      amount: numericAmount,
      paymentMethod: paymentMethod.toLowerCase(),
      description,
      date: new Date(),
      type: 'debit',
      ...(req.file && { imageUrl: req.file.path }), // Save image path if there's an image
    });

    // Save the supplier
    await supplier.save();

    // Return a successful response
    res.status(200).json({ message: 'Balance subtracted successfully', supplier });
  } catch (error) {
    console.error("Error subtracting balance:", error);
    res.status(400).json({ message: error.message });
  }
};



// Delete a supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    await supplier.remove(); // Remove the supplier from the database
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
