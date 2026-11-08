
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePendingCancellationRequests } from '@/hooks/orders/use-pending-cancellation-requests';
import { useReviewCancellation } from '@/hooks/orders/use-review-cancellation';
import AdminNavigation from '@/components/admin/admin-navigation';

function CancellationRequestCard({
  request,
}: {
  request: {
    id: string;
    orderNumber: string;
    status: string;
    cancellationRequestStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
    cancellationReason: string | null;
    cancellationRequestedAt: string | null;
    createdAt: string;
  };
}) {
  const [reviewNote, setReviewNote] = useState('');
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>(
    'APPROVED',
  );

  const reviewMutation = useReviewCancellation(request.id);

  const requestedDate = request.cancellationRequestedAt
    ? new Date(request.cancellationRequestedAt).toLocaleString('en-NG')
    : 'Date unavailable';

  const handleReview = () => {
    if (reviewMutation.isPending) return;

    const confirmed = window.confirm(
      `Are you sure you want to ${decision.toLowerCase()} the cancellation request for ${request.orderNumber}?`,
    );

    if (!confirmed) return;

    reviewMutation.mutate({
      decision,
      reviewNote: reviewNote.trim() || undefined,
    });
  };

  return (
    <article className="space-y-4 rounded-xl border p-5">
      <AdminNavigation />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm text-gray-500">Order number</p>
          <h2 className="mt-1 text-lg font-semibold">
            {request.orderNumber}
          </h2>
        </div>

        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
          Awaiting review
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-gray-500">Current order status</p>
          <p className="mt-1 font-medium">
            {request.status.replaceAll('_', ' ')}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Request date</p>
          <p className="mt-1 text-sm">{requestedDate}</p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm font-medium">Customer's reason</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
          {request.cancellationReason || 'No reason provided.'}
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">
          Review decision
          <select
            value={decision}
            onChange={(event) =>
              setDecision(event.target.value as 'APPROVED' | 'REJECTED')
            }
            disabled={reviewMutation.isPending}
            className="mt-2 w-full rounded-lg border px-3 py-2"
          >
            <option value="APPROVED">Approve cancellation</option>
            <option value="REJECTED">Reject cancellation</option>
          </select>
        </label>

        <label className="block text-sm font-medium">
          Review note (optional)
          <textarea
            value={reviewNote}
            onChange={(event) => setReviewNote(event.target.value)}
            disabled={reviewMutation.isPending}
            placeholder="Explain your decision..."
            rows={3}
            className="mt-2 w-full rounded-lg border px-3 py-2 font-normal"
          />
        </label>

        <button
          type="button"
          onClick={handleReview}
          disabled={reviewMutation.isPending}
          className="w-full rounded-lg bg-black px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {reviewMutation.isPending
            ? 'Submitting review...'
            : 'Submit review'}
        </button>

        {reviewMutation.isError && (
          <p className="text-sm text-red-600">
            The review could not be submitted. Please try again.
          </p>
        )}

        {reviewMutation.isSuccess && (
          <p className="text-sm text-green-700">
            {reviewMutation.data.data.message}
          </p>
        )}
      </div>

      <div>
        <Link
          href={`/admin/orders/${request.id}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View full order details
        </Link>
      </div>
    </article>
  );
}

export default function AdminCancellationRequestsPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = usePendingCancellationRequests();

  const requests = data?.data ?? [];

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <div>
        <Link
          href="/admin/orders"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to orders
        </Link>

        <h1 className="mt-3 text-2xl font-bold">
          Cancellation Requests
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review customer requests to cancel orders that require staff approval.
        </p>
      </div>

      <section className="rounded-xl border p-5">
        <p className="text-sm text-gray-500">
          Pending requests
        </p>
        <p className="mt-2 text-3xl font-bold">
          {isLoading ? '—' : requests.length}
        </p>
      </section>

      {isLoading && (
        <p className="text-sm text-gray-500">
          Loading cancellation requests...
        </p>
      )}

      {isError && (
        <div className="space-y-3 rounded-xl border border-red-200 p-5">
          <p className="text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : 'Unable to load cancellation requests.'}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && requests.length === 0 && (
        <div className="rounded-xl border p-10 text-center">
          <h2 className="font-semibold">
            No pending cancellation requests
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            New requests will appear here when they need staff review.
          </p>
        </div>
      )}

      {!isLoading && !isError && requests.length > 0 && (
        <section className="space-y-4">
          {requests.map((request) => (
            <CancellationRequestCard
              key={request.id}
              request={request}
            />
          ))}
        </section>
      )}
    </main>
  );
}
