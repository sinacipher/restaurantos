export default function App() {
  return (
    <main className="min-h-screen bg-ink-50 flex items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-lg border border-ink-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">
          Restaurant<span className="text-brand-600">OS</span>
        </h1>
        <p className="mt-3 text-ink-600">
          Tailwind v4 wired up with brand tokens. Next: design system
          components (Step 20) and the Express API (Step 19).
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-md bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700"
          >
            Primary action
          </button>
          <button
            type="button"
            className="rounded-md border border-ink-300 px-4 py-2 font-medium text-ink-700 transition hover:bg-ink-100"
          >
            Secondary
          </button>
        </div>
        <div className="mt-6 flex gap-2">
          <span className="rounded-sm bg-success/10 px-2 py-1 text-xs font-medium text-success">Success</span>
          <span className="rounded-sm bg-warning/10 px-2 py-1 text-xs font-medium text-warning">Warning</span>
          <span className="rounded-sm bg-danger/10 px-2 py-1 text-xs font-medium text-danger">Danger</span>
        </div>
      </div>
    </main>
  );
}