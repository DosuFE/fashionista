'use client';

import { useEffect, useState } from 'react';

import { getHealth, type HealthResponse } from '@/services/health.service';

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await getHealth();

        setHealth(data);
      } catch {
        setError('Unable to connect to the API.');
      } finally {
        setLoading(false);
      }
    }

    checkHealth();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border p-6 shadow-sm">
        <h1 className="text-2xl font-bold">
          Fashion Boutique API
        </h1>

        {loading && (
          <p className="mt-4 text-sm text-gray-500">
            Checking API...
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500">
            {error}
          </p>
        )}

        {health && (
          <div className="mt-6 space-y-2">
            <p className="font-medium">
              {health.message}
            </p>

            <p className="text-sm">
              Status: {health.data.status}
            </p>

            <p className="text-sm">
              Status Code: {health.statusCode}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}