interface Props {
  open: boolean;
  verificationUrl: string;
  onClose: () => void;
}

export default function VerificationSuccessModal({
  open,
  verificationUrl,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 text-center">

        <h2 className="text-3xl font-bold text-white">
          Email Added ✅
        </h2>

        <p className="mt-4 text-slate-400">
          Development mode: click below to verify your email.
        </p>

        <a
          href={verificationUrl}
          className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Verify Email
        </a>

        <button
          onClick={onClose}
          className="mt-4 block w-full rounded-xl border border-slate-700 py-3 text-white"
        >
          Later
        </button>

      </div>
    </div>
  );
}