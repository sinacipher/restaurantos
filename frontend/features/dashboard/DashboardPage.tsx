import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authClient } from '../../lib/auth-client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface Membership {
  restaurantId: string;
  name: string;
  slug: string;
  role: string;
  currency: string;
  timezone: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { data: memberships, isLoading } = useQuery({
    queryKey: ['memberships'],
    queryFn: async () => {
      const res = await fetch('/api/v1/restaurants');
      if (!res.ok) throw new Error('Failed to load restaurants');
      const json = await res.json();
      return json.data as Membership[];
    },
  });

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-ink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink-900">Your Restaurants</h1>
            <p className="text-ink-500 mt-1">
              Signed in as {session?.user.name} ({session?.user.email})
            </p>
          </div>
          <Button variant="secondary" onClick={handleSignOut} isLoading={isSigningOut}>
            Sign Out
          </Button>
        </div>

        {isLoading ? (
          <p className="text-ink-500">Loading...</p>
        ) : memberships?.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-ink-600 mb-4">You don't have any restaurants yet.</p>
            {/* This will be connected in Step 35 */}
            <Button>Create a Restaurant</Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {memberships?.map((m) => (
              <Card key={m.restaurantId} className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-ink-900">{m.name}</h2>
                    <Badge variant={m.role === 'owner' ? 'success' : 'default'}>
                      {m.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-500">
                    {m.currency} • {m.timezone}
                  </p>
                </div>
                <Button
                  className="mt-6 w-full"
                  onClick={() => alert(`Admin dashboard for ${m.name} will be built in Step 38.`)}
                >
                  Manage Restaurant
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}