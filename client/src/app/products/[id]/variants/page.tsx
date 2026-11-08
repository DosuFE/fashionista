
'use client';

import Link from 'next/link';
import { use } from 'react';

import { AddToCartButton } from '@/components/cart/add-to-cart-button';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useProductVariants } from '@/hooks/product-variants/use-product-variants';

export default function ProductVariantsPage({
  params,
  basePath = '/products',
  isAdmin = false,
}: {
  params: Promise<{ id: string }>;
  basePath?: string;
  isAdmin?: boolean;
}) {
  const { id: productId } = use(params);

  const {
    data: variants,
    isLoading,
    isError,
  } = useProductVariants(productId);

  if (isLoading) {
    return (
      <div className="p-6">
        Loading product variants...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500">
        Failed to load product variants.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Product Variants
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage variants for this product.
          </p>
        </div>

        <Button asChild>
          <Link
            href={`${basePath}/${productId}/variants/new`}
          >
            Add Variant
          </Link>
        </Button>
      </div>

      {variants?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            No variants found for this product.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {variants?.map((variant) => (
            <Card key={variant.id}>
              <CardHeader>
                <CardTitle>
                  {variant.sku}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Size
                    </p>

                    <p className="font-medium">
                      {variant.size ?? '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Color
                    </p>

                    <p className="font-medium">
                      {variant.color ?? '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Price
                    </p>

                    <p className="font-medium">
                      ₦
                      {Number(
                        variant.price ?? 0,
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Stock
                    </p>

                    <p className="font-medium">
                      {variant.stockQuantity}
                    </p>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="mt-4">
                    <Button asChild variant="outline">
                      <Link
                        href={`${basePath}/${productId}/variants/${variant.id}`}
                      >
                        View Details
                      </Link>
                    </Button>
                  </div>
                )}

                {!isAdmin && (
                  <div className="mt-4">
                    <AddToCartButton
                      productId={productId}
                      variantId={variant.id}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
