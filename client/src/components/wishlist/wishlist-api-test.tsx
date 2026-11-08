'use client';

import { useState } from 'react';

import { useWishlist } from '@/hooks/wishlist/use-wishlist';
import {
  useAddWishlistItem,
} from '@/hooks/wishlist/use-add-wishlist-item';
import {
  useDeleteWishlistItem,
} from '@/hooks/wishlist/use-delete-wishlist-item';

export default function WishlistApiTest() {
  const [deletingItemId, setDeletingItemId] =
    useState<string | null>(null);

  const {
    data: wishlist,
    isLoading,
    isError,
    error,
  } = useWishlist();

  const addWishlistItem =
    useAddWishlistItem();

  const deleteWishlistItem =
    useDeleteWishlistItem();

  const handleAddToWishlist = () => {
    addWishlistItem.mutate({
      productId: 'PUT-ACTUAL-PRODUCT-ID-HERE',
    });
  };

  const handleDeleteWishlistItem = (
    itemId: string,
  ) => {
    setDeletingItemId(itemId);

    deleteWishlistItem.mutate(itemId, {
      onSettled: () => {
        setDeletingItemId(null);
      },
    });
  };

  if (isLoading) {
    return <p>Loading wishlist...</p>;
  }

  if (isError) {
    return (
      <div>
        <p>Failed to load wishlist.</p>

        <p>
          {error instanceof Error
            ? error.message
            : 'Something went wrong'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">
          Wishlist
        </h1>

        <p className="text-muted-foreground">
          Total items:{' '}
          {wishlist?.totalItems ?? 0}
        </p>
      </div>

      {wishlist?.items.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div className="space-y-3">
          {wishlist?.items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border p-4"
            >
              <h2 className="font-semibold">
                {item.product.name}
              </h2>

              <p>
                ₦{item.product.price}
              </p>

              {item.product.discountPrice && (
                <p>
                  Discount:{' '}
                  ₦{item.product.discountPrice}
                </p>
              )}

              <button
                type="button"
                onClick={() =>
                  handleDeleteWishlistItem(
                    item.id,
                  )
                }
                disabled={
                  deletingItemId === item.id
                }
                className="mt-3 rounded-md border px-4 py-2 text-sm disabled:opacity-50"
              >
                {deletingItemId === item.id
                  ? 'Removing...'
                  : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}