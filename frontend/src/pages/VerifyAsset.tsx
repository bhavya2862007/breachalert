import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AssetAPI } from "../api/assets";

export default function VerifyEmail() {
  const { token } = useParams();
  const [msg, setMsg] = useState("Verifying...");

  useEffect(() => {
    if (!token) {
      setMsg("Missing verification token.");
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
  }, [token]);

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