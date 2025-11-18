// backend/seedConfig.js
require("dotenv").config();
const mongoose = require("mongoose");
const Config = require("./models/Config");

const MONGODB_URI = process.env.MONGODB_URI || "";
const rewardCoins = process.env.REWARD_COINS ? Number(process.env.REWARD_COINS) : 50;

console.log(">>> seedConfig starting");
console.log("NODE VERSION:", process.version);
console.log("MONGODB_URI set?", MONGODB_URI ? "YES" : "NO");
console.log("REWARD_COINS:", rewardCoins);

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not set in .env. Please create backend/.env with MONGODB_URI.");
  process.exit(1);
}

const opts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000 // 10s timeout for quick failure
};

mongoose.connect(MONGODB_URI, opts)
  .then(async () => {
    console.log("Connected to MongoDB. Seeding config...");
    try {
      const existing = await Config.findOne({});
      if (existing) {
        existing.rewardCoins = rewardCoins;
        await existing.save();
        console.log("Config updated:", existing);
      } else {
        const c = new Config({ rewardCoins });
        await c.save();
        console.log("Config created:", c);
      }
      console.log("Seeding completed successfully.");
      process.exit(0);
    } catch (err) {
      console.error("DB operation error:", err);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error("MongoDB connection error:", err.message || err);
    // print some helpful hints
    if (err && err.message && err.message.includes("ENOTFOUND")) {
      console.error("Network/DNS lookup failed. Check your internet or MongoDB host.");
    }
    if (err && err.message && err.message.includes("authentication")) {
      console.error("Authentication error. Check DB username/password in MONGODB_URI.");
    }
    if (err && err.name === "MongoServerSelectionError") {
      console.error("Server selection error. If using Atlas, ensure your IP is whitelisted (Network Access).");
    }
    process.exit(1);
  });
