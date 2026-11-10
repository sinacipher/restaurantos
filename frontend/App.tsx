import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Card } from './components/ui/Card';
import { Badge } from './components/ui/Badge';

export default function App() {
  return (
    <main className="min-h-screen bg-ink-50 p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">
            Design System
          </h1>
          <p className="text-ink-600 mt-2">
            Step 20: Reusable UI primitives for RestaurantOS.
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-sm font-medium text-ink-500 mb-3 uppercase tracking-wider">
              Buttons
            </h2>
            <div className="flex flex-wrap gap-3 items-center">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-ink-500 mb-3 uppercase tracking-wider">
              Badges
            </h2>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge>Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-ink-500 mb-3 uppercase tracking-wider">
              Inputs
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Restaurant Name" placeholder="e.g. Luigi's Pizza" />
              <Input
                label="Email Address"
                type="email"
                placeholder="owner@example.com"
                error="This email is already in use."
              />
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}