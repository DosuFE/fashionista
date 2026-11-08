'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCategories } from '@/hooks/categories/use-categories';
import { useCreateProduct } from '@/hooks/products/use-create-product';

const productSchema = z.object({
  categoryId: z
    .string()
    .min(1, 'Please select a category'),

  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters'),

  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters'),

  description: z
    .string()
    .optional(),

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
});

type ProductFormValues = z.infer<
  typeof productSchema
>;

export default function CreateProductPage() {
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  const createProductMutation =
    useCreateProduct();

  const {
    register,
    handleSubmit,
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
    },
  });

  const onSubmit = (
    values: ProductFormValues,
  ) => {
    createProductMutation.mutate(values);
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Create Product
        </h1>

        <p className="text-sm text-muted-foreground">
          Add a new product to your store.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
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
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">
              {categoriesLoading
                ? 'Loading categories...'
                : 'Select category'}
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

          {categoriesError && (
            <p className="text-sm text-red-500">
              Failed to load categories.
            </p>
          )}

          {errors.categoryId && (
            <p className="text-sm text-red-500">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* Product Name */}
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
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Classic Blue Jeans"
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
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="classic-blue-jeans"
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
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Premium classic blue jeans"
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
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="35000"
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
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="30000"
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
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="JNS-001"
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
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="10"
          />

          {errors.stockQuantity && (
            <p className="text-sm text-red-500">
              {errors.stockQuantity.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={createProductMutation.isPending}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createProductMutation.isPending
            ? 'Creating product...'
            : 'Create Product'}
        </button>

        {/* Success */}
        {createProductMutation.isSuccess && (
          <p className="text-sm text-green-600">
            Product created successfully.
          </p>
        )}

        {/* Error */}
        {createProductMutation.isError && (
          <p className="text-sm text-red-500">
            {createProductMutation.error instanceof Error
              ? createProductMutation.error.message
              : 'Failed to create product.'}
          </p>
        )}
      </form>
    </main>
  );
}