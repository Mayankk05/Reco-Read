import { useState } from 'react';
import { login } from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';
import { parseErrorMessage } from '../../utils/helpers';

export default function LoginForm({ onSuccess }) {
  const { login: setSession } = useAuth();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');
    try {
      const data = await login(form);
      setSession(data.token, data.user);
      onSuccess?.(data);
    } catch (error) {
      setErr(parseErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-300 bg-card-500 p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-1">Username or Email</label>
        <input
          name="usernameOrEmail"
          value={form.usernameOrEmail}
          onChange={handleChange}
          className="input-field"
          placeholder="yourname or you@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-1">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="input-field"
          placeholder="••••••••"
          required
        />
      </div>
      {err && <div className="text-error-500 text-sm">{err}</div>}
      <button disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}