
'use client';

import Link from 'next/link';
import {
  ShoppingBag,
  Users,
  Wallet,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

import { useDashboardOverview } from '@/hooks/dashboard/use-dashboard-overview';
import { useRecentOrders } from '@/hooks/dashboard/use-recent-orders';
import { useLowStockAlerts } from '@/hooks/dashboard/use-low-stock-alerts';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardOverview();

  const overview = data?.data;

  const {
    data: recentOrdersData,
    isLoading: isRecentOrdersLoading,
    isError: isRecentOrdersError,
    refetch: refetchRecentOrders,
  } = useRecentOrders();

  const recentOrders = recentOrdersData?.data ?? [];

  const {
    data: lowStockData,
    isLoading: isLowStockLoading,
    isError: isLowStockError,
    refetch: refetchLowStock,
  } = useLowStockAlerts(5);

  const lowStockAlerts = lowStockData?.data;

  const summaryCards = [
    {
      title: 'Total Orders',
      value: overview?.totalOrders ?? 0,
      icon: ShoppingBag,
      description: 'All orders received',
    },
    {
      title: 'Total Customers',
      value: overview?.totalCustomers ?? 0,
      icon: Users,
      description: 'Registered customers',
    },
    {
      title: 'Total Revenue',
      value: overview?.totalRevenue ?? 0,
      icon: Wallet,
      description: 'From successful payments',
      isCurrency: true,
    },
    {
      title: 'Pending Orders',
      value: overview?.pendingOrders ?? 0,
      icon: Clock,
      description: 'Awaiting confirmation',
    },
  ];

  const orderStatuses = [
    {
      label: 'Pending',
      value: overview?.pendingOrders ?? 0,
      icon: Clock,
    },
    {
      label: 'Processing',
      value: overview?.processingOrders ?? 0,
      icon: Package,
    },
    {
      label: 'Shipped',
      value: overview?.shippedOrders ?? 0,
      icon: Truck,
    },
    {
      label: 'Delivered',
      value: overview?.deliveredOrders ?? 0,
      icon: CheckCircle2,
    },
    {
      label: 'Cancelled',
      value: overview?.cancelledOrders ?? 0,
      icon: XCircle,
    },
  ];

  const quickLinks = [
    {
      title: 'Manage Products',
      description: 'Add, edit and manage store products.',
      href: '/admin/products',
      icon: ShoppingBag,
    },
    {
      title: 'Manage Categories',
      description: 'Organise your store product categories.',
      href: '/admin/categories',
      icon: Package,
    },
    {
      title: 'Manage Orders',
      description: 'View orders and update fulfilment status.',
      href: '/admin/orders',
      icon: Truck,
    },
  ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening in your store.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={isLoading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            Unable to load dashboard information.
          </p>
          <p className="mt-1 text-sm text-red-600">
            Please check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm font-semibold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <div className="rounded-lg bg-gray-100 p-2.5">
                  <Icon size={20} className="text-gray-700" />
                </div>
              </div>

              <div className="mt-5">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLoading
                    ? '...'
                    : card.isCurrency
                      ? formatCurrency(Number(card.value))
                      : card.value.toLocaleString()}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Fulfilment Overview */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Fulfilment
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your store's order statuses.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {orderStatuses.map((status) => {
            const Icon = status.icon;

            return (
              <div
                key={status.label}
                className="rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-center gap-2 text-gray-500">
                  <Icon size={17} />
                  <span className="text-sm">{status.label}</span>
                </div>

                <p className="mt-3 text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : status.value.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Quick Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Quickly access important areas of your store.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.title}
                href={link.href}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <Icon size={21} className="text-gray-700" />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-900"
                  />
                </div>

                <h3 className="mt-5 font-semibold text-gray-900">
                  {link.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {link.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
     
      {/* Recent Orders */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              The latest five orders placed in your store.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
          >
            View all orders
            <ArrowRight size={16} />
          </Link>
        </div>

        {isRecentOrdersLoading ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Loading recent orders...
          </div>
        ) : isRecentOrdersError ? (
          <div className="py-10 text-center">
            <p className="text-sm text-red-600">
              Unable to load recent orders.
            </p>

            <button
              onClick={() => refetchRecentOrders()}
              className="mt-2 text-sm font-semibold text-gray-700 underline"
            >
              Try again
            </button>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingBag className="mx-auto text-gray-400" size={32} />

            <p className="mt-3 text-sm font-medium text-gray-700">
              No orders yet
            </p>

            <p className="mt-1 text-xs text-gray-500">
              New customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="text-sm transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">
                        {order.customer.firstName}{' '}
                        {order.customer.lastName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {order.customer.email}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-900">
                      {new Intl.NumberFormat('en-NG', {
                        style: 'currency',
                        currency: 'NGN',
                        maximumFractionDigits: 0,
                      }).format(order.total)}
                    </td>

                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : order.paymentStatus === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {order.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Low-Stock Inventory Alerts */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Low-Stock Inventory Alerts
              </h2>

              {lowStockAlerts && lowStockAlerts.totalAlerts > 0 && (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                  {lowStockAlerts.totalAlerts} alerts
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Products and variants with 5 or fewer units remaining.
            </p>
          </div>

          <button
            onClick={() => refetchLowStock()}
            disabled={isLowStockLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={isLowStockLoading ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>

        {isLowStockLoading ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Loading inventory alerts...
          </div>
        ) : isLowStockError ? (
          <div className="rounded-lg bg-red-50 p-5 text-center">
            <p className="text-sm text-red-700">
              Unable to retrieve inventory alerts.
            </p>

            <button
              onClick={() => refetchLowStock()}
              className="mt-2 text-sm font-semibold text-red-700 underline"
            >
              Try again
            </button>
          </div>
        ) : lowStockAlerts?.totalAlerts === 0 ? (
          <div className="rounded-lg bg-green-50 p-6 text-center">
            <CheckCircle2
              size={32}
              className="mx-auto text-green-600"
            />

            <p className="mt-3 font-semibold text-green-800">
              Inventory looks good!
            </p>

            <p className="mt-1 text-sm text-green-700">
              No low-stock products or variants were found.
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {/* Product Alerts */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-800">
                Products ({lowStockAlerts?.totalLowStockProducts ?? 0})
              </h3>

              {lowStockAlerts?.products.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">SKU</th>
                        <th className="px-4 py-3 font-medium">Stock Left</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {lowStockAlerts.products.map((product) => (
                        <tr key={product.id} className="text-sm">
                          <td className="px-4 py-4 font-medium text-gray-900">
                            {product.name}
                          </td>

                          <td className="px-4 py-4 text-gray-500">
                            {product.sku}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                              {product.stockQuantity} units
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <Link
                              href="/admin/products"
                              className="text-sm font-semibold text-gray-700 hover:underline"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                  No low-stock products.
                </p>
              )}
            </div>

            {/* Variant Alerts */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-800">
                Product Variants ({lowStockAlerts?.totalLowStockVariants ?? 0})
              </h3>

              {lowStockAlerts?.variants.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Variant</th>
                        <th className="px-4 py-3 font-medium">SKU</th>
                        <th className="px-4 py-3 font-medium">Stock Left</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {lowStockAlerts.variants.map((variant) => (
                        <tr key={variant.id} className="text-sm">
                          <td className="px-4 py-4 font-medium text-gray-900">
                            {variant.productName}
                          </td>

                          <td className="px-4 py-4 text-gray-600">
                            {[variant.size, variant.color]
                              .filter(Boolean)
                              .join(' / ') || 'Default'}
                          </td>

                          <td className="px-4 py-4 text-gray-500">
                            {variant.sku}
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                              {variant.stockQuantity} units
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <Link
                              href="/admin/products"
                              className="text-sm font-semibold text-gray-700 hover:underline"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                  No low-stock variants.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
