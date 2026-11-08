
'use client';

import { useState } from 'react';
import { useReviewCancellation } from '@/hooks/orders/use-review-cancellation';
import type { CancellationReviewDecision } from '@/types/order';

interface CancellationReviewPanelProps {
  orderId: string;
  orderNumber: string;
  cancellationRequestStatus:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | null;
  cancellationReason?: string | null;
}

export function CancellationReviewPanel({
  orderId,
  orderNumber,
  cancellationRequestStatus,
  cancellationReason,
}: CancellationReviewPanelProps) {
  const [reviewNote, setReviewNote] = useState('');
  const mutation = useReviewCancellation(orderId);

  const handleReview = (decision: CancellationReviewDecision) => {
    const action = decision === 'APPROVED' ? 'approve' : 'reject';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} the cancellation request for ${orderNumber}?`,
    );

    if (!confirmed) return;

    mutation.mutate({
      decision,
      reviewNote: reviewNote.trim() || undefined,
    });
  };

  if (cancellationRequestStatus !== 'PENDING') {
    return (
      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">
          Cancellation review
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          No pending cancellation request requires your review.
        </p>

        {cancellationRequestStatus && (
          <p className="mt-2 text-sm">
            Current decision: {cancellationRequestStatus}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-lg border p-5">
      <div>
        <h2 className="text-lg font-semibold">
          Review cancellation request
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Order: {orderNumber}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium">
          Customer's reason
        </p>

        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
          {cancellationReason || 'No reason provided.'}
        </p>
      </div>

      <div>
        <label
          htmlFor={`review-note-${orderId}`}
          className="block text-sm font-medium"
        >
          Review note (optional)
        </label>

        <textarea
          id={`review-note-${orderId}`}
          value={reviewNote}
          onChange={(event) => setReviewNote(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Explain your decision..."
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => handleReview('APPROVED')}
          className="rounded-md bg-green-700 px-4 py-2 text-white disabled:opacity-50"
        >
          {mutation.isPending ? 'Submitting...' : 'Approve'}
        </button>

        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => handleReview('REJECTED')}
          className="rounded-md bg-red-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {mutation.isPending ? 'Submitting...' : 'Reject'}
        </button>
      </div>

      {mutation.isSuccess && (
        <p role="status" className="text-sm text-green-700">
          {mutation.data.data.message}
        </p>
      )}

      {mutation.isError && (
        <p role="alert" className="text-sm text-red-600">
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'Unable to review this cancellation request.'}
        </p>
      )}
    </section>
  );
}
