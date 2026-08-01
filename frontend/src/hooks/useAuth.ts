import { useState } from "react";
import { login } from "../api/auth";

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const signIn = async (
    email: string,
    password: string
  ) => {
    setLoading(true);

    try {
      const token = await login(email, password);
console.log("LOGIN RESPONSE:", token);

      localStorage.setItem(
        "access_token",
        token.access_token
      );

      localStorage.setItem(
        "refresh_token",
        token.refresh_token
      );

      return true;
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    loading,
  };
}