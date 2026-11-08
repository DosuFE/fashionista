
'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useProductVariant } from '@/hooks/product-variants/use-product-variant';
import { useUpdateProductVariant } from '@/hooks/product-variants/use-update-product-variant';

const variantSchema = z.object({
  sku: z
    .string()
    .min(2, 'SKU must be at least 2 characters'),

  size: z.string().optional(),

  color: z.string().optional(),

  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .nullable(),

  stockQuantity: z
    .number()
    .min(0, 'Stock cannot be negative'),

  isActive: z.boolean(),
});

type VariantFormValues = z.infer<typeof variantSchema>;

export default function EditProductVariantPage({
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

  const router = useRouter();

  const {
    data: variant,
    isLoading,
  } = useProductVariant(productId, variantId);

  const updateVariant = useUpdateProductVariant();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
  });

  useEffect(() => {
    if (!variant) return;

    reset({
      sku: variant.sku,
      size: variant.size ?? '',
      color: variant.color ?? '',
      price:
        variant.price !== null
          ? Number(variant.price)
          : null,
      stockQuantity: variant.stockQuantity,
      isActive: variant.isActive,
    });
  }, [variant, reset]);

  const onSubmit = (values: VariantFormValues) => {
    updateVariant.mutate(
      {
        productId,
        variantId,
        payload: {
          sku: values.sku,
          size: values.size || undefined,
          color: values.color || undefined,
          price: values.price ?? undefined,
          stockQuantity: values.stockQuantity,
          isActive: values.isActive,
        },
      },
      {
        onSuccess: () => {
          router.push(
            `${basePath}/${productId}/variants/${variantId}`,
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        Loading variant...
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="p-6">
        Variant not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Edit Product Variant
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                {...register('sku')}
              />
              {errors.sku && (
                <p className="text-sm text-red-500">
                  {errors.sku.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                {...register('size')}
              />
              {errors.size && (
                <p className="text-sm text-red-500">
                  {errors.size.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                {...register('color')}
              />
              {errors.color && (
                <p className="text-sm text-red-500">
                  {errors.color.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...register('price', {
                  setValueAs: (value) =>
                    value === '' ? null : Number(value),
                })}
              />
              {errors.price && (
                <p className="text-sm text-red-500">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantity">
                Stock Quantity
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                {...register('stockQuantity', {
                  valueAsNumber: true,
                })}
              />
              {errors.stockQuantity && (
                <p className="text-sm text-red-500">
                  {errors.stockQuantity.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                {...register('isActive')}
              />
              <Label htmlFor="isActive">
                Active
              </Label>
            </div>

            <Button
              type="submit"
              disabled={updateVariant.isPending}
              className="w-full"
            >
              {updateVariant.isPending
                ? 'Updating...'
                : 'Update Variant'}
            </Button>

            {updateVariant.isError && (
              <p className="text-sm text-red-500">
                Failed to update variant.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
