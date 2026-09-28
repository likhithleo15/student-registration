import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function StatusCheck() {
  const [usn, setUsn] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const check = async (e) => {
    e.preventDefault();
    setError("");
    setData(null);
    if (!usn.trim()) return setError("Enter your USN.");

    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "registrations", usn.trim().toUpperCase()));
      if (snap.exists()) setData(snap.data());
      else setError("No registration found for this USN.");
    } catch (e) {
      setError("Lookup failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="page-title">Check Registration Status</h1>
      <p className="page-sub">Enter your USN to see your registration details.</p>

      <form className="glass form-card" onSubmit={check}>
        <div className="field">
          <label>USN</label>
          <input className="input" value={usn} onChange={(e) => setUsn(e.target.value)} placeholder="1BI23RI000" />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Checking..." : "Check Status"}
        </button>

        {error && <div className="alert alert-error">{error}</div>}
        {data && (
          <div style={{ marginTop: 16 }}>
            <div className="alert alert-ok">Registered ✔</div>
            <div className="detail-row"><span>Registration ID</span><span>{data.regId}</span></div>
            <div className="detail-row"><span>Name</span><span>{data.name}</span></div>
            <div className="detail-row"><span>USN</span><span>{data.usn}</span></div>
            <div className="detail-row"><span>Branch</span><span>{data.branch}</span></div>
            <div className="detail-row"><span>Semester</span><span>{data.semester}</span></div>
            <div className="detail-row"><span>Email</span><span>{data.email}</span></div>
          </div>
        )}
      </form>
    </>
  );
}