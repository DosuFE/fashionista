'use client';

import { useOrders } from '@/hooks/orders/use-orders';

export default function OrdersApiTest() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useOrders();

  if (isLoading) {
    return (
      <div className="p-6">
        Loading orders...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        <h1 className="font-semibold">
          Failed to load orders
        </h1>

        <p className="mt-2 text-sm">
          {error instanceof Error
            ? error.message
            : 'Something went wrong'}
        </p>
      </div>
    );
  }

  const orders = data?.data ?? [];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="rounded-md border p-6">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-md border p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {order.orderNumber}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(
                      order.createdAt,
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    ₦{order.total}
                  </p>

                  <p className="text-sm">
                    {order.status}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-sm">
                  Payment: {order.paymentStatus}
                </p>

                <p className="mt-1 text-sm">
                  Items: {order.items.length}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}