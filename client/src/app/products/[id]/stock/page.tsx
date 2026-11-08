'use client';

import { use } from 'react';
import { useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';

import {
  useProductStock,
} from '@/hooks/inventory/use-product-stock';

import {
  useUpdateProductStock,
} from '@/hooks/inventory/use-update-product-stock';

export default function ProductStockPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const {
    id: productId,
  } = use(params);

  const [quantity, setQuantity] =
    useState('');

  const {
    data: stock,
    isLoading,
    isError,
  } = useProductStock(productId);

  const updateStock =
    useUpdateProductStock();

  if (isLoading) {
    return (
      <div className="p-6">
        Loading product stock...
      </div>
    );
  }

  if (isError || !stock) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          Unable to load product stock.
        </p>
      </div>
    );
  }

  const handleStockUpdate = (
    operation:
      | 'INCREASE'
      | 'DECREASE',
  ) => {
    const parsedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        parsedQuantity,
      ) ||
      parsedQuantity < 1
    ) {
      return;
    }

    updateStock.mutate({
      productId,
      payload: {
        quantity: parsedQuantity,
        operation,
      },
    });

    setQuantity('');
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Button
          asChild
          variant="outline"
        >
          <Link
            href={`/products/${productId}`}
          >
            ← Back to Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Product Inventory
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Product
            </p>

            <p className="text-lg font-semibold">
              {stock.productName}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Current Stock
            </p>

            <p className="text-3xl font-bold">
              {stock.stockQuantity}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>

            <p className="font-medium">
              {stock.isActive
                ? 'Active'
                : 'Inactive'}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">
              Update Stock
            </p>

            <Input
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  event.target.value,
                )
              }
            />

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() =>
                  handleStockUpdate(
                    'INCREASE',
                  )
                }
                disabled={
                  updateStock.isPending
                }
              >
                {updateStock.isPending
                  ? 'Updating...'
                  : 'Increase Stock'}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  handleStockUpdate(
                    'DECREASE',
                  )
                }
                disabled={
                  updateStock.isPending
                }
              >
                {updateStock.isPending
                  ? 'Updating...'
                  : 'Decrease Stock'}
              </Button>
            </div>
          </div>

          {updateStock.isError && (
            <p className="text-sm text-red-500">
              Failed to update stock.
              Please check the quantity
              and try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}