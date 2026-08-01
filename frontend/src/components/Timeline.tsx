import { useState } from "react";
import {
  ShieldAlert,
  Search,
  Clock,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface Event {
  type: string;
  title: string;
  time: string;
}

interface Props {
  events: Event[];
}

export default function Timeline({
  events,
}: Props) {
  const [filter, setFilter] = useState("all");

  const filteredEvents =
    filter === "all"
      ? events
      : events.filter((event) => event.type === filter);

  function icon(type: string) {
    switch (type) {
      case "breach":
        return <ShieldAlert className="h-6 w-6 text-red-400" />;

      case "report":
        return <FileText className="h-6 w-6 text-blue-400" />;

      case "verified":
        return <ShieldCheck className="h-6 w-6 text-emerald-400" />;

      default:
        return <Search className="h-6 w-6 text-cyan-400" />;
    }
  }

  function color(type: string) {
    switch (type) {
      case "breach":
        return "bg-red-500/15";

      case "report":
        return "bg-blue-500/15";

      case "verified":
        return "bg-emerald-500/15";

      default:
        return "bg-cyan-500/15";
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">

      <h2 className="mb-6 text-3xl font-bold text-white">
        Security Timeline
      </h2>

      {/* Filter Buttons */}

      <div className="mb-8 flex flex-wrap gap-3">
        {[
          "all",
          "scan",
          "breach",
          "report",
          "verified",
        ].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === item
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <p className="text-slate-400">
          No {filter === "all" ? "" : filter} events found.
        </p>
      ) : (
        <div className="relative">

          <div className="absolute left-8 top-0 h-full w-[2px] bg-slate-700"></div>

          <div className="space-y-8">

            {filteredEvents.map((event, index) => (

              <div
                key={index}
                className="relative flex gap-6"
              >

                <div
                  className={`relative z-10 rounded-full p-4 ${color(
                    event.type
                  )}`}
                >
                  {icon(event.type)}
                </div>

                <div className="flex-1 rounded-xl bg-slate-800 p-5">

                  <h3 className="text-xl font-semibold text-white">
                    {event.title}
                  </h3>

                  <p className="mt-2 text-slate-400">
                    {event.type === "breach"
                      ? "Security breach detected. Immediate review recommended."
                      : event.type === "report"
                      ? "Security report generated successfully."
                      : event.type === "verified"
                      ? "Email ownership verified."
                      : "Security scan completed successfully."}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={15} />
                    {new Date(event.time).toLocaleString()}
                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>
      )}

    </div>
  );
}