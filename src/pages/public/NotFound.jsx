import { MapPinOff } from 'lucide-react';
import { Button, EmptyState } from '../../components/ui';

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <EmptyState icon={MapPinOff} title="Page not found" message="The page you're looking for doesn't exist or has moved." action={<><Button to="/">Go home</Button><Button variant="secondary" to="/cars">Browse cars</Button></>} />
    </div>
  );
}
