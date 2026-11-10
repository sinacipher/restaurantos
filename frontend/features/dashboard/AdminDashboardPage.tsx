import { useParams } from 'react-router-dom';

export function AdminDashboardPage() {
  const { restaurantId } = useParams();

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">Dashboard Overview</h1>
          <p className="text-ink-500 mt-1">
            Restaurant ID: <span className="font-mono text-xs">{restaurantId}</span>
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {['Revenue', 'Total Orders', 'Average Order Value'].map((stat) => (
            <div key={stat} className="rounded-lg border border-ink-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-medium text-ink-500">{stat}</h3>
              <p className="text-2xl font-bold text-ink-900 mt-2">$0.00</p>
              <p className="text-xs text-ink-400 mt-1">No data yet</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-sm min-h-[300px] flex items-center justify-center">
          <p className="text-ink-400">
            Real analytics and charts will be built in Phase 9.
          </p>
        </div>
      </div>
    </div>
  );
}