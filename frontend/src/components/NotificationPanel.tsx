import { Bell, ShieldAlert, CheckCircle, FileDown } from "lucide-react";

interface Notification {
  id: number;
  type: "scan" | "breach" | "report";
  message: string;
  time: string;
}

interface Props {
  open: boolean;
  notifications: Notification[];
}

export default function NotificationPanel({
  open,
  notifications,
}: Props) {
  if (!open) return null;

  return (
    <div className="absolute right-0 top-14 w-96 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl z-50">

      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center gap-2">
          <Bell className="text-blue-400" />
          <h2 className="text-lg font-bold text-white">
            Notifications
          </h2>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">

        {notifications.length === 0 ? (
          <p className="p-6 text-center text-slate-400">
            No notifications yet.
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="border-b border-slate-800 p-4 hover:bg-slate-800 transition"
            >
              <div className="flex gap-3">

                {n.type === "breach" && (
                  <ShieldAlert className="text-red-400 mt-1" />
                )}

                {n.type === "scan" && (
                  <CheckCircle className="text-emerald-400 mt-1" />
                )}

                {n.type === "report" && (
                  <FileDown className="text-cyan-400 mt-1" />
                )}

                <div>
                  <p className="text-white">
                    {n.message}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {n.time}
                  </p>
                </div>

              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
}