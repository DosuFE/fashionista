
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  FolderOpen,
  Image as ImageIcon,
} from 'lucide-react';

import { useCategories } from '@/hooks/categories/use-categories';
import { useUpdateCategory } from '@/hooks/categories/use-update-category';
import { useDeleteCategory } from '@/hooks/categories/use-delete-category';
import AdminNavigation from '@/components/admin/admin-navigation';

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCategories();

  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const filteredCategories = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm) ||
        category.slug.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && category.isActive) ||
        (statusFilter === 'inactive' && !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const activeCount = categories.filter(
    (category) => category.isActive,
  ).length;

  const inactiveCount = categories.length - activeCount;

  function handleToggleStatus(
    id: string,
    currentStatus: boolean,
    name: string,
  ) {
    const action = currentStatus ? 'deactivate' : 'activate';

    if (!window.confirm(`Are you sure you want to ${action} "${name}"?`)) {
      return;
    }

    updateCategory.mutate({
      id,
      payload: { isActive: !currentStatus },
    });
  }

  function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action may not be reversible.`,
    );

    if (!confirmed) {
      return;
    }

    deleteCategory.mutate(id);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <AdminNavigation />
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Categories
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Organize and manage the categories in your store.
            </p>
          </div>

          <Link
            href="/admin/categories/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Categories"
            value={categories.length}
            description="All store categories"
          />

          <SummaryCard
            title="Active Categories"
            value={activeCount}
            description="Available for use"
          />

          <SummaryCard
            title="Inactive Categories"
            value={inactiveCount}
            description="Currently disabled"
          />
        </div>

        {/* Search and filters */}
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by category name or slug..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
              aria-label="Filter categories by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
        </section>

        {/* Categories table */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                All Categories
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredCategories.length} result
                {filteredCategories.length === 1 ? '' : 's'}
              </p>
            </div>

            <FolderOpen className="h-5 w-5 text-gray-400" />
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading categories...
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="font-medium text-red-600">
                Could not load categories.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {error instanceof Error
                  ? error.message
                  : 'Please check your connection and try again.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                Try Again
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-10 text-center">
              <FolderOpen className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 font-medium text-gray-900">
                No categories found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try another search or create a new category.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Slug</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Created</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                            {category.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">
                              {category.name}
                            </p>
                            <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                              {category.description || 'No description'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {category.slug}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            category.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/categories/${category.id}/edit`}
                            title={`Edit ${category.name}`}
                            aria-label={`Edit ${category.name}`}
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                category.id,
                                category.isActive,
                                category.name,
                              )
                            }
                            disabled={updateCategory.isPending}
                            className="whitespace-nowrap rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          >
                            {updateCategory.isPending
                              ? 'Saving...'
                              : category.isActive
                                ? 'Deactivate'
                                : 'Activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(category.id, category.name)
                            }
                            disabled={deleteCategory.isPending}
                            title={`Delete ${category.name}`}
                            aria-label={`Delete ${category.name}`}
                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {(updateCategory.isError || deleteCategory.isError) && (
          <p role="alert" className="text-sm text-red-600">
            An action failed. Please check the server response and try again.
          </p>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}
