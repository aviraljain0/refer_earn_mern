// frontend/src/pages/ApplyReferral.jsx
import React, { useState, useEffect } from "react";
import api from "../api";

export default function ApplyReferral() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);
  const [coins, setCoins] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const e = localStorage.getItem("registeredUserEmail") || "";
    setUserEmail(e);
    if (e) fetchProfile(e);

    // listen for registration events (so this component updates immediately)
    const onRegistered = (ev) => {
      const email = ev?.detail || localStorage.getItem("registeredUserEmail") || "";
      setUserEmail(email);
      if (email) fetchProfile(email);
    };

    window.addEventListener("registered", onRegistered);
    return () => window.removeEventListener("registered", onRegistered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async (emailToFetch) => {
    if (!emailToFetch) return;
    setLoadingProfile(true);
    setMsg(null);
    try {
      const res = await api.get("/profile", { params: { email: emailToFetch } });
      setProfile(res.data.user);
      setCoins(res.data.user.coins);
    } catch (err) {
      setProfile(null);
      const text = err?.response?.data?.message || "Could not fetch profile";
      setMsg(text);
    } finally {
      setLoadingProfile(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      setMsg("You must register first (register form above).");
      return;
    }

    // prevent submitting if already applied
    if (profile?.hasAppliedReferral) {
      setMsg("You have already applied a referral.");
      return;
    }

    const cleanedCode = (code || "").toString().trim().toUpperCase();
    if (!cleanedCode) {
      setMsg("Please enter a referral code.");
      return;
    }

    setMsg("Applying...");
    setSubmitting(true);
    try {
      const res = await api.post("/apply-referral", { userEmail, referralCode: cleanedCode });
      setMsg(res.data.message || "Applied");
      setCoins(res.data.coins);
      // refresh profile
      await fetchProfile(userEmail);
      // clear input only on success (optional)
      setCode("");
    } catch (err) {
      const text = err?.response?.data?.message || "Error applying referral";
      setMsg(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Apply Referral Code</h2>

      <div className="small-note">
        Registered as: <strong>{userEmail || "Not registered"}</strong>
      </div>

      {loadingProfile ? (
        <p className="message">Loading profile...</p>
      ) : (
        <>
          {profile?.hasAppliedReferral && (
            <p className="info">You have already applied a referral. Referred by: {profile.referredBy}</p>
          )}

          <form onSubmit={submit} className="form">
            <label>
              Referral Code
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                disabled={profile?.hasAppliedReferral || submitting}
                required
              />
            </label>
            <button type="submit" className="btn" disabled={profile?.hasAppliedReferral || submitting}>
              {submitting ? "Applying..." : "Apply"}
            </button>
          </form>

          {msg && <p className="message">{msg}</p>}
          {profile && <p className="info">Your coins (from profile): {profile.coins}</p>}
          {coins !== null && <p className="info">Your coins (last update): {coins}</p>}
        </>
      )}
    </div>
  );
}
