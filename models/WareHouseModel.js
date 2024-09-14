const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a warehouse name"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Please add a warehouse location"],
      trim: true,
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields automatically
  }
);

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

module.exports = Warehouse;