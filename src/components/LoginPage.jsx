import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="login-wrap">
      <div className="glass login-card">
        <div className="brand-logo login-logo">BIT</div>
        <h1>Bangalore Institute of Technology</h1>
        <p className="login-sub">Online Student Registration System</p>

        <Link to="/register" className="login-option">
          <span className="login-icon">🎓</span>
          <span>
            <b>New Student Registration</b>
            <small>Register with your USN and get a registration ID</small>
          </span>
        </Link>

        <Link to="/admin-login" className="login-option">
          <span className="login-icon">🧑‍🏫</span>
          <span>
            <b>Administration Login</b>
            <small>Teachers and admin staff only</small>
          </span>
        </Link>

        <Link to="/status" className="login-status">
          Already registered? Check your status
        </Link>
      </div>
    </div>
  );
}