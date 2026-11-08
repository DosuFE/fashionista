'use client';

import { useState } from 'react';
import Link from 'next/link';

import { useCreateCategory } from '@/hooks/categories/use-create-category';
import { useCategories } from '@/hooks/categories/use-categories';
import { useUpdateCategory } from '@/hooks/categories/use-update-category';
import { useDeleteCategory } from '@/hooks/categories/use-delete-category';

export default function CategoriesTestPage() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const createCategoryMutation =
    useCreateCategory();

  const updateCategoryMutation =
    useUpdateCategory();

  const deleteCategoryMutation =
    useDeleteCategory();

  const {
    data: categories = [],
    isLoading,
    isError,
  } = useCategories();

  function handleCreate() {
    createCategoryMutation.mutate({
      name,
      slug,
      description,
    });
  }

  function handleUpdate(id: string) {
    updateCategoryMutation.mutate({
      id,
      payload: {
        name: `${name} Updated`,
      },
    });
  }

  function handleDelete(id: string) {
    deleteCategoryMutation.mutate(id);
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Categories API Test
      </h1>

      <div className="mb-10 space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">
          Create Category
        </h2>

        <input
          className="w-full rounded border p-2"
          placeholder="Category name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Slug"
          value={slug}
          onChange={(event) =>
            setSlug(event.target.value)
          }
        />

        <textarea
          className="w-full rounded border p-2"
          placeholder="Description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
        />

        <button
          type="button"
          onClick={handleCreate}
          disabled={createCategoryMutation.isPending}
          className="rounded bg-black px-4 py-2 text-white"
        >
          {createCategoryMutation.isPending
            ? 'Creating...'
            : 'Create Category'}
        </button>

        {createCategoryMutation.isSuccess && (
          <p className="text-sm">
            Category created successfully ✅
          </p>
        )}

        {createCategoryMutation.isError && (
          <p className="text-sm">
            Failed to create category ❌
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">
          Categories
        </h2>

        {isLoading && <p>Loading categories...</p>}

        {isError && (
          <p>Failed to load categories.</p>
        )}

        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border p-4"
            >
              <h3 className="font-semibold">
                {category.name}
              </h3>

              <p className="text-sm text-gray-500">
                {category.slug}
              </p>

              <p className="mt-2">
                {category.description}
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/categories-test/${category.id}`}
                  className="rounded border px-3 py-1"
                >
                  View
                </Link>

                <Link
                  href={`/categories-test/${category.id}/edit`}
                  className="rounded border px-3 py-1"
                >
                  Update
                </Link>

                {/* <button
                  type="button"
                  onClick={() =>
                    handleUpdate(category.id)
                  }
                  className="rounded border px-3 py-1"
                >
                  Update
                </button> */}

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(category.id)
                  }
                  className="rounded border px-3 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}