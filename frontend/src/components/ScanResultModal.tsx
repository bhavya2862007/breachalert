import {
  X,
  Calendar,
  Database,
  Bot,
  ShieldCheck,
} from "lucide-react";

interface Breach {
  name: string;
  title: string;
  date: string;
  pwn_count: number;
  data_classes: string[];
}

interface Advisor {
  score: number;
  risk: string;
  summary: string;
  recommendations: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  breaches: Breach[];
  advisor: Advisor | null;
}

export default function ScanResultModal({
  open,
  onClose,
  breaches,
  advisor,
}: Props) {
  if (!open) return null;

  const riskColor =
    advisor?.risk === "High"
      ? "text-red-400"
      : advisor?.risk === "Medium"
      ? "text-yellow-400"
      : "text-emerald-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Scan Results
          </h2>

          <button onClick={onClose}>
            <X className="text-slate-400 hover:text-white" />
          </button>
        </div>

        {breaches.length === 0 ? (
          <div className="py-8 text-center">
            <ShieldCheck className="mx-auto mb-4 h-14 w-14 text-emerald-500" />

            <h3 className="text-xl font-semibold text-white">
              Great news! 🎉
            </h3>

            <p className="mt-2 text-slate-400">
              No new breaches were found.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {breaches.map((breach) => (
              <div
                key={breach.name}
                className="rounded-xl border border-slate-700 bg-slate-800 p-5"
              >
                <h3 className="text-xl font-bold text-red-400">
                  {breach.title}
                </h3>

                <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    {breach.date}
                  </div>

                  <div className="flex items-center gap-2">
                    <Database size={18} />
                    {breach.pwn_count.toLocaleString()} accounts
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {breach.data_classes.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-blue-600/20 px-3 py-1 text-sm text-blue-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {advisor && (
          <div className="mt-8 rounded-2xl border border-blue-500/30 bg-slate-800 p-6">

            <div className="mb-5 flex items-center gap-3">
              <Bot className="h-8 w-8 text-cyan-400" />

              <div>
                <h3 className="text-2xl font-bold text-white">
                  AI Security Advisor
                </h3>

                <p className="text-slate-400">
                  Personalized recommendations
                </p>
              </div>
            </div>

            <div className="mb-6 grid gap-5 md:grid-cols-2">

              <div className="rounded-xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Security Score
                </p>

                <h2 className="mt-2 text-5xl font-bold text-cyan-400">
                  {advisor.score}
                </h2>

                <p className="text-slate-500">
                  out of 100
                </p>
              </div>

              <div className="rounded-xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Risk Level
                </p>

                <h2
                  className={`mt-2 text-3xl font-bold ${riskColor}`}
                >
                  {advisor.risk}
                </h2>
              </div>

            </div>

            <div className="mb-5">
              <h4 className="mb-2 font-semibold text-white">
                Summary
              </h4>

              <p className="text-slate-300">
                {advisor.summary}
              </p>
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-white">
                Recommendations
              </h4>

              <ul className="space-y-2">
                {advisor.recommendations.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-slate-300"
                  >
                    <ShieldCheck className="mt-1 h-5 w-5 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}