import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
            <h1 className="text-3xl font-bold tracking-tight text-ink-900">Dashboard</h1>
            <p className="text-ink-500 mt-1">Step 31 placeholder — real dashboard in Step 38.</p>
          </div>
          <Button variant="secondary" onClick={handleSignOut} isLoading={isSigningOut}>
            Sign Out
          </Button>
        </div>

        <Card className="p-6">
          <p className="text-ink-700">
            Signed in as{' '}
            <span className="font-medium text-ink-900">{session?.user.name}</span>{' '}
            <span className="text-ink-500">({session?.user.email})</span>
          </p>
        </Card>
      </div>
    </div>
  );
}