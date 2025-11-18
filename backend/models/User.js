// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true },
  coins: { type: Number, default: 0 },

  // New fields
  hasAppliedReferral: { type: Boolean, default: false },
  referredBy: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
