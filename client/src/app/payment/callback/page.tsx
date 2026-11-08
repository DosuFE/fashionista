
'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

type PaymentResult = {
  message: string;
  status?: string;
  reference?: string;
  orderId?: string;
};

function CallbackContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get('reference') || searchParams.get('trxref');

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function verifyPayment() {
      if (!reference) {
        setError('Payment reference was not found in the URL.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.post<PaymentResult>(
          '/payments/verify',
          { reference },
        );

        setResult(response.data);
      } catch (err: unknown) {
        const message =
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          typeof err.response === 'object' &&
          err.response !== null &&
          'data' in err.response &&
          typeof err.response.data === 'object' &&
          err.response.data !== null &&
          'message' in err.response.data &&
          typeof err.response.data.message === 'string'
            ? err.response.data.message
            : 'We could not verify your payment. Please try again.';

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void verifyPayment();
  }, [reference]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      {loading ? (
        <>
          <h1 className="text-2xl font-bold">Verifying your payment</h1>
          <p className="mt-3 text-muted-foreground">
            Please wait while we confirm your transaction securely.
          </p>
        </>
      ) : result?.status === 'success' ? (
        <>
          <h1 className="text-2xl font-bold text-green-600">
            Payment successful!
          </h1>
          <p className="mt-3">{result.message}</p>
          {result.orderId && (
            <Link
              href={`/orders/${result.orderId}`}
              className="mt-6 rounded-md bg-primary px-5 py-3 text-primary-foreground"
            >
              View order
            </Link>
          )}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">
            {result?.status === 'abandoned' ||
            result?.status === 'failed'
              ? 'Payment not completed'
              : 'Unable to confirm payment'}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {error || result?.message}
          </p>
          <Link
            href="/orders"
            className="mt-6 rounded-md border px-5 py-3"
          >
            Return to my orders
          </Link>
        </>
      )}
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="p-8 text-center">
          Loading payment details...
        </main>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
