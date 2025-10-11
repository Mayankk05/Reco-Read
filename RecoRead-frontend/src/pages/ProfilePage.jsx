import { useEffect, useState } from 'react';
import { getProfile } from '../api/authApi';

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    getProfile().then(setData).catch((e) => {
      setErr(e?.response?.data?.message || e?.message || 'Failed to load profile');
    });
  }, []);

  if (err) return <div className="mx-auto max-w-3xl px-4 py-8 text-error-500">{err}</div>;
  if (!data) return <div className="mx-auto max-w-3xl px-4 py-8 text-neutral-700">Loading profile…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Profile</h1>
      <div className="mt-4 grid gap-2">
        <div><span className="font-semibold">Username:</span> {data.username}</div>
        <div><span className="font-semibold">Email:</span> {data.email}</div>
        {data.fullName && <div><span className="font-semibold">Name:</span> {data.fullName}</div>}
        <div className="text-sm text-neutral-600 mt-2">
          Created: {new Date(data.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}