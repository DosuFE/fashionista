
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useOrderById } from '@/hooks/orders/use-order-by-id';

import { useState } from 'react';
import { useCancelOrder } from '@/hooks/orders/use-cancel-order';

import { PayNowButton } from '@/components/payments/PayNowButton';

export default function OrderDetailsPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;

  const [reason, setReason] = useState('');
  const cancelOrderMutation = useCancelOrder(orderId);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useOrderById(orderId);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p>Loading order details...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-bold">
          Unable to load order
        </h1>

        <p className="mt-2 text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : 'Something went wrong.'}
        </p>

        <button
          onClick={() => refetch()}
          className="mt-4 rounded-md bg-black px-4 py-2 text-white"
        >
          Try again
        </button>

        <div className="mt-4">
          <Link
            href="/orders"
            className="underline"
          >
            Back to my orders
          </Link>
        </div>
      </main>
    );
  }

  const order = data?.data;

  if (!order) {
    return (
      <main className="p-6">
        <p>Order not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <Link
          href="/orders"
          className="text-sm underline"
        >
          ← Back to my orders
        </Link>

        <h1 className="mt-4 text-2xl font-bold">
          Order Details
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Order number: {order.orderNumber}
        </p>
      </div>

      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Order summary
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span>Order status</span>
            <span className="font-medium">
              {order.status}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>Payment status</span>
            <span className="font-medium">
              {order.paymentStatus}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span>Subtotal</span>
            <span>₦{order.subtotal}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span>Shipping fee</span>
            <span>₦{order.shippingFee}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span>Discount</span>
            <span>₦{order.discount}</span>
          </div>

          <div className="flex justify-between gap-4 border-t pt-3 text-base font-bold">
            <span>Total</span>
            <span>₦{order.total}</span>
          </div>
        </div>
      </section>

      {order.paymentStatus !== 'PAID' &&
        order.status !== 'CANCELLED' && (
          <PayNowButton orderId={order.id} />
        )}

      {(order.cancellationRequestStatus ||
        order.cancellationReason ||
        order.cancellationReviewNote) && (
        <section className="rounded-lg border p-5">
          <h2 className="text-lg font-semibold">
            Cancellation information
          </h2>

          {order.cancellationRequestStatus && (
            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span>Request status</span>
              <span className="font-medium">
                {order.cancellationRequestStatus}
              </span>
            </div>
          )}

          {order.cancellationReason && (
            <div className="mt-3">
              <p className="text-sm font-medium">
                Your reason
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {order.cancellationReason}
              </p>
            </div>
          )}

          {order.cancellationReviewNote && (
            <div className="mt-3">
              <p className="text-sm font-medium">
                Staff review note
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {order.cancellationReviewNote}
              </p>
            </div>
          )}

          {order.cancellationRequestStatus === 'PENDING' && (
            <p className="mt-3 text-sm text-amber-700">
              Your cancellation request is awaiting staff review.
            </p>
          )}

          {order.cancellationRequestStatus === 'REJECTED' && (
            <p className="mt-3 text-sm text-red-600">
              Your cancellation request was rejected. Your order
              remains subject to its current order status.
            </p>
          )}

          {order.cancellationRequestStatus === 'APPROVED' && (
            <p className="mt-3 text-sm text-green-700">
              Your cancellation request has been approved.
            </p>
          )}
        </section>
      )}

      {(order.status === 'PENDING' ||
        order.status === 'CONFIRMED' ||
        order.status === 'PROCESSING') && (
            <section className="rounded-lg border p-5">
                <h2 className="text-lg font-semibold">
                  Cancel order
                </h2>

                {order.status === 'PROCESSING' ? (
                <p className="mt-2 text-sm text-gray-600">
                    Your order is being processed. You can request
                    cancellation, but staff must review your request.
                </p>
                ) : (
                <p className="mt-2 text-sm text-gray-600">
                    You can cancel this order before it enters
                    processing or shipping.
                </p>
                )}

                <label
                htmlFor="cancellation-reason"
                className="mt-4 block text-sm font-medium"
                >
                Reason (optional)
                </label>

                <textarea
                id="cancellation-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Tell us why you want to cancel..."
                className="mt-2 w-full rounded-md border px-3 py-2"
                />

                <button
                type="button"
                disabled={cancelOrderMutation.isPending}
                onClick={() => {
                    const confirmed = window.confirm(
                    order.status === 'PROCESSING'
                        ? 'Submit a cancellation request for staff review?'
                        : 'Are you sure you want to cancel this order?',
                    );

                    if (!confirmed) return;

                    cancelOrderMutation.mutate({
                    reason: reason.trim() || undefined,
                    });
                }}
                className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                {cancelOrderMutation.isPending
                    ? 'Submitting...'
                    : order.status === 'PROCESSING'
                    ? 'Request cancellation'
                    : 'Cancel order'}
                </button>

                {cancelOrderMutation.isSuccess && (
                <div
                    role="status"
                    className="mt-4 rounded-md border border-green-300 p-3 text-sm"
                >
                    <p className="font-medium">
                    {cancelOrderMutation.data.data.message}
                    </p>

                    {cancelOrderMutation.data.data.cancellationRequestStatus ===
                    'PENDING' && (
                    <p className="mt-1">
                        Your order has not been cancelled yet.
                        It remains in processing until staff review
                        your request.
                    </p>
                    )}
                </div>
                )}

                {cancelOrderMutation.isError && (
                <div
                    role="alert"
                    className="mt-4 rounded-md border border-red-300 p-3 text-sm text-red-700"
                >
                    {cancelOrderMutation.error instanceof Error
                    ? cancelOrderMutation.error.message
                    : 'Unable to cancel this order. Please try again.'}
                </div>
                )}
            </section>
       )}


      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-lg font-semibold">
          Items ordered
        </h2>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0"
            >
              <div>
                <p className="font-medium">
                  {item.productName}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  SKU: {item.sku}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  ₦{item.subtotal}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  ₦{item.unitPrice} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="mb-3 text-lg font-semibold">
          Delivery address
        </h2>

        <p>{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.phone}</p>
        <p>{order.shippingAddress.address}</p>
        <p>
          {order.shippingAddress.city},{' '}
          {order.shippingAddress.state}
        </p>

        {order.notes && (
          <div className="mt-4">
            <p className="font-medium">
              Delivery notes
            </p>
            <p className="mt-1 text-sm">
              {order.notes}
            </p>
          </div>
        )}
      </section>

      <p className="text-sm text-gray-500">
        Created:{' '}
        {new Date(order.createdAt).toLocaleString()}
      </p>
    </main>
  );
}
