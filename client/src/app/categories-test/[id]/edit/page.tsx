'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useCategory } from '@/hooks/categories/use-category';

import {
  useUpdateCategory,
} from '@/hooks/categories/use-update-category';

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = use(params);

  const router = useRouter();

  const {
    data: category,
    isLoading,
    isError,
  } = useCategory(id);

  const updateCategoryMutation =
    useUpdateCategory();

  const [name, setName] =
    useState('');

  const [slug, setSlug] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(
        category.description ?? '',
      );
    }
  }, [category]);

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

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage(
        'Category name is required.',
      );

      return;
    }

    if (!slug.trim()) {
      setErrorMessage(
        'Category slug is required.',
      );

      return;
    }

    updateCategoryMutation.mutate(
      {
        id,
        payload: {
          name: name.trim(),
          slug: slug.trim(),
          description:
            description.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          router.push(
            `/categories-test/${id}`,
          );
        },

        onError: (error: any) => {
          const message =
            error?.response?.data?.message ??
            'Unable to update category.';

          setErrorMessage(
            Array.isArray(message)
              ? message.join(', ')
              : message,
          );
        },
      },
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() =>
            router.push(
              `/categories-test/${id}`,
            )
          }
        >
          ← Back to Category
        </Button>
      </div>

      <div className="rounded-lg border p-6">
        <h1 className="mb-6 text-2xl font-bold">
          Update Category
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium"
            >
              Category Name
            </label>

            <Input
              id="name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="slug"
              className="text-sm font-medium"
            >
              Slug
            </label>

            <Input
              id="slug"
              value={slug}
              onChange={(event) =>
                setSlug(event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium"
            >
              Description
            </label>

            <Textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-500">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            disabled={
              updateCategoryMutation.isPending
            }
          >
            {updateCategoryMutation.isPending
              ? 'Updating...'
              : 'Update Category'}
          </Button>
        </form>
      </div>
    </main>
  );
}