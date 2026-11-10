import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await authClient.signIn.email({ email, password });

    if (authError) {
      setError(authError.message ?? 'Invalid email or password');
      setIsLoading(false);
      return;
    }

    navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-ink-900 mb-1">
          Welcome to Restaurant<span className="text-brand-600">OS</span>
        </h1>
        <p className="text-sm text-ink-500 mb-6">Sign in to your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-sm text-ink-600 mt-6 text-center">
          New here?{' '}
          <Link to="/signup" className="text-brand-600 hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}