
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAdminOrderById } from '@/hooks/orders/use-admin-order-by-id';
import AdminNavigation from '@/components/admin/admin-navigation';
import { useUpdateOrderStatus } from '@/hooks/orders/use-update-order-status';
import type { UpdateOrderStatus, } from '@/services/order.service';

const formatMoney = (amount: string | number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(Number(amount));

const formatDate = (date: string) =>
  new Date(date).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const statusStyle = (status: string) => {
  switch (status) {
    case 'DELIVERED':
    case 'SUCCESS':
    case 'APPROVED':
      return 'bg-green-100 text-green-700';
    case 'CANCELLED':
    case 'FAILED':
    case 'ABANDONED':
    case 'REJECTED':
      return 'bg-red-100 text-red-700';
    case 'PROCESSING':
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-amber-100 text-amber-700';
  }
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyle(status)}`}
    >
      {status.replaceAll('_', ' ')}
    </span>
  );
}

export default function AdminOrderDetailsPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;

  const updateStatusMutation = useUpdateOrderStatus(orderId);
  const [selectedStatus, setSelectedStatus] =
  useState<UpdateOrderStatus | ''>('');

  const { data, isLoading, isError, error, refetch } =
    useAdminOrderById(orderId);

  const order = data?.data;
  
  const allowedNextStatuses: Record<UpdateOrderStatus, UpdateOrderStatus[]> = {
    PENDING: ['CONFIRMED'],
    CONFIRMED: ['PROCESSING'],
    PROCESSING: ['SHIPPED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
    };

    const nextStatuses =
    order?.status
        ? allowedNextStatuses[
            order.status as UpdateOrderStatus
        ] ?? []
        : [];

    const availableStatuses =
    order?.status === 'CONFIRMED' &&
    order.paymentStatus !== 'PAID'
        ? []
        : nextStatuses;

    const hasPendingCancellation =
    order?.cancellationRequestStatus === 'PENDING';

    const canUpdateStatus =
    Boolean(order) &&
    availableStatuses.length > 0 &&
    !hasPendingCancellation;

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-gray-500">Loading order details...</p>
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="space-y-4 p-6">
        <AdminNavigation />
        <Link
          href="/admin/orders"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to orders
        </Link>

        <h1 className="text-2xl font-bold">Order details unavailable</h1>

        <p className="text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : 'We could not find this order. Check the order ID and try again.'}
        </p>

        <button
          onClick={() => refetch()}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Try again
        </button>
      </main>
    );
  }

  const address = order.shippingAddress;

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <Link
        href="/admin/orders"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to orders
      </Link>

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
            <h1 className="text-2xl font-bold">Order details</h1>
            <p className="mt-1 text-sm text-gray-500">
                Order number: {order.orderNumber}
            </p>
            <p className="mt-1 text-sm text-gray-500">
                Placed on {formatDate(order.createdAt)}
            </p>
            </div>

            <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
            </div>
        </section>

        <section className="rounded-xl border p-5">
            <h2 className="font-semibold">
                Order fulfillment
            </h2>

            <p className="mt-2 text-sm text-gray-500">
                Update the order as it moves through fulfillment.
            </p>

            {hasPendingCancellation && (
                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                This order has a pending cancellation request.
                Review the request before changing its status.
                </p>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <select
                value={selectedStatus || order.status}
                onChange={(event) =>
                    setSelectedStatus(
                    event.target.value as UpdateOrderStatus,
                    )
                }
                disabled={
                    !canUpdateStatus ||
                    updateStatusMutation.isPending
                }
                className="min-h-11 rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                <option value={order.status}>
                    Current status: {order.status}
                </option>

                {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                    {status.replaceAll('_', ' ')}
                    </option>
                ))}
                </select>

                <button
                type="button"
                disabled={
                    !canUpdateStatus ||
                    !selectedStatus ||
                    selectedStatus === order.status ||
                    updateStatusMutation.isPending
                }
                onClick={() => {
                    if (
                    selectedStatus &&
                    selectedStatus !== order.status
                    ) {
                    updateStatusMutation.mutate({
                        status: selectedStatus,
                    });
                    }
                }}
                className="min-h-11 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {updateStatusMutation.isPending
                    ? 'Updating...'
                    : 'Update status'}
                </button>
            </div>

            {!hasPendingCancellation &&
                availableStatuses.length === 0 && (
                <p className="mt-3 text-sm text-gray-500">
                    No further fulfillment status updates are
                    available for this order.
                </p>
                )}

            {updateStatusMutation.isSuccess && (
                <p className="mt-3 text-sm text-green-700">
                Order status updated successfully.
                </p>
            )}

            {updateStatusMutation.isError && (
                <p className="mt-3 text-sm text-red-600">
                {updateStatusMutation.error instanceof Error
                    ? updateStatusMutation.error.message
                    : 'Unable to update the order status. Please try again.'}
                </p>
            )}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border">
            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">Items ordered</h2>
            </div>

            {order.items.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">
                No items are listed for this order.
              </p>
            ) : (
              <div className="divide-y">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-2 p-5 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        SKU: {item.sku}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-medium">
                        {formatMoney(item.subtotal)}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatMoney(item.unitPrice)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="font-semibold">Shipping address</h2>

            <div className="mt-4 space-y-2 text-sm">
              <p className="font-medium">{address.fullName}</p>
              <p>{address.phone}</p>
              <p>{address.address}</p>
              <p>
                {address.city}, {address.state}
              </p>
            </div>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="font-semibold">Cancellation information</h2>

            {order.cancellationReason ||
            order.cancellationRequestStatus ? (
              <div className="mt-4 space-y-3 text-sm">
                {order.cancellationRequestStatus && (
                  <p>
                    <span className="text-gray-500">
                      Request status:{' '}
                    </span>
                    <StatusBadge
                      status={order.cancellationRequestStatus}
                    />
                  </p>
                )}

                {order.cancellationReason && (
                  <p>
                    <span className="text-gray-500">Reason: </span>
                    {order.cancellationReason}
                  </p>
                )}

                {order.cancellationRequestedAt && (
                  <p>
                    <span className="text-gray-500">
                      Requested on:{' '}
                    </span>
                    {formatDate(order.cancellationRequestedAt)}
                  </p>
                )}

                {order.cancellationReviewedAt && (
                  <p>
                    <span className="text-gray-500">
                      Reviewed on:{' '}
                    </span>
                    {formatDate(order.cancellationReviewedAt)}
                  </p>
                )}

                {order.cancellationReviewNote && (
                  <p>
                    <span className="text-gray-500">
                      Review note:{' '}
                    </span>
                    {order.cancellationReviewNote}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                No cancellation request has been recorded.
              </p>
            )}
          </div>
        </div>

        <aside className="h-fit space-y-6">
          <div className="rounded-xl border p-5">
            <h2 className="font-semibold">Order summary</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Shipping fee</span>
                <span>{formatMoney(order.shippingFee)}</span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Discount</span>
                <span>{formatMoney(order.discount)}</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between gap-3 font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="font-semibold">Order notes</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">
              {order.notes || 'No additional notes provided.'}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
