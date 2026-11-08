'use client';

import { useAddCartItem } from '@/hooks/cart/use-add-cart-item';

interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
}

export function AddToCartButton({
  productId,
  variantId,
}: AddToCartButtonProps) {
  const {
    mutate,
    isPending,
  } = useAddCartItem();

  const handleAddToCart = () => {
    mutate({
      productId,
      variantId,
      quantity: 1,
    });
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isPending}
      className="rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending
        ? 'Adding...'
        : 'Add to Cart'}
    </button>
  );
}