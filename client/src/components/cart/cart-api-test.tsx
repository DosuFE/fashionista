'use client';
import { useState } from 'react';
import { useCart } from '@/hooks/cart/use-cart';
import { useDeleteCartItem } from '@/hooks/cart/use-delete-cart-item';

export function CartApiTest() {
  const {
    data: cart,
    isLoading,
    isError,
    error,
  } = useCart();
  const [deletingItemId, setDeletingItemId] =
  useState<string | null>(null);
  const deleteCartItemMutation = useDeleteCartItem();

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <p>Loading cart...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">
        <p className="font-medium">
          Failed to load cart
        </p>

        <p className="mt-1 text-sm">
          {error instanceof Error
            ? error.message
            : 'Something went wrong'}
        </p>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="py-10 text-center">
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cart Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Shopping Cart
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {cart.totalItems}{' '}
          {cart.totalItems === 1
            ? 'item'
            : 'items'}{' '}
          in your cart
        </p>
      </div>

      {/* Empty Cart */}
      {cart.items.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          <h2 className="text-lg font-semibold">
            Your cart is empty
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Add some products to your cart to see them
            here.
          </p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border p-4"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        {/* Product */}
                        <div>
                            <h2 className="font-semibold">
                                {item.product.name}
                            </h2>

                            {item.variant && (
                                <div className="mt-1 text-sm text-muted-foreground">
                                {item.variant.size && (
                                    <span>
                                    Size: {item.variant.size}
                                    </span>
                                )}

                                {item.variant.color && (
                                    <span className="ml-3">
                                    Color: {item.variant.color}
                                    </span>
                                )}
                                </div>
                            )}

                            <p className="mt-2 text-sm">
                                Unit price: ₦
                                {Number(
                                item.unitPrice,
                                ).toLocaleString()}
                            </p>
                        </div>

                        {/* Quantity */}
                        <div>
                        <p className="text-sm text-muted-foreground">
                            Quantity
                        </p>

                        <p className="font-medium">
                            {item.quantity}
                        </p>
                        </div>

                        {/* Subtotal */}
                        <div>
                        <p className="text-sm text-muted-foreground">
                            Subtotal
                        </p>

                        <p className="font-semibold">
                            ₦
                            {Number(
                            item.subtotal,
                            ).toLocaleString()}
                        </p>
                        </div>

                        {/* Delete */}
                        <button
                        type="button"
                        onClick={() => {
                            setDeletingItemId(item.id);
                            deleteCartItemMutation.mutate(
                                item.id,
                                {
                                onSettled: () => {
                                    setDeletingItemId(null);
                                },
                                },
                            );
                        }}
                        disabled={
                            deleteCartItemMutation.isPending &&
                            deletingItemId === item.id
                        }
                        className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {deleteCartItemMutation.isPending &&
                            deletingItemId === item.id
                            ? 'Removing...'
                            : 'Remove'}
                        </button>
                    </div>
                </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Total items
              </span>

              <span className="font-medium">
                {cart.totalItems}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="text-lg font-semibold">
                Subtotal
              </span>

              <span className="text-lg font-bold">
                ₦
                {Number(
                  cart.subtotal,
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}