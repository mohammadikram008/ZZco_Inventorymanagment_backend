const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productID: { type: String, required: true },
  customerID: { type: String, required: true },
  stockSold: { type: Number, required: true },
  saleDate: { type: Date, required: true },
  totalSaleAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  chequeDate: { type: Date },
  
},
{
    timestamps: true,
  }
);

const Sale = mongoose.model('Sales', saleSchema);

module.exports = Sale;
