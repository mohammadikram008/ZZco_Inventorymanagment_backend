const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  date: { type: Date, default: Date.now },
  chequeDate: { type: Date },
  type: { type: String, enum: ['credit', 'debit'], required: true },
});
const CustomerSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add a User name"],
    },
    email: {
      type: String,
      required: [true, "Please add a email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid emaial",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [6, "Password must be up to 6 characters"],
      //   maxLength: [23, "Password must not be more than 23 characters"],
    },
    balance: { type: Number, default: 0 },
    phone: {
      type: String,
      default: "+92",
    },
    UserRole: {
      type: String,
      default: "Cutomer",
    },
    paymentMethod: { type: String, required: false },
    chequeDate: { type: Date },
    // bio: {
    //   type: String,
    //   maxLength: [250, "Bio must not be more than 250 characters"],
    //   default: "bio",
    // },
    transactionHistory: [TransactionSchema],
  },
  {
    timestamps: true,
  }
);

//   Encrypt password before saving to DB
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }

//   // Hash password
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(this.password, salt);
//   this.password = hashedPassword;
//   next();
// });

const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;
