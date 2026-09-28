import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Layout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const cls = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">BIT</div>
          <div className="brand-text">
            Bangalore Institute
            <br />
            of Technology
            <small>Student Registration</small>
          </div>
        </div>

        <NavLink to="/" end className={cls}>← Back to Login Page</NavLink>
        <NavLink to="/register" className={cls}>Student Registration</NavLink>
        <NavLink to="/status" className={cls}>Check Status</NavLink>
        {user ? (
          <NavLink to="/admin" className={cls}>Dashboard</NavLink>
        ) : (
          <NavLink to="/admin-login" className={cls}>Administration Login</NavLink>
        )}

        <div className="nav-spacer" />
        {user && (
          <button className="nav-link" onClick={logout}>
            Logout ({user.email})
          </button>
        )}
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}