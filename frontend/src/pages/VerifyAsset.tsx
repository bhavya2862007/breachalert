import { useEffect, useState } from "react";
import { AssetAPI } from "../api/client";

export default function VerifyAsset() {
  const [msg, setMsg] = useState("Verifying…");
  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (!token) return setMsg("Missing token.");
    AssetAPI.verify(token)
      .then((r) => setMsg("✅ " + r.data.message))
      .catch((e) => setMsg("❌ " + (e.response?.data?.detail ?? "Failed")));
  }, []);
  return <div className="verify-page"><h1>Email Verification</h1><p>{msg}</p></div>;
}