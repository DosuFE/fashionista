
'use client';

import { use, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useVariantStock } from '@/hooks/inventory/use-variant-stock';
import { useUpdateVariantStock } from '@/hooks/inventory/use-update-variant-stock';

export default function VariantStockPage({
  params,
  basePath = '/products',
}: {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
  basePath?: string;
}) {
  const {
    id: productId,
    variantId,
  } = use(params);

  const [quantity, setQuantity] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: stock,
    isLoading,
    isError,
  } = useVariantStock(productId, variantId);

  const updateStock = useUpdateVariantStock(productId, variantId);

  const variantPath =
    `${basePath}/${productId}/variants/${variantId}`;

  if (isLoading) {
    return (
      <div className="p-6">
        Loading variant stock...
      </div>
    );
  }

  if (isError || !stock) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          Unable to load variant stock.
        </p>
      </div>
    );
  }

  const handleStockUpdate = (
    operation: 'INCREASE' | 'DECREASE',
  ) => {
    setErrorMessage(null);

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      setErrorMessage(
        'Enter a valid quantity greater than 0.',
      );
      return;
    }

    updateStock.mutate(
      {
        quantity: parsedQuantity,
        operation,
      },
      {
        onSuccess: () => {
          setQuantity('');
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ??
            'Unable to update stock.';

          setErrorMessage(
            Array.isArray(message)
              ? message.join(', ')
              : message,
          );
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex gap-3">
        <Button asChild variant="outline">
          <Link href={variantPath}>
            ← Back to Variant
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Variant Inventory
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              SKU
            </p>
            <p className="text-lg font-semibold">
              {stock.sku}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Size
            </p>
            <p className="font-medium">
              {stock.size ?? '—'}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Color
            </p>
            <p className="font-medium">
              {stock.color ?? '—'}
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
              {stock.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div className="space-y-4 border-t pt-6">
            <div>
              <p className="mb-2 text-sm font-medium">
                Quantity
              </p>

              <Input
                type="number"
                min="1"
                step="1"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500">
                {errorMessage}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() =>
                  handleStockUpdate('INCREASE')
                }
                disabled={updateStock.isPending}
              >
                {updateStock.isPending
                  ? 'Updating...'
                  : 'Increase Stock'}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  handleStockUpdate('DECREASE')
                }
                disabled={updateStock.isPending}
              >
                {updateStock.isPending
                  ? 'Updating...'
                  : 'Decrease Stock'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
