'use client';

import { useState } from 'react';

import Link from 'next/link';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useProducts } from '@/hooks/products/use-products';

import { useDeleteProduct } from '@/hooks/products/use-delete-product';

export default function ProductsPage() {
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useProducts();

  const deleteProductMutation =
    useDeleteProduct();

  const [productToDelete, setProductToDelete] =
    useState<string | null>(null);

  if (isLoading) {
    return (
      <main className="p-6">
        <p>Loading products...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">
          Failed to load products
        </h1>

        <p className="mt-2 text-sm text-red-500">
          {error instanceof Error
            ? error.message
            : 'Something went wrong'}
        </p>
      </main>
    );
  }

  const handleDelete = () => {
    if (!productToDelete) {
      return;
    }

    deleteProductMutation.mutate(
      productToDelete,
      {
        onSuccess: () => {
          setProductToDelete(null);
        },
      },
    );
  };

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Products
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your products.
          </p>
        </div>

        <Link
          href="/products/create"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Add Product
        </Link>
      </div>

      {products?.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-4">
          {products?.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">
                    {product.name}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Category:{' '}
                    {product.category.name}
                  </p>

                  <p className="mt-2">
                    ₦
                    {Number(
                      product.price,
                    ).toLocaleString()}
                  </p>

                  <p className="text-sm">
                    Stock:{' '}
                    {product.stockQuantity}
                  </p>

                  <p className="text-sm">
                    SKU: {product.sku}
                  </p>
                </div>

                <div className="flex gap-2">
                  <AddToCartButton
                    productId={product.id}
                  />

                  <Link
                    href={`/products/${product.id}/edit`}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      setProductToDelete(
                        product.id,
                      )
                    }
                    className="rounded-md border border-red-500 px-3 py-2 text-sm text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setProductToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this product?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone.
              The product will be permanently
              removed from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={
                deleteProductMutation.isPending
              }
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                deleteProductMutation.isPending
              }
            >
              {deleteProductMutation.isPending
                ? 'Deleting...'
                : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}