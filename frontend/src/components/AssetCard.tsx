import {
  Mail,
  ShieldCheck,
  ShieldAlert,
  Play,
  Trash2,
  Loader2,
  FileDown,
} from "lucide-react";
import { motion } from "framer-motion";

interface AssetCardProps {
  id: string;
  label: string;
  email: string;
  status: string;
  breachCount: number;
  lastScan: string | null;
  onScan: (id: string) => void;
  onReport: (id: string) => void;
  onDelete: (id: string) => void;
  scanning?: boolean;
  deleting?: boolean;
}

export default function AssetCard({
  id,
  label,
  email,
  status,
  breachCount,
  lastScan,
  onScan,
  onReport,
  onDelete,
  scanning = false,
  deleting = false,
}: AssetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="rounded-xl bg-blue-600/20 p-3">
            <Mail className="h-6 w-6 text-blue-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              {label}
            </h2>

            <p className="mt-1 text-slate-400">
              {email}
            </p>
          </div>
        </div>

        {status === "Verified" ? (
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-400">
            <ShieldCheck size={16} />
            Verified
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-400">
            <ShieldAlert size={16} />
            Pending
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-500">
            Breaches
          </p>

          <h3 className="text-2xl font-bold text-white">
            {breachCount}
          </h3>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Last Scan
          </p>

          <h3 className="text-sm text-white">
            {lastScan
              ? new Date(lastScan).toLocaleString()
              : "Never"}
          </h3>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">

        <button
          disabled={scanning}
          onClick={() => onScan(id)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {scanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Scan
            </>
          )}
        </button>

        <button
          onClick={() => onReport(id)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-medium text-white transition hover:bg-emerald-700 active:scale-95"
        >
          <FileDown className="h-4 w-4" />
          Download Report
        </button>

        <button
          disabled={deleting}
          onClick={() => onDelete(id)}
          className="flex items-center justify-center gap-2 rounded-xl border border-red-500 py-3 text-red-400 transition hover:bg-red-500 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete
            </>
          )}
        </button>

      </div>
    </motion.div>
  );
}