const mongoose = require("mongoose");

const ManagerSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add a username"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      default: "+92",
    },
    UserRole: {
      type: String,
      default: "Manager",
    },
    privileges: {
      deleteCustomer: { type: Boolean, default: false },
      deleteSupplier: { type: Boolean, default: false },
      deleteBank: { type: Boolean, default: false },
      deleteProduct: { type: Boolean, default: false },
      deleteCheque: { type: Boolean, default: false },
      deleteWarehouse: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const Manager = mongoose.model("Manager", ManagerSchema);
module.exports = Manager;
