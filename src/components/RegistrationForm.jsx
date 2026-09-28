import { useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const empty = { name: "", usn: "", branch: "", semester: "", email: "", phone: "" };
const BRANCHES = ["CSE", "ISE", "ECE", "EEE", "RAI", "AIML", "ME", "CV"];

export default function RegistrationForm() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [regId, setRegId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (Object.values(form).some((v) => !v.trim())) return "All fields are required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email format.";
    if (!/^\d{10}$/.test(form.phone)) return "Phone must be 10 digits.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRegId("");

    const err = validate();
    if (err) return setError(err);

    setLoading(true);
    try {
      const usn = form.usn.trim().toUpperCase();
      const ref = doc(db, "registrations", usn); // USN is the document ID

      // Duplicate check
      const existing = await getDoc(ref);
      if (existing.exists()) {
        setError("This USN is already registered.");
        return;
      }

      const id = `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await setDoc(ref, {
        regId: id,
        name: form.name.trim(),
        usn,
        branch: form.branch,
        semester: Number(form.semester),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        createdAt: serverTimestamp(),
      });
      setRegId(id);
      setForm(empty);
    } catch (e) {
      setError("Registration failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="page-title">Student Registration</h1>
      <p className="page-sub">Fill in your details to register.</p>

      <form className="glass form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field full">
            <label>Full Name</label>
            <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="As per college records" />
          </div>
          <div className="field">
            <label>USN</label>
            <input className="input" name="usn" value={form.usn} onChange={handleChange} placeholder="1BI23RI000" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="10 digits" />
          </div>
          <div className="field">
            <label>Branch</label>
            <select className="input" name="branch" value={form.branch} onChange={handleChange}>
              <option value="">Select branch</option>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Semester</label>
            <select className="input" name="semester" value={form.semester} onChange={handleChange}>
              <option value="">Select semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field full">
            <label>Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Submitting..." : "Register"}
        </button>

        {error && <div className="alert alert-error">{error}</div>}
        {regId && (
          <div className="alert alert-ok">
            Registration successful. Your ID:
            <div className="reg-id">{regId}</div>
            Keep this and your USN to check your status later.
          </div>
        )}
      </form>
    </>
  );
}