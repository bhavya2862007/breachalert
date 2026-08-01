import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  score: number;
}

export default function SecurityScore({ score }: Props) {
  const percentage = Math.max(0, Math.min(score, 100));

  let color = "bg-green-500";
  let text = "Secure";
  let Icon = ShieldCheck;

  if (percentage < 75) {
    color = "bg-yellow-500";
    text = "Moderate";
    Icon = ShieldAlert;
  }

  if (percentage < 50) {
    color = "bg-red-500";
    text = "At Risk";
    Icon = ShieldX;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
    >
      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold text-white">
            Security Score
          </h2>

          <p className="mt-2 text-slate-400">
            Overall protection of your monitored accounts
          </p>

        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-white ${color}`}
        >
          <Icon size={18} />
          {text}
        </div>

      </div>

      <div className="mb-4 h-5 overflow-hidden rounded-full bg-slate-800">

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
          }}
          className={`h-full ${color}`}
        />

      </div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-6xl font-extrabold text-white"
      >
        {percentage}%
      </motion.h1>

      <p className="mt-2 text-slate-400">
        {percentage >= 90 &&
          "Excellent! Your digital footprint is well protected."}

        {percentage >= 75 &&
          percentage < 90 &&
          "Your accounts are in good shape. Keep monitoring regularly."}

        {percentage >= 50 &&
          percentage < 75 &&
          "Some accounts need attention. Consider reviewing recent breaches."}

        {percentage < 50 &&
          "Immediate action recommended. Several accounts may be exposed."}
      </p>
    </motion.div>
  );
}