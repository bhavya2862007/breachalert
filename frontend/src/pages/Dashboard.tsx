import { useEffect, useState } from "react";
import { AssetAPI, BreachAPI, ScanAPI } from "../api/client";
import BreachTimeline from "../components/BreachTimeline";
import AssetSidebar from "../components/AssetSidebar";
import RiskGauge from "../components/RiskGauge";

export default function Dashboard() {
  const [assets, setAssets] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any>({ breaches: [], risk: "low" });
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [a, t] = await Promise.all([AssetAPI.list(), BreachAPI.timeline()]);
    setAssets(a.data);
    setTimeline(t.data);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleScan = async (id: string) => {
    await ScanAPI.run(id);
    setTimeout(refresh, 2500); // poll after worker processes
  };

  if (loading) return <div className="loader">Scanning the dark web…</div>;

  return (
    <div className="dashboard">
      <AssetSidebar assets={assets} onAdd={refresh} onScan={handleScan} onDelete={refresh} />
      <main className="main">
        <header className="topbar">
          <div>
            <h1>Welcome back</h1>
            <p>Here's what's happening with your data.</p>
          </div>
          <RiskGauge risk={timeline.risk} />
        </header>

        <section className="stats">
          <StatCard label="Total Breaches" value={timeline.breaches.length} tone="danger" />
          <StatCard label="Monitored Emails" value={assets.length} />
          <StatCard
            label="Verified"
            value={assets.filter((a) => a.is_verified).length}
          />
        </section>

        <BreachTimeline breaches={timeline.breaches} />
      </main>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className={`stat-card ${tone ?? ""}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}