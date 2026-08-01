import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "../api/client";

export default function VerifyEmail() {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const res = await api.get(`/verify/${token}`);

        setSuccess(true);
        setMessage(res.data.message);
      } catch (err: any) {
        setSuccess(false);
        setMessage(
          err.response?.data?.detail ??
            "Verification failed."
        );
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center shadow-2xl">

        {loading ? (
          <>
            <h1 className="text-3xl font-bold text-white">
              Verifying...
            </h1>

            <p className="mt-4 text-slate-400">
              Please wait while we verify your email.
            </p>
          </>
        ) : success ? (
          <>
            <CheckCircle2
              size={80}
              className="mx-auto text-emerald-500"
            />

            <h1 className="mt-6 text-3xl font-bold text-white">
              Email Verified 🎉
            </h1>

            <p className="mt-4 text-slate-400">
              {message}
            </p>

            <Link
              to="/dashboard"
              className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </>
        ) : (
          <>
            <XCircle
              size={80}
              className="mx-auto text-red-500"
            />

            <h1 className="mt-6 text-3xl font-bold text-white">
              Verification Failed
            </h1>

            <p className="mt-4 text-slate-400">
              {message}
            </p>

            <Link
              to="/dashboard"
              className="mt-8 inline-block rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-600"
            >
              Return
            </Link>
          </>
        )}
      </div>
    </div>
  );
}