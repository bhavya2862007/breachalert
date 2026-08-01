import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const ok = await signIn(email, password);
console.log("SIGN IN RESULT:", ok);

      if (ok) {
        navigate("/dashboard");
      }
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl bg-slate-900 p-8 shadow-lg"
      >
        <h1 className="text-3xl font-bold text-white mb-6">
          BreachAlert Login
        </h1>

        {error && (
          <div className="mb-4 rounded bg-red-600 p-3 text-white">
            {error}
          </div>
        )}

        <input
          className="w-full rounded border p-3 mb-4 text-black"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full rounded border p-3 mb-6 text-black"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full rounded bg-blue-600 p-3 text-white"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="mt-4 text-slate-300">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}