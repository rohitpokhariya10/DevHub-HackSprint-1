const dns = require("dns");
const mongoose = require("mongoose");

// DNS fix for MongoDB Atlas SRV issue
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

// Establishes the single mongoose connection used by the application.
const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error in MongoDB connection", error);
    process.exit(1);
  }
};

module.exports = connectToDb;
