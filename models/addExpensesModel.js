const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    expenseName: {
      type: String,
      required: [true, "Please add an expense name"],
    },
    amount: {
      type: Number,
      required: [true, "Please add an amount"],
      set: (val) => -Math.abs(val), // ✅ Always store as a negative value
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "cheque", "online", "credit"],
      default: "cash",
    },
    bankID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      default: null,
    },
    chequeDate: {
      type: Date,
      default: null,
    },
    image: {
      fileName: { type: String, default: null },
      filePath: { type: String, default: null },
      fileType: { type: String, default: null },
      fileSize: { type: Number, default: null },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Expense = mongoose.model("Expense", ExpenseSchema);
module.exports = Expense;
