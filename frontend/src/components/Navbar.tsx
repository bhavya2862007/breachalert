import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Bell,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../api/client";
import { useNotifications } from "../context/NotificationContext";
import NotificationPanel from "./NotificationPanel";

interface User {
  full_name?: string;
  email: string;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  const { notifications } = useNotifications();

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    loadUser();
  }, []);

  function logout() {
    localStorage.removeItem("token");

    toast.success("Logged out successfully!");

    navigate("/login");
  }

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-blue-600 p-2 shadow-lg shadow-blue-600/30">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">
              BreachAlert
            </h1>

            <p className="text-xs text-slate-400">
              Personal Data Breach Monitor • v1.0
            </p>
          </div>

        </div>

        {/* Right Side */}

        <div className="flex items-center gap-5">

          {/* Notifications */}

          <div className="relative">

            <button
              onClick={() => setOpen(!open)}
              className="relative rounded-xl p-2 transition hover:bg-slate-800 active:scale-95"
            >
              <Bell className="h-5 w-5 text-slate-300" />

              {notifications.length > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>

            <NotificationPanel
              open={open}
              notifications={notifications}
            />

          </div>

          {/* User */}

          <div className="flex items-center gap-3">

            <UserCircle2 className="h-10 w-10 text-blue-400" />

            <div>
              <p className="font-semibold text-white">
                {user?.full_name || "User"}
              </p>

              <p className="text-xs text-slate-400">
                {user?.email || "Loading..."}
              </p>
            </div>

          </div>

          {/* Logout */}

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

        </div>

      </div>
    </motion.nav>
  );
}