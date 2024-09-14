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
      // required: true,
      default: "SKU",
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, "Please add a quantity"],
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Please add a price"],
      trim: true,
    },
    // description: {
    //   type: String,
    //   required: [true, "Please add a description"],
    //   trim: true,
    // },
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
      required: [true, "Please select a warehouse"],
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;