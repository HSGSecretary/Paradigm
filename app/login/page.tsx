'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError('Incorrect password. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-amber-500 rounded rotate-12" />
          <span className="text-2xl font-semibold tracking-tight text-steel-100">
            Paradigm <span className="text-amber-500">OH</span>
          </span>
        </div>
        <p className="text-steel-400 text-sm">Paradigm Oral Health — project status portal</p>
      </div>

      {/* Login card */}
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-lg font-semibold text-steel-100 mb-1">Access portal</h1>
        <p className="text-steel-400 text-sm mb-6">Enter your password to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-steel-400 uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center disabled:opacity-60"
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-steel-600 text-xs">
        Contact your account manager for access.
      </p>
    </div>
  );
}
