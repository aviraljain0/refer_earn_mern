// frontend/src/App.jsx
import React from "react";
import Register from "./pages/Register";
import ApplyReferral from "./pages/ApplyReferral";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Refer & Earn</h1>
        <p className="subtitle">Simple MERN assignment demo</p>
      </header>

      <main className="main-layout">
        <div className="card">
          <h2 className="card-title">Create Account</h2>
          <Register />
        </div>

        <div className="card">
          <h2 className="card-title">Apply Referral</h2>
          <ApplyReferral />
        </div>

        <div className="card">
          <h2 className="card-title">Your Profile</h2>
          <Profile />
        </div>
      </main>

      <footer className="footer">
        <small>Carmaa Tech Assignment — Built for Demo</small>
      </footer>
    </div>
  );
}
