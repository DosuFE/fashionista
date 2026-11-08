'use client';

import Link from 'next/link';
import { use } from 'react';

import { Button } from '@/components/ui/button';

import { useCategory } from '@/hooks/categories/use-category';

export default function CategoryDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = use(params);

  const {
    data: category,
    isLoading,
    isError,
  } = useCategory(id);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>Loading category...</p>
      </main>
    );
  }

  if (isError || !category) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-red-500">
          Failed to load category.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/categories-test">
            ← Back to Categories
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border p-6">
        <h1 className="mb-6 text-2xl font-bold">
          Category Details
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">
              Name
            </p>

            <p className="font-semibold">
              {category.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Slug
            </p>

            <p>
              {category.slug}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Description
            </p>

            <p>
              {category.description ?? '—'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p>
              {category.isActive
                ? 'Active'
                : 'Inactive'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Category ID
            </p>

            <p className="break-all text-sm">
              {category.id}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}