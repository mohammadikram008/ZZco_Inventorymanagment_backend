const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const bodyParser = require("body-parser"); // ✅ Import body-parser
const multer = require("multer"); // ✅ Import multer for file uploads

const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const contactRoute = require("./routes/contactRoute");
const customerRoute = require("./routes/customerRoute");
const managerRoute = require("./routes/managerRoute");
const bankRoutes = require("./routes/bankRoutes");
const cashRoutes = require("./routes/Cash");
const salesRoute = require("./routes/saleRoute");
const chequeRoutes = require("./routes/chequeRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const warehouseRoute = require("./routes/WarehouseRoutes");
const expenseRoutes = require("./routes/addExpensesRoutes"); // ✅ Import expense routes
const errorHandler = require("./middleWare/errorMiddleware");
const historyRoutes = require("./routes/historyRoute");

const app = express();

// ✅ Configure Multer for File Uploads
const upload = multer({ dest: "uploads/" });

// ✅ Middleware Order Matters!
app.use(cors({
    origin: ["http://localhost:3001","https://zzcoinventorymanagmentbackend.up.railway.app", "https://zzco.netlify.app"],
    credentials: true,
}));

app.use(express.json()); // ✅ Allows JSON requests
app.use(express.urlencoded({ extended: true })); // ✅ Allows form submissions
app.use(bodyParser.json()); // ✅ Ensures JSON data is properly parsed
app.use(bodyParser.urlencoded({ extended: true })); // ✅ Ensures form-data is parsed
app.use(cookieParser());

// ✅ Serve Static Files (Images & Uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Debug Middleware to Check Request Body
app.use((req, res, next) => {
    console.log("🔥 Incoming Request:", req.method, req.url);
    console.log("📩 Body:", req.body);
    console.log("📄 Headers:", req.headers);
    next();
});

// ✅ Route Middleware
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/contactus", contactRoute);
app.use("/api/customers", customerRoute);
app.use("/api/manager", managerRoute);
app.use("/api/banks", bankRoutes);
app.use("/api/cash", cashRoutes);
app.use("/api/sales", salesRoute);
app.use("/api/expenses", expenseRoutes); 
app.use("/api/warehouses", warehouseRoute);
app.use("/api/cheques", chequeRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/history", historyRoutes);

// ✅ Home Route
app.get("/", (req, res) => {
  res.send("Home Page");
});

// ✅ Error Handling Middleware
app.use(errorHandler);

// ✅ Connect to Database and Start Server
const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("❌ Failed to connect to MongoDB", err));
