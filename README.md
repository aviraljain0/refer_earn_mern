# Refer & Earn — MERN Assignment (Demo)

**Project:** Refer & Earn  
**Author:** Aviral Jain (GitHub: `aviraljain0`)  
**Stack:** MongoDB Atlas • Express • Node.js • React (Vite) — simple MERN demo

---

## ⚡ Project overview

A small Refer & Earn application (MERN) built for a coding assignment.  
Features:
- User registration with unique referral code generation
- Apply a referral code (prevents duplicate applications)
- Simple profile page showing referral code, coins, and who referred the user
- Configurable reward amount stored in MongoDB (`Config` collection)

This repo contains two folders:
- `backend/` — Express + Mongoose API
- `frontend/` — React (Vite) SPA

---

## ▶️ Quick demo flow (what to try)
1. Register user A → note generated referral code.
2. Register user B → use A's referral code in **Apply Referral**.
3. Verify B received coins and `hasAppliedReferral` is set to `true`.
4. Use **Profile** card to fetch and view user details.

---

## 📁 Repo structure (essential)
