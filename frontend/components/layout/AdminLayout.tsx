import { Link, Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  ChefHat,
  CalendarDays,
  Package,
  Users,
  BarChart3,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { authClient } from '../../lib/auth-client';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Overview', href: '', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
  { name: 'Kitchen (KDS)', href: '/kitchen', icon: ChefHat },
  { name: 'Reservations', href: '/reservations', icon: CalendarDays },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AdminLayout() {
  const { restaurantId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const basePath = `/admin/${restaurantId}`;

  async function handleSignOut() {
    await authClient.signOut();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-ink-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-ink-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-ink-200">
          <Link to="/" className="flex items-center gap-2 text-ink-500 hover:text-ink-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-semibold text-brand-600">RestaurantOS</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const href = `${basePath}${item.href}`;
            const isActive = location.pathname === href;
            return (
              <Link
                key={item.name}
                to={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink-200">
          <div className="text-sm font-medium text-ink-900 truncate">{session?.user.name}</div>
          <div className="text-xs text-ink-500 truncate mb-3">{session?.user.email}</div>
          <Button variant="secondary" size="sm" className="w-full" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}