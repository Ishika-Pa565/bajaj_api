const mongoose = require('mongoose');

const connectDB = () => {
  if (!process.env.MONGO_URI) {
    console.error("MongoDB Error: MONGO_URI environment variable is missing!");
    process.exit(1);
  }

  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => {
      console.error("MongoDB Error:", err);
      process.exit(1);
    });
};

module.exports = connectDB;
