'use client';

import { useUpdateCartItem } from '@/hooks/cart/use-update-cart-item';

import type { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({
  item,
}: CartItemProps) {
  const {
    mutate: updateCartItem,
    isPending,
  } = useUpdateCartItem();

  const handleDecrease = () => {
    if (item.quantity <= 1) {
      return;
    }

    updateCartItem({
      itemId: item.id,
      payload: {
        quantity: item.quantity - 1,
      },
    });
  };

  const handleIncrease = () => {
    updateCartItem({
      itemId: item.id,
      payload: {
        quantity: item.quantity + 1,
      },
    });
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b py-4">
      <div>
        <h3 className="font-medium">
          {item.product.name}
        </h3>

        {item.variant && (
          <p className="text-sm text-muted-foreground">
            {item.variant.size &&
              `Size: ${item.variant.size}`}

            {item.variant.color &&
              ` • Color: ${item.variant.color}`}
          </p>
        )}

        <p className="mt-1 text-sm">
          ₦{Number(item.unitPrice).toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={
            isPending ||
            item.quantity <= 1
          }
          onClick={handleDecrease}
          className="flex h-8 w-8 items-center justify-center rounded border"
        >
          −
        </button>

        <span className="min-w-6 text-center">
          {item.quantity}
        </span>

        <button
          type="button"
          disabled={isPending}
          onClick={handleIncrease}
          className="flex h-8 w-8 items-center justify-center rounded border"
        >
          +
        </button>
      </div>

      <p className="font-medium">
        ₦{Number(item.subtotal).toLocaleString()}
      </p>
    </div>
  );
}