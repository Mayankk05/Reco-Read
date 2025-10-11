import { useState } from 'react';
import { register } from '../../api/authApi';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail, parseErrorMessage } from '../../utils/helpers';

export default function RegisterForm({ onSuccess }) {
  const { login: setSession } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!isValidEmail(form.email)) {
      setErr('Please enter a valid email');
      return;
    }
    setSubmitting(true);
    try {
      const data = await register(form);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1">Username</label>
        <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="input-field"
            placeholder="yourname"
            required
            minLength={3}
            maxLength={50}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-800 mb-1">Full name (optional)</label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="input-field"
            placeholder="Jane Doe"
            maxLength={100}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-neutral-800 mb-1">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="input-field"
          placeholder="you@example.com"
          required
          maxLength={100}
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
          minLength={6}
          maxLength={100}
        />
      </div>
      {err && <div className="text-error-500 text-sm">{err}</div>}
      <button disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}