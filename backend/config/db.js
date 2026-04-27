const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error(
      "Action: ensure MongoDB is running and MONGO_URI is correct. " +
      "On Windows (Admin PowerShell): Start-Service MongoDB"
    );
    process.exit(1);
  }
}

module.exports = connectDB;
