// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import api from "../api";

export default function Profile() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const e = localStorage.getItem("registeredUserEmail") || "";
    setEmail(e);
    if (e) fetchProfile(e);

    // listen for registration events so profile updates immediately
    const onRegistered = (ev) => {
      const registeredEmail = ev?.detail || localStorage.getItem("registeredUserEmail") || "";
      setEmail(registeredEmail);
      if (registeredEmail) fetchProfile(registeredEmail);
    };

    window.addEventListener("registered", onRegistered);
    return () => window.removeEventListener("registered", onRegistered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanEmail = (s) => (s || "").toString().trim().toLowerCase();

  const fetchProfile = async (emailToFetch) => {
    const e = cleanEmail(emailToFetch);
    if (!e) {
      setMsg("Enter a valid email.");
      return;
    }

    setLoading(true);
    setMsg("Loading profile...");
    try {
      const res = await api.get("/profile", { params: { email: e } });
      setUser(res.data.user);
      setMsg(null);
    } catch (err) {
      setUser(null);
      setMsg(err?.response?.data?.message || "Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const onChangeEmail = (ev) => setEmail(ev.target.value);

  const onFetchClick = (ev) => {
    ev.preventDefault();
    const e = cleanEmail(email);
    if (!e) return setMsg("Enter email to fetch profile.");
    fetchProfile(e);
  };

  return (
    <div>
      <h2>Profile</h2>

      <form className="form" onSubmit={onFetchClick}>
        <label>
          Registered Email (stored locally)
          <input value={email} onChange={onChangeEmail} placeholder="user@example.com" />
        </label>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Fetching..." : "Fetch Profile"}
        </button>
      </form>

      {msg && <p className="message">{msg}</p>}

      {user && (
        <div style={{ marginTop: 12 }}>
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Referral Code:</strong> <span className="code">{user.referralCode}</span></div>
          <div><strong>Coins:</strong> {user.coins}</div>
          <div><strong>Applied Referral:</strong> {user.hasAppliedReferral ? "Yes" : "No"}</div>
          {user.referredBy && <div><strong>Referred By:</strong> {user.referredBy}</div>}
          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
            Account created: {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}
          </div>
        </div>
      )}
    </div>
  );
}
