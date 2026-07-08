import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// Sample data (placeholder until wired to the backend API)
// ---------------------------------------------------------------------------
const breachTrend = [
  { month: 'Jan', breaches: 12 },
  { month: 'Feb', breaches: 19 },
  { month: 'Mar', breaches: 8 },
  { month: 'Apr', breaches: 24 },
  { month: 'May', breaches: 17 },
  { month: 'Jun', breaches: 31 },
];

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
function Layout({ children }: { children: React.ReactNode }) {
  const linkBase =
    'px-4 py-2 rounded-md text-sm font-medium transition-colors';
  const linkActive = 'bg-brand-600 text-white';
  const linkInactive =
    'text-slate-300 hover:bg-slate-800 hover:text-white';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-danger-600 font-bold">
              BA
            </span>
            <span className="text-lg font-semibold tracking-tight">
              BreachAlert
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              About
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} BreachAlert. All rights reserved.
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Overview of monitored breach activity.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Monitored Accounts" value="1,204" />
        <StatCard label="Breaches Detected" value="111" accent="danger" />
        <StatCard label="Alerts Sent (30d)" value="342" accent="brand" />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">Breaches Over Time</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={breachTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '0.5rem',
                  color: '#f1f5f9',
                }}
              />
              <Line
                type="monotone"
                dataKey="breaches"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  accent = 'default',
}: {
  label: string;
  value: string;
  accent?: 'default' | 'brand' | 'danger';
}) {
  const accentClass =
    accent === 'danger'
      ? 'text-danger-400'
      : accent === 'brand'
        ? 'text-brand-400'
        : 'text-slate-100';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accentClass}`}>{value}</p>
    </div>
  );
}

function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="prose prose-invert max-w-none"
    >
      <h1 className="text-2xl font-bold">About BreachAlert</h1>
      <p className="mt-4 text-slate-400">
        BreachAlert monitors known data breaches and notifies you when your
        accounts may have been compromised. This is the frontend foundation —
        pages and data are placeholders ready to be wired to the backend API.
      </p>
    </motion.div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl font-bold text-brand-500">404</h1>
      <p className="mt-4 text-lg text-slate-400">Page not found.</p>
      <NavLink
        to="/dashboard"
        className="mt-6 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to Dashboard
      </NavLink>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}