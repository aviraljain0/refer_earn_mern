// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import api from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState(null);
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cleanPayload = (payload) => ({
    name: (payload.name || "").toString().trim(),
    email: (payload.email || "").toString().trim().toLowerCase(),
    password: (payload.password || "").toString()
  });

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    const payload = cleanPayload(form);
    if (!payload.name || !payload.email || !payload.password) {
      setMsg("Please fill all fields.");
      return;
    }

    setSubmitting(true);
    setMsg("Registering...");
    try {
      const res = await api.post("/register", payload);
      setMsg(res.data.message || "Registered");
      setUser(res.data.user);
      // save user email locally so ApplyReferral can use it
      localStorage.setItem("registeredUserEmail", res.data.user.email);
      // notify other components that a registration just happened
      window.dispatchEvent(new CustomEvent("registered", { detail: res.data.user.email }));
      // clear password from form for security
      setForm({ ...form, password: "" });

      // auto-copy referral code (best-effort)
      if (res.data.user?.referralCode) {
        copyToClipboard(res.data.user.referralCode);
      }
    } catch (err) {
      const text = err?.response?.data?.message || err?.message || "Error registering";
      setMsg(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={submit} className="form">
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            placeholder="Your full name"
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            placeholder="Choose a secure password"
          />
        </label>

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>
      </form>

      {msg && <p className="message">{msg}</p>}

      {user && (
        <div className="info" style={{ marginTop: 12 }}>
          <strong>Your Referral Code:</strong>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
            <div className="code">{user.referralCode}</div>
            <button
              className="btn"
              style={{ padding: "8px 10px", fontSize: 13 }}
              onClick={() => copyToClipboard(user.referralCode)}
            >
              Copy
            </button>
            {copied && <span style={{ color: "#0b74ff", marginLeft: 8 }}>Copied!</span>}
          </div>
          <div style={{ marginTop: 10 }}>Coins: {user.coins}</div>
        </div>
      )}
    </div>
  );
}
