const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  stockSold: { type: Number, required: true },
  saleDate: { type: Date, required: true },
  totalSaleAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['cash', 'online', 'cheque', 'credit']
  },
  chequeDate: { 
    type: Date,
    required: function() { return this.paymentMethod === 'cheque'; }
  },
  bankID: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bank',
    required: function() { return this.paymentMethod === 'online'; }
  },
  warehouseID: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  image: {
    type: Object,
    default: {}
  },
  status: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Sale = mongoose.model('Sales', saleSchema);

module.exports = Sale;