const mongoose = require("mongoose");


const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    sku: {
      type: String,
      default: "SKU",
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      trim: true,
    },
    shippingType: { 
      type: String, 
      required: true 
    },
    totalShipped: {
      type: Number,
      default: 0, // Ensure it's initialized to 0
    },
    receivedQuantity: {
      type: Number,
      default: 0, // Ensure it's initialized to 0
    },
    quantity: {
      type: Number, // Change this to Number
      required: [true, "Please add a quantity"],
      trim: true,
    },
    price: {
      type: Number, // Change this to Number
      required: [true, "Please add a price"],
      trim: true,
    },
    image: {
      type: Object,
      default: {},
    },
    paymentMethod: {
      type: String,
      required: [true, "Please select a payment method"],
      enum: ["cash", "cheque", "online"],
    },
    chequeDate: {
      type: Date,
      required: function() { return this.paymentMethod === "cheque"; },
    },
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      required: function() { return this.paymentMethod === "online"; },
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      // required: [true, "Please select a warehouse"],
    },
    warehouseStock: [{
      warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        // required: true,
      },
      quantity: {
        type: Number,
        default: 0,
      },
    }],
    status: {
      type: Boolean,
      default: false,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier", // Add reference to Supplier
      required: [true, "Please add a supplier"], // Make it mandatory
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;


