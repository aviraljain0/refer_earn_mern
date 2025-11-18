// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Config = require("../models/Config");
const generateCode = require("../utils/generateCode");

// small helpers
const isValidEmail = (s) => typeof s === "string" && /\S+@\S+\.\S+/.test(s);
const cleanEmail = (s) => (s || "").toString().trim().toLowerCase();
const cleanCode = (s) => (s || "").toString().trim().toUpperCase();

// POST /api/register
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    name = (name || "").toString().trim();
    email = cleanEmail(email);
    password = (password || "").toString();

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    // Check email duplicate
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);

    // Attempt to create user with a generated referral code.
    // Use a small retry loop to handle rare duplicate-key race conditions.
    let user;
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const referralCode = generateCode(6);
      user = new User({
        name,
        email,
        password: hashed,
        referralCode,
        coins: 0
      });
      try {
        await user.save();
        break; // success
      } catch (err) {
        // if duplicate referral code (race), try again; otherwise throw
        if (err.code === 11000 && err.keyValue && err.keyValue.referralCode) {
          // collision on referralCode, retry
          user = null;
          continue;
        }
        // If duplicate email slipped in (race), return meaningful error
        if (err.code === 11000 && err.keyValue && err.keyValue.email) {
          return res.status(400).json({ message: "Email already registered." });
        }
        console.error("Error saving user:", err);
        return res.status(500).json({ message: "Server error" });
      }
    }

    if (!user) {
      return res.status(500).json({ message: "Could not generate unique referral code. Try again." });
    }

    const userSafe = {
      _id: user._id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      coins: user.coins,
      hasAppliedReferral: user.hasAppliedReferral,
      referredBy: user.referredBy
    };

    return res.status(201).json({ message: "Registered successfully", user: userSafe });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/apply-referral
router.post("/apply-referral", async (req, res) => {
  try {
    const userEmail = cleanEmail(req.body.userEmail);
    const referralCode = cleanCode(req.body.referralCode);

    if (!userEmail || !referralCode) {
      return res.status(400).json({ message: "userEmail and referralCode required." });
    }

    if (!isValidEmail(userEmail)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // find user applying
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found." });

    // If user already applied any referral
    if (user.hasAppliedReferral) {
      return res.status(400).json({ message: "Referral already applied. You cannot apply another referral." });
    }

    // find owner of referral code
    const owner = await User.findOne({ referralCode });
    if (!owner) return res.status(400).json({ message: "Invalid referral code." });

    // cannot apply own code
    if (owner.email === user.email) return res.status(400).json({ message: "You cannot use your own referral code." });

    // get reward from config
    const config = await Config.findOne({});
    const reward = (config && Number(config.rewardCoins)) ? Number(config.rewardCoins) : 0;

    // Add reward coins to the user's account
    user.coins = (user.coins || 0) + reward;
    user.hasAppliedReferral = true;
    user.referredBy = `${owner.referralCode} (${owner.email})`;
    await user.save();

    return res.status(200).json({
      message: `Referral applied. ${reward} coins added.`,
      coins: user.coins,
      hasAppliedReferral: user.hasAppliedReferral,
      referredBy: user.referredBy
    });
  } catch (err) {
    console.error("Apply-referral error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/profile?email=...
router.get("/profile", async (req, res) => {
  try {
    const email = cleanEmail(req.query.email || "");
    if (!email) return res.status(400).json({ message: "email query parameter required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userSafe = {
      _id: user._id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      coins: user.coins,
      hasAppliedReferral: user.hasAppliedReferral,
      referredBy: user.referredBy,
      createdAt: user.createdAt
    };

    return res.status(200).json({ user: userSafe });
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
