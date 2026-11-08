'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useLogin } from '@/hooks/auth/use-login';

export default function LoginPage() {
  const router = useRouter();

  const loginMutation = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    loginMutation.mutate(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          router.push('/cart');
        },
      },
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Login
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Login to access your Fashionista account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
            />
          </div>

          {/* Error */}
          {loginMutation.isError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {loginMutation.error instanceof Error
                ? loginMutation.error.message
                : 'Login failed'}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-md bg-black px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loginMutation.isPending
              ? 'Logging in...'
              : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}