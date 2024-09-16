const Supplier = require('../models/Supplier');
const Bank = require('../models/Bank'); 
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

    // Log request body and file for debugging
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const { amount, paymentMethod, chequeDate, description, bankId } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    const transaction = {
      amount: parseFloat(amount),
      paymentMethod: paymentMethod.toLowerCase(),
      chequeDate,
      description,
      type: 'credit',
    };
    console.log("Transaction data:", transaction);

    if (req.file) {
      transaction.image = req.file;  // Save the uploaded file if available
    }

    if (paymentMethod.toLowerCase() === 'online') {
      // Validate bankId
      if (!bankId) {
        return res.status(400).json({ message: "Bank ID is required for online payments" });
      }

      // Fetch the bank details
      const bank = await Bank.findById(bankId);
      if (!bank) {
        return res.status(404).json({ message: "Bank not found" });
      }

      // Add bank name to the transaction
      transaction.bankName = bank.bankName;
    }

    // Add the transaction to the supplier and update balance
    supplier.transactionHistory.push(transaction);
    supplier.balance += parseFloat(amount);

    // Save the supplier with updated balance and transaction history
    await supplier.save();
    
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
