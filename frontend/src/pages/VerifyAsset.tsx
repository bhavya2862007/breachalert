import { useEffect, useState } from "react";
import { AssetAPI } from "../api/assets";

export default function VerifyAsset() {
  const [msg, setMsg] = useState("Verifying...");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setMsg("Missing token.");
      return;
    }

    AssetAPI.verify(token)
      .then((response) => {
        setMsg("✅ " + response.data.message);
      })
      .catch((error) => {
        setMsg(
          "❌ " +
            (error.response?.data?.detail ??
              "Verification failed.")
        );
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="rounded-2xl bg-slate-900 p-8 shadow-xl">
        <h1 className="mb-4 text-3xl font-bold">
          Email Verification
        </h1>

        <p>{msg}</p>
      </div>
    </div>
  );
}