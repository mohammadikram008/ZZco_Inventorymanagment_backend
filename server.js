const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const contactRoute = require("./routes/contactRoute");
const customerRoute = require("./routes/customerRoute");
const managerRoute = require("./routes/managerRoute");
const bankRoutes = require("./routes/bankRoutes");
const salesRoute = require("./routes/saleRoute");
const expenseRoutes = require("./routes/addExpensesRoutes"); // Import expense routes
const errorHandler = require("./middleWare/errorMiddleware");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3001", "https://pinvent-app.vercel.app"],
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route Middleware
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/contactus", contactRoute);
app.use("/api/customers", customerRoute);
app.use("/api/manager", managerRoute);
app.use("/api/banks", bankRoutes);
app.use("/api/sales", salesRoute);
app.use("/api/expenses", expenseRoutes); // Use the expense routes

// Home Route
app.get("/", (req, res) => {
  res.send("Home Page");
});

// Error Handling Middleware
app.use(errorHandler);

// Connect to Database and Start Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("Failed to connect to MongoDB", err));
