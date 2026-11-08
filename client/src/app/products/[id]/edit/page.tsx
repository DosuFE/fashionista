'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useProduct } from '@/hooks/products/use-product';
import { useUpdateProduct } from '@/hooks/products/use-update-product';
import { useCategories } from '@/hooks/categories/use-categories';

const productSchema = z.object({
  categoryId: z.string().min(1, 'Please select a category'),

  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters'),

  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters'),

  description: z.string().optional(),

  price: z
    .number()
    .min(0, 'Price cannot be negative'),

  discountPrice: z
    .number()
    .min(0, 'Discount price cannot be negative')
    .optional(),

  sku: z
    .string()
    .min(2, 'SKU must be at least 2 characters'),

  stockQuantity: z
    .number()
    .min(0, 'Stock cannot be negative'),

  isActive: z.boolean(),
});

type ProductFormValues = z.infer<
  typeof productSchema
>;

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id as string;

  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
  } = useProduct(productId);

  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useCategories();

  const updateProductMutation =
    useUpdateProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),

    defaultValues: {
      categoryId: '',
      name: '',
      slug: '',
      description: '',
      price: 0,
      discountPrice: undefined,
      sku: '',
      stockQuantity: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!product) {
      return;
    }

    reset({
      categoryId: product.category.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      price: Number(product.price),
      discountPrice:
        product.discountPrice !== null
          ? Number(product.discountPrice)
          : undefined,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
    });
  }, [product, reset]);

  const onSubmit = (
    values: ProductFormValues,
  ) => {
    updateProductMutation.mutate(
      {
        id: productId,
        payload: values,
      },
      {
        onSuccess: () => {
          router.push('/products');
        },
      },
    );
  };

  if (productLoading) {
    return (
      <main className="p-6">
        <p>Loading product...</p>
      </main>
    );
  }

  if (productError || !product) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">
          Product not found
        </h1>

        <p className="mt-2 text-sm text-red-500">
          Unable to load this product.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Edit Product
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the product information below.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Category */}

        <div className="space-y-2">
          <label
            htmlFor="categoryId"
            className="text-sm font-medium"
          >
            Category
          </label>

          <select
            id="categoryId"
            {...register('categoryId')}
            disabled={categoriesLoading}
            className="w-full rounded-md border bg-background px-3 py-2"
          >
            <option value="">
              Select category
            </option>

            {categories?.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          {errors.categoryId && (
            <p className="text-sm text-red-500">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* Name */}

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium"
          >
            Product Name
          </label>

          <input
            id="name"
            {...register('name')}
            className="w-full rounded-md border bg-background px-3 py-2"
          />

          {errors.name && (
            <p className="text-sm text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Slug */}

        <div className="space-y-2">
          <label
            htmlFor="slug"
            className="text-sm font-medium"
          >
            Slug
          </label>

          <input
            id="slug"
            {...register('slug')}
            className="w-full rounded-md border bg-background px-3 py-2"
          />

          {errors.slug && (
            <p className="text-sm text-red-500">
              {errors.slug.message}
            </p>
          )}
        </div>

        {/* Description */}

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="w-full rounded-md border bg-background px-3 py-2"
          />

          {errors.description && (
            <p className="text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Price */}

        <div className="space-y-2">
          <label
            htmlFor="price"
            className="text-sm font-medium"
          >
            Price
          </label>

          <input
            id="price"
            type="number"
            step="0.01"
            {...register('price', {
              valueAsNumber: true,
            })}
            className="w-full rounded-md border bg-background px-3 py-2"
          />

          {errors.price && (
            <p className="text-sm text-red-500">
              {errors.price.message}
            </p>
          )}
        </div>

        {/* Discount Price */}

        <div className="space-y-2">
          <label
            htmlFor="discountPrice"
            className="text-sm font-medium"
          >
            Discount Price
          </label>

          <input
            id="discountPrice"
            type="number"
            step="0.01"
            {...register('discountPrice', {
              valueAsNumber: true,
            })}
            className="w-full rounded-md border bg-background px-3 py-2"
          />

          {errors.discountPrice && (
            <p className="text-sm text-red-500">
              {errors.discountPrice.message}
            </p>
          )}
        </div>

        {/* SKU */}

        <div className="space-y-2">
          <label
            htmlFor="sku"
            className="text-sm font-medium"
          >
            SKU
          </label>

          <input
            id="sku"
            {...register('sku')}
            className="w-full rounded-md border bg-background px-3 py-2"
          />

          {errors.sku && (
            <p className="text-sm text-red-500">
              {errors.sku.message}
            </p>
          )}
        </div>

        {/* Stock */}

        <div className="space-y-2">
          <label
            htmlFor="stockQuantity"
            className="text-sm font-medium"
          >
            Stock Quantity
          </label>

          <input
            id="stockQuantity"
            type="number"
            {...register('stockQuantity', {
              valueAsNumber: true,
            })}
            className="w-full rounded-md border bg-background px-3 py-2"
          />

          {errors.stockQuantity && (
            <p className="text-sm text-red-500">
              {errors.stockQuantity.message}
            </p>
          )}
        </div>

        {/* Active */}

        <div className="flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive')}
          />

          <label
            htmlFor="isActive"
            className="text-sm font-medium"
          >
            Product is active
          </label>
        </div>

        {/* Server error */}

        {updateProductMutation.isError && (
          <p className="text-sm text-red-500">
            {updateProductMutation.error instanceof Error
              ? updateProductMutation.error.message
              : 'Failed to update product'}
          </p>
        )}

        {/* Submit */}

        <button
          type="submit"
          disabled={updateProductMutation.isPending}
          className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {updateProductMutation.isPending
            ? 'Updating...'
            : 'Update Product'}
        </button>
      </form>
    </main>
  );
}