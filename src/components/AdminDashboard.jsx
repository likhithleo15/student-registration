import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

const COLORS = ["#3b5bdb", "#7048e8", "#12b886", "#f59f00", "#f03e3e", "#1c7ed6", "#e64980", "#868e96"];

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("");
  const [sem, setSem] = useState("");
  const [error, setError] = useState("");

  // Live updates from Firestore
  useEffect(() => {
    const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => setError(e.message)
    );
  }, []);

  const stats = useMemo(() => {
    const byBranch = {};
    const bySem = {};
    const today = new Date().toDateString();
    let todayCount = 0;
    rows.forEach((r) => {
      byBranch[r.branch] = (byBranch[r.branch] || 0) + 1;
      bySem[r.semester] = (bySem[r.semester] || 0) + 1;
      if (r.createdAt?.toDate && r.createdAt.toDate().toDateString() === today) todayCount++;
    });
    return { byBranch, bySem, todayCount };
  }, [rows]);

  const filtered = rows.filter((r) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s || r.name?.toLowerCase().includes(s) || r.usn?.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s);
    return matchSearch && (!branch || r.branch === branch) && (!sem || String(r.semester) === sem);
  });

  // Donut gradient built from branch counts
  const branchEntries = Object.entries(stats.byBranch);
  let acc = 0;
  const gradient = branchEntries.length
    ? branchEntries
        .map(([, n], i) => {
          const start = (acc / rows.length) * 100;
          acc += n;
          const end = (acc / rows.length) * 100;
          return `${COLORS[i % COLORS.length]} ${start}% ${end}%`;
        })
        .join(", ")
    : "#dde3f5 0% 100%";

  const maxSem = Math.max(1, ...Object.values(stats.bySem));

  const remove = async (id) => {
    if (window.confirm(`Delete registration for ${id}?`)) {
      try {
        await deleteDoc(doc(db, "registrations", id));
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const exportCSV = () => {
    const head = ["RegID", "Name", "USN", "Branch", "Semester", "Email", "Phone", "Date"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = filtered.map((r) =>
      [r.regId, r.name, r.usn, r.branch, r.semester, r.email, r.phone,
        r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : ""].map(esc).join(",")
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "registrations.csv";
    a.click();
  };

  return (
    <>
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-sub">Live view of all student registrations.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid-3">
        <div className="glass card"><h3>Total Registrations</h3><div className="big-number">{rows.length}</div></div>
        <div className="glass card"><h3>Registered Today</h3><div className="big-number">{stats.todayCount}</div></div>
        <div className="glass card"><h3>Branches</h3><div className="big-number">{branchEntries.length}</div></div>
      </div>

      <div className="grid-2">
        <div className="glass card">
          <h3>By Branch</h3>
          <div className="donut-wrap">
            <div className="donut" data-total={rows.length} style={{ background: `conic-gradient(${gradient})` }} />
            <div className="legend">
              {branchEntries.map(([b, n], i) => (
                <div key={b}><i style={{ background: COLORS[i % COLORS.length] }} />{b}: {n}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="glass card">
          <h3>By Semester</h3>
          <div className="bars">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <div className="bar-col" key={s}>
                <span>{stats.bySem[s] || 0}</span>
                <div className="bar" style={{ height: `${((stats.bySem[s] || 0) / maxSem) * 100}%` }} />
                <span>S{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass card">
        <h3>All Registrations ({filtered.length})</h3>
        <div className="toolbar">
          <input className="input" placeholder="Search name, USN or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="">All branches</option>
            {Object.keys(stats.byBranch).map((b) => <option key={b}>{b}</option>)}
          </select>
          <select className="input" value={sem} onChange={(e) => setSem(e.target.value)}>
            <option value="">All semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-primary" onClick={exportCSV}>Export CSV</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reg ID</th><th>Name</th><th>USN</th><th>Branch</th><th>Sem</th>
                <th>Email</th><th>Phone</th><th>Date</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.regId}</td>
                  <td>{r.name}</td>
                  <td>{r.usn}</td>
                  <td><span className="tag">{r.branch}</span></td>
                  <td>{r.semester}</td>
                  <td>{r.email}</td>
                  <td>{r.phone}</td>
                  <td>{r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : "—"}</td>
                  <td><button className="btn btn-danger" onClick={() => remove(r.id)}>Delete</button></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="9" style={{ textAlign: "center", color: "var(--muted)" }}>No registrations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}