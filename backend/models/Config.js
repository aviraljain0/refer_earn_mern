const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  rewardCoins: { type: Number, default: 50 }
}, { timestamps: true });

// Ensure only ONE config document exists
configSchema.index({}, { unique: true });

module.exports = mongoose.model("Config", configSchema);
