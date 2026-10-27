import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { useStore } from '../store/AppStore';
import { Button } from '../components/ui';
import { ROLE_META } from '../config/site';
import { DEMO_USER_IDS } from '../data/seed';

/** Frontend-only role guard. A real backend must enforce the same rules on every API call. */
export default function ProtectedRoute({ roles }) {
  const { role, login } = useStore();
  const loc = useLocation();
  const next = encodeURIComponent(loc.pathname + loc.search);
  if (!role) {
    if (roles.includes('admin')) return <Navigate to={`/admin/login?next=${next}`} replace />;
    if (roles.length === 1 && roles[0] === 'buyer') return <Navigate to={`/buyer/welcome?next=${next}`} replace />;
    return <Navigate to={`/signin?next=${next}${roles.length === 1 ? `&role=${roles[0]}` : ''}`} replace />;
  }
  if (!roles.includes(role)) {
    const target = roles[0];
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="card max-w-md p-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bad-50 text-bad-600">
            <ShieldX className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold">This area is for {roles.map((r) => ROLE_META[r].label).join(' / ')} accounts</h1>
          <p className="mt-2 text-sm text-mist-600">You're signed in as {ROLE_META[role].label}. Each account has one role, so dealer, seller and agent tools stay separate.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="secondary" to={ROLE_META[role].home}>
              Go to my dashboard
            </Button>
            <Button onClick={() => login(DEMO_USER_IDS[target])}>Switch to demo {ROLE_META[target].label}</Button>
          </div>
        </div>
      </div>
    );
  }
  return <Outlet />;
}
