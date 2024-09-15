const multer = require("multer");
const path = require("path");

// Define file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save to the uploads/ directory
  },
  filename: function (req, file, cb) {
    const sanitizedFilename = file.originalname.replace(/\s+/g, "_"); // Sanitize the file name
    cb(null, Date.now() + "_" + sanitizedFilename); // Add a timestamp to avoid conflicts
  },
});

// Optional: Filter file types (e.g., only allow images)
function fileFilter(req, file, cb) {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(null, false); // Reject the file
  }
}

// Initialize multer with storage and optional file filter
const upload = multer({
  storage,
  fileFilter, // Include this if you want to restrict the file types
});

// File Size Formatter (Optional)
const fileSizeFormatter = (bytes, decimal) => {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const dm = decimal || 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1000));
  return (
    parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + " " + sizes[index]
  );
};

// Export only upload
module.exports = upload;
