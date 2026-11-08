
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAdminOrders } from '@/hooks/orders/use-admin-orders';
import AdminNavigation from '@/components/admin/admin-navigation';

const orderStatuses = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const paymentStatuses = ['PENDING', 'SUCCESS', 'FAILED', 'ABANDONED'];

const formatMoney = (amount: string | number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(Number(amount));

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const statusStyle = (status: string) => {
  switch (status) {
    case 'DELIVERED':
    case 'SUCCESS':
      return 'bg-green-100 text-green-700';
    case 'CANCELLED':
    case 'FAILED':
    case 'ABANDONED':
      return 'bg-red-100 text-red-700';
    case 'PROCESSING':
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-amber-100 text-amber-700';
  }
};

export default function AdminOrdersPage() {
  const { data, isLoading, isError, error, refetch } = useAdminOrders();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  const orders = data?.data ?? [];

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !searchValue ||
        order.orderNumber.toLowerCase().includes(searchValue) ||
        order.shippingAddress.fullName.toLowerCase().includes(searchValue) ||
        order.shippingAddress.phone.includes(searchValue);

      const matchesStatus =
        statusFilter === 'ALL' || order.status === statusFilter;

      const matchesPayment =
        paymentFilter === 'ALL' ||
        order.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const pendingCount = orders.filter(
    (order) => order.status === 'PENDING',
  ).length;

  const processingCount = orders.filter(
    (order) => order.status === 'PROCESSING',
  ).length;

  const cancelledCount = orders.filter(
    (order) => order.status === 'CANCELLED',
  ).length;

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-sm text-gray-500">Loading orders...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="space-y-4 p-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : 'Unable to load orders. Please try again.'}
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

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <AdminNavigation />
      <div>
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage customer orders across Fashionista.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total orders</p>
          <p className="mt-2 text-2xl font-bold">{orders.length}</p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="mt-2 text-2xl font-bold">{pendingCount}</p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Processing</p>
          <p className="mt-2 text-2xl font-bold">{processingCount}</p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="mt-2 text-2xl font-bold">{cancelledCount}</p>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order number, customer or phone..."
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="ALL">All order statuses</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="ALL">All payment statuses</option>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>

        {filteredOrders.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center">
            <p className="font-medium">No orders found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Order status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium">
                      {order.orderNumber}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {order.shippingAddress.fullName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {order.shippingAddress.phone}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {formatMoney(order.total)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(order.status)}`}
                      >
                        {order.status.replaceAll('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(order.paymentStatus)}`}
                      >
                        {order.paymentStatus.replaceAll('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        View order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
