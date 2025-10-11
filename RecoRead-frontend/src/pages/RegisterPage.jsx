import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  const nav = useNavigate();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-semibold text-neutral-900 mb-4">Create account</h1>
        <RegisterForm onSuccess={() => nav('/library', { replace: true })} />
      </div>
    </div>
  );
}