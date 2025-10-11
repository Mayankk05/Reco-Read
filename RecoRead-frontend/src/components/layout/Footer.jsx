export default function Footer() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-card-500">
      <div className="mx-auto max-w-6xl px-4 py-8 text-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="font-medium">© {new Date().getFullYear()} RecoRead</p>
        <div className="text-sm">
          Your AI‑assisted reading companion — summaries, search, and recommendations.
        </div>
      </div>
    </footer>
  );
}