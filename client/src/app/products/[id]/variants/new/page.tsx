
'use client';

import { use } from 'react';
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

import { useCreateProductVariant } from '@/hooks/product-variants/use-create-product-variant';

const variantSchema = z.object({
  sku: z
    .string()
    .min(2, 'SKU must be at least 2 characters'),

  size: z.string().optional(),

  color: z.string().optional(),

  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .optional(),

  stockQuantity: z
    .number()
    .min(0, 'Stock cannot be negative')
    .optional(),
});

type VariantFormValues = z.infer<typeof variantSchema>;

export default function NewProductVariantPage({
  params,
  basePath = '/products',
}: {
  params: Promise<{ id: string }>;
  basePath?: string;
}) {
  const { id: productId } = use(params);

  const router = useRouter();

  const createVariant = useCreateProductVariant();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),

    defaultValues: {
      sku: '',
      size: '',
      color: '',
      price: undefined,
      stockQuantity: 0,
    },
  });

  const onSubmit = (values: VariantFormValues) => {
    createVariant.mutate(
      {
        productId,
        payload: {
          sku: values.sku,
          size: values.size || undefined,
          color: values.color || undefined,
          price: values.price,
          stockQuantity: values.stockQuantity,
        },
      },
      {
        onSuccess: () => {
          router.push(
            `${basePath}/${productId}/variants`,
          );
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Create Product Variant
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
                placeholder="JEAN-BLK-30"
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
                placeholder="30"
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
                placeholder="Black"
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
                placeholder="25000"
                {...register('price', {
                  valueAsNumber: true,
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
                placeholder="10"
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

            <Button
              type="submit"
              disabled={createVariant.isPending}
              className="w-full"
            >
              {createVariant.isPending
                ? 'Creating...'
                : 'Create Variant'}
            </Button>

            {createVariant.isError && (
              <p className="text-sm text-red-500">
                Failed to create product variant.
                Please try again.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
