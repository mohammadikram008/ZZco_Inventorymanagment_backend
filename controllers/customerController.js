const asyncHandler = require("express-async-handler");
const CustomerUser = require("../models/customer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const Bank = require("../models/Bank");
const Cash = require("../models/Cash"); // Assume you have a Cash model

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register Customer
const registerCustomer = asyncHandler(async (req, res) => {
  const { username, email, password, phone } = req.body;
  console.log("body", req.body);


  // Validation
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  // Check if user email already exists
  const userExists = await CustomerUser.findOne({ email }); 

  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  // Create new user
  const customer = await CustomerUser.create({
    username,
    email,
    password,
    phone
  });

  //   Generate Token
  const token = generateToken(customer._id);

  // Send HTTP-only cookie
  //   res.cookie("token", token, {
  //     path: "/",
  //     httpOnly: true,
  //     expires: new Date(Date.now() + 1000 * 86400), // 1 day
  //     sameSite: "none",
  //     secure: true,
  //   });

  if (user) {
    const { _id, name, email, phone, } = customer;
    res.status(201).json({
      _id,
      username,
      email,
      phone,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid Cutomer data");
  }
});

// Get all Cutomser
const GetAllCustomer = asyncHandler(async (req, res) => {
  try {
    const customers = await CustomerUser.find();
    console.log("customers", customers);

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error });
  }
})


// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate Request
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  // User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  //   Generate Token
  const token = generateToken(user._id);

  if (passwordIsCorrect) {
    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });
  }
  if (user && passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// Logout User
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Successfully Logged Out" });
});

// Get User Data
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
    });
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  // Verify Token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

// Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await CustomerUser.findById(req.user._id);

  if (user) {
    const { name, email, photo, phone, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }
  //Validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add old and new password");
  }

  // check if old password matches password in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // Save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("Password change successful");
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User does not exist");
  }

  // Delete token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // Create Reste Token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(resetToken);

  // Hash token before saving to DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Save Token to DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
  }).save();

  // Construct Reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  // Reset Email
  const message = `
      <h2>Hello ${user.name}</h2>
      <p>Please use the url below to reset your password</p>  
      <p>This reset link is valid for only 30minutes.</p>

      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

      <p>Regards...</p>
      <p>Pinvent Team</p>
    `;
  const subject = "Password Reset Request";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({ success: true, message: "Reset Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  // Hash token, then compare to Token in DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // fIND tOKEN in DB
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  // Find user
  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();
  res.status(200).json({
    message: "Password Reset Successful, Please Login",
  });
});

const addBalance = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, chequeDate, description, bankId } = req.body;

  // Ensure paymentMethod is lowercase
  const lowerCasePaymentMethod = paymentMethod.toLowerCase();

  if (!amount || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required fields or invalid amount' });
  }

  const customer = await CustomerUser.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const transaction = {
    amount: parseFloat(amount),
    paymentMethod: lowerCasePaymentMethod,  // Use lowercase here
    description,
    date: new Date(),
    type: 'credit',  // For addBalance
  };

  if (lowerCasePaymentMethod === 'online') {
    if (!bankId) {
      return res.status(400).json({ message: 'Bank ID is required for online payments' });
    }
    const bank = await Bank.findById(bankId);
    if (!bank) {
      return res.status(404).json({ message: 'Bank not found' });
    }
    bank.balance += parseFloat(amount);
    await bank.save();
    transaction.bankName = bank.bankName;
  } else if (lowerCasePaymentMethod === 'cheque') {
    if (!chequeDate) {
      return res.status(400).json({ message: 'Cheque date is required for cheque payments' });
    }
    transaction.chequeDate = new Date(chequeDate);
  }

  customer.balance += parseFloat(amount);
  customer.transactionHistory.push(transaction);

  await customer.save();

  return res.status(200).json({ message: 'Balance added successfully', customer });
});

const minusBalance = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, chequeDate, description, bankId } = req.body;

  // Ensure paymentMethod is lowercase
  const lowerCasePaymentMethod = paymentMethod.toLowerCase();

  if (!amount || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required fields or invalid amount' });
  }

  const customer = await CustomerUser.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  if (customer.balance < amount) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  const transaction = {
    amount: -parseFloat(amount),  // Negative for debit
    paymentMethod: lowerCasePaymentMethod,  // Use lowercase here
    description,
    date: new Date(),
    type: 'debit',  // For minusBalance
  };

  if (lowerCasePaymentMethod === 'online') {
    if (!bankId) {
      return res.status(400).json({ message: 'Bank ID is required for online payments' });
    }
    const bank = await Bank.findById(bankId);
    if (!bank) {
      return res.status(404).json({ message: 'Bank not found' });
    }
    bank.balance -= parseFloat(amount);
    await bank.save();
    transaction.bankName = bank.bankName;
  } else if (lowerCasePaymentMethod === 'cheque') {
    if (!chequeDate) {
      return res.status(400).json({ message: 'Cheque date is required for cheque payments' });
    }
    transaction.chequeDate = new Date(chequeDate);
  }

  customer.balance -= parseFloat(amount);
  customer.transactionHistory.push(transaction);

  await customer.save();

  return res.status(200).json({ message: 'Balance subtracted successfully', customer });
});





const deleteUser = asyncHandler(async (req, res) => {
  console.log("Received request to delete customer with ID:", req.params.id);
  const { id } = req.params;

  try {
    const customer = await CustomerUser.findByIdAndDelete(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return res.status(500).json({ message: 'Server error', error });
  }
});



///get history
const getTransactionHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await CustomerUser.findById(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    return res.status(200).json({ transactionHistory: customer.transactionHistory });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
});
module.exports = {
  registerCustomer,
  GetAllCustomer,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  addBalance,
  minusBalance,
  deleteUser,
  getTransactionHistory
};
