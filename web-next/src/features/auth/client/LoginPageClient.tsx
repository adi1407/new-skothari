"use client";

import { Navigate, useLocation } from "react-router-dom";
import { useReaderAuth } from "../../../context/ReaderAuthContext";

export default function LoginPageClient() {
  const { reader } = useReaderAuth();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") || "/profile";
  return <Navigate to={reader ? next : "/profile"} replace />;
}
