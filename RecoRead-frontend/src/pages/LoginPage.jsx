import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/library';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-semibold text-neutral-900 mb-4">Sign in</h1>
        <LoginForm onSuccess={() => nav(from, { replace: true })} />
      </div>
    </div>
  );
}