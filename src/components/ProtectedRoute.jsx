import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still checking

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) return <p>Loading...</p>;
  if (user === null) return <Navigate to="/admin-login" replace />;
  return children;
}