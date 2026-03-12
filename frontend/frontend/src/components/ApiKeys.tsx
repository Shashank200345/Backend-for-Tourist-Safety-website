import React, { useState } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API?.replace(/\/$/, '') || 'http://localhost:3001/api';

type Permissions = ('geofence' | 'heatmap')[];

export const ApiKeys: React.FC = () => {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Permissions>(['geofence', 'heatmap']);
  const [rateLimit, setRateLimit] = useState(1000);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ key?: string; message?: string; error?: string }>({});

  const togglePermission = (perm: 'geofence' | 'heatmap') => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult({});
    try {
      const res = await fetch(`${API_BASE_URL}/api-keys/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'My API Key',
          permissions,
          rateLimitPerHour: rateLimit,
          expiresAt: expiresAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResult({ error: data.error || 'Failed to generate API key' });
      } else {
        setResult({
          key: data.data?.key,
          message: 'Save this API key now! It will not be shown again.',
        });
      }
    } catch (err: any) {
      setResult({ error: err.message || 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">API Key Generator</h1>
        <span className="text-xs px-2 py-1 rounded-full bg-crypto-surface text-crypto-text-secondary border border-crypto-border">
          Protected endpoints: geofence, heatmap
        </span>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4 crypto-card p-4 border border-crypto-border/70">
        <div>
          <label className="block text-sm mb-1 text-crypto-text-secondary">Name</label>
          <input
            className="w-full rounded border border-crypto-border bg-crypto-surface px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-crypto-accent/60"
            placeholder="My App Key"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-crypto-text-secondary">Permissions</label>
          <div className="flex flex-wrap gap-3">
            {(['geofence', 'heatmap'] as Permissions).map((perm) => (
              <label key={perm} className="flex items-center gap-2 text-sm text-crypto-text-primary">
                <input
                  type="checkbox"
                  checked={permissions.includes(perm)}
                  onChange={() => togglePermission(perm)}
                  className="rounded border-crypto-border bg-crypto-surface"
                />
                {perm}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1 text-crypto-text-secondary">Rate limit (req/hour)</label>
            <input
              type="number"
              className="w-full rounded border border-crypto-border bg-crypto-surface px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-crypto-accent/60"
              value={rateLimit}
              onChange={(e) => setRateLimit(Number(e.target.value))}
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-crypto-text-secondary">Expires at (optional)</label>
            <input
              type="datetime-local"
              className="w-full rounded border border-crypto-border bg-crypto-surface px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-crypto-accent/60"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-crypto-accent to-emerald-500 hover:from-crypto-accent/90 hover:to-emerald-500/90 text-white px-4 py-2 rounded shadow transition disabled:opacity-50"
        >
          {isLoading ? 'Generating…' : 'Generate API Key'}
        </button>
      </form>

      {result.key && (
        <div className="p-4 rounded bg-emerald-900/30 border border-emerald-600/70 text-emerald-100">
          <div className="text-sm font-semibold mb-1">API Key (copy now):</div>
          <div className="font-mono break-all">{result.key}</div>
          <div className="text-xs mt-2 text-amber-200">
            {result.message || 'Save this key safely. It will not be shown again.'}
          </div>
        </div>
      )}

      {result.error && (
        <div className="p-3 rounded bg-red-900/30 border border-red-700/70 text-red-100">
          {result.error}
        </div>
      )}
    </div>
  );
};

