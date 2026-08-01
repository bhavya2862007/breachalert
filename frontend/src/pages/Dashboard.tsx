import { useEffect, useState } from "react";
import {
  Mail,
  ShieldAlert,
  ShieldCheck,
  Activity,
} from "lucide-react";

import { AssetAPI } from "../api/assets";
import { ScanAPI } from "../api/scans";

import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import AssetCard from "../components/AssetCard";
import Loading from "../components/Loading";
import ScanResultModal from "../components/ScanResultModal";
import SecurityScore from "../components/SecurityScore";
import Analytics from "../components/Analytics";
import AddAssetModal from "../components/AddAssetModal";
import VerificationSuccessModal from "../components/VerificationSuccessModal";
import { ReportAPI } from "../api/reports";
import toast from "react-hot-toast";
import { useNotifications } from "../context/NotificationContext";
import { HistoryAPI } from "../api/history";
import Timeline from "../components/Timeline";
interface Asset {
  id: string;
  label: string;
  email_masked: string;
  status: string;
  last_scanned_at: string | null;
  breach_count: number;
}

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
interface HistoryEvent {
  type: string;
  title: string;
  time: string;
}

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const [scanLoading, setScanLoading] = useState("");
  const [deleteLoading, setDeleteLoading] =
    useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [breaches, setBreaches] = useState<Breach[]>(
    []
  );

const [advisor, setAdvisor] = useState<Advisor | null>(null);
const { addNotification } = useNotifications();

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [
    showVerificationModal,
    setShowVerificationModal,
  ] = useState(false);

  const [verificationUrl, setVerificationUrl] =
    useState("");

const [history, setHistory] = useState<HistoryEvent[]>([]);

  async function loadAssets() {
    setLoading(true);

    try {
      const res = await AssetAPI.list();
      setAssets(res.data);
      if (res.data.length > 0) {
  loadHistory(res.data[0].id);
}
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  async function runScan(id: string) {
    setScanLoading(id);

    try {
      const res = await ScanAPI.run(id);

      setBreaches(res.data.breaches || []);
setAdvisor(res.data.advisor || null);

setModalOpen(true);
await loadHistory(id);

await loadAssets();

toast.success("Scan completed!");

addNotification(
  "scan",
  "Security scan completed."
);

if (res.data.breaches?.length > 0) {
  addNotification(
    "breach",
    `${res.data.breaches.length} breach(s) detected.`
  );
}
    } catch (err) {
      console.error(err);
      toast.error("Scan failed.");
    } finally {
      setScanLoading("");
    }
  }

  async function handleAddAsset(
    email: string,
    label: string
  ) {
    try {
      const res = await AssetAPI.create(
        email,
        label
      );
      
      

      await loadAssets();

      setShowAddModal(false);

      toast.success("Verification email generated!");
      addNotification(
  "scan",
  "New email added for monitoring."
);


      if (res.data.verification_url) {
        setVerificationUrl(
          res.data.verification_url
        );

        setShowVerificationModal(true);
      }
    } catch (err: any) {
      console.error(err);

      toast.error(
  err.response?.data?.detail ??
  "Failed to add asset."
);
    }
  }
  async function downloadReport(id: string) {
  try {
    const res = await ReportAPI.download(id);

    const url = window.URL.createObjectURL(
      new Blob([res.data])
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = "BreachAlert_Report.pdf";

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    toast.success("Security report downloaded!");
    addNotification(
  "report",
  "Security report downloaded."
);

  } catch (err) {
    console.error(err);

    toast.error("Failed to download report.");
  }
}


  async function handleDeleteAsset(
    id: string
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this monitored email?"
    );
    
    if (!confirmed) return;

    try {
      setDeleteLoading(id);

      await AssetAPI.delete(id);

      await loadAssets();
      toast.success("Asset deleted successfully!");
      addNotification(
  "scan",
  "Monitored email deleted."
);
    } catch (err: any) {
      console.error(err);

      toast.error(
  err.response?.data?.detail ??
  "Failed to delete asset."
);
    } finally {
      setDeleteLoading("");
    }
  }

  // Dashboard Statistics

  const totalAssets = assets.length;

  const verifiedAssets = assets.filter(
    (asset) => asset.status === "Verified"
  ).length;

  const totalBreaches = assets.reduce(
    (sum, asset) =>
      sum + asset.breach_count,
    0
  );

  const threatLevel =
    totalBreaches === 0
      ? "Low"
      : totalBreaches <= 3
      ? "Medium"
      : "High";

  const securityScore = Math.max(
    0,
    Math.min(
      100,
      100 -
        totalBreaches * 10 +
        verifiedAssets * 5 -
        (totalAssets - verifiedAssets) * 5
    )
  );
  async function loadHistory(assetId: string) {
  try {
    const res = await HistoryAPI.get(assetId);
    setHistory(res.data);
  } catch (err) {
    console.error(err);
  }
}
const hour = new Date().getHours();

const greeting =
  hour < 12
    ? "Good Morning"
    : hour < 17
    ? "Good Afternoon"
    : "Good Evening";

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-8 py-8">

        <section className="mb-8">
          <h1 className="text-4xl font-bold text-white">
            {greeting} 👋
          </h1>

          <p className="mt-2 text-slate-400">
            Monitor your digital identity
            and stay ahead of data breaches.
          </p>
        </section>

        <SecurityScore score={securityScore} />

        <Analytics
          totalAssets={totalAssets}
          verifiedAssets={verifiedAssets}
          totalBreaches={totalBreaches}
        />

        <section className="mb-10">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Assets"
              value={totalAssets}
              icon={Mail}
              color="bg-blue-600"
            />

            <StatCard
              title="Breaches"
              value={totalBreaches}
              icon={ShieldAlert}
              color="bg-red-600"
            />

            <StatCard
              title="Verified"
              value={verifiedAssets}
              icon={ShieldCheck}
              color="bg-emerald-600"
            />

            <StatCard
              title="Threat Level"
              value={threatLevel}
              icon={Activity}
              color="bg-yellow-500"
            />
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Monitored Accounts
              </h2>

              <p className="text-slate-400">
                Emails currently being monitored for breaches.
              </p>
            </div>

            <button
              onClick={() =>
                setShowAddModal(true)
              }
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-95"
            >
              + Add Asset
            </button>
          </div>
                    {loading ? (
            <Loading />
          ) : assets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-16 text-center">
              <h2 className="text-2xl font-bold text-white">
                No monitored assets
              </h2>

              <p className="mt-3 text-slate-400">
                Add your first email to begin monitoring for
                data breaches.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {assets.map((asset) => (
                
               <AssetCard
  key={asset.id}
  id={asset.id}
  label={asset.label}
  email={asset.email_masked}
  status={asset.status}
  breachCount={asset.breach_count}
  lastScan={asset.last_scanned_at}
  onScan={runScan}
  onReport={downloadReport}
  onDelete={handleDeleteAsset}
  scanning={scanLoading === asset.id}
  deleting={deleteLoading === asset.id}
/>
              ))}
            </div>
          )}
        </section>
        <section className="mt-10">
  <Timeline events={history} />
</section>
      </main>

      <AddAssetModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAsset}
      />

      <VerificationSuccessModal
        open={showVerificationModal}
        verificationUrl={verificationUrl}
        onClose={() =>
          setShowVerificationModal(false)
        }
      />

      <ScanResultModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  breaches={breaches}
  advisor={advisor}
/>
    </div>
  );
}