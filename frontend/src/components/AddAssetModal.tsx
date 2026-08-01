import { useState } from "react";
import { X, Mail, Tag } from "lucide-react";
import { toast } from "react-hot-toast/headless";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (email: string, label: string) => Promise<void>;
}

export default function AddAssetModal({
  open,
  onClose,
  onAdd,
}: Props) {
  const [email, setEmail] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      await onAdd(email, label);

      // Reset form
      setEmail("");
      setLabel("");

      // Close modal
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add asset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Add Asset
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Label
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-700 px-3">
              <Tag className="text-slate-400" />

              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-transparent py-3 text-white outline-none"
                placeholder="Personal"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Email
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-slate-700 px-3">
              <Mail className="text-slate-400" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-3 text-white outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Asset"}
          </button>
        </form>
      </div>
    </div>
  );
}