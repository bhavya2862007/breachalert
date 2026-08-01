import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from "recharts";
import { motion } from "framer-motion";

interface Props {
  totalAssets: number;
  verifiedAssets: number;
  totalBreaches: number;
}

export default function Analytics({
  totalAssets,
  verifiedAssets,
  totalBreaches,
}: Props) {
  const pieData = [
    {
      name: "Verified",
      value: verifiedAssets,
    },
    {
      name: "Pending",
      value: Math.max(totalAssets - verifiedAssets, 0),
    },
  ];

  const COLORS = ["#22C55E", "#F59E0B"];

  const overviewData = [
    {
      name: "Assets",
      value: totalAssets,
    },
    {
      name: "Verified",
      value: verifiedAssets,
    },
    {
      name: "Breaches",
      value: totalBreaches,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 grid gap-6 lg:grid-cols-2"
    >
      {/* Bar Chart */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

        <h2 className="mb-6 text-xl font-bold text-white">
          Security Overview
        </h2>

        <div className="h-80">

          <ResponsiveContainer>

            <BarChart data={overviewData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
              />

              <XAxis
                dataKey="name"
                stroke="#94A3B8"
              />

              <YAxis
                stroke="#94A3B8"
              />

              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />

              <Bar
                dataKey="value"
                fill="#2563EB"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="#ffffff"
                />
              </Bar>

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Pie Chart */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

        <h2 className="mb-6 text-xl font-bold text-white">
          Asset Verification
        </h2>

        <div className="h-80">

          <ResponsiveContainer>

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                label
                animationDuration={1200}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  color: "#fff",
                }}
              />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

    </motion.div>
  );
}