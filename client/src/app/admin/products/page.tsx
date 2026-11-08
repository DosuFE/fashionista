
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Edit,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Boxes,
} from 'lucide-react';

import { useProducts } from '@/hooks/products/use-products';
import { useUpdateProduct } from '@/hooks/products/use-update-product';
import AdminNavigation from '@/components/admin/admin-navigation';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useProducts();

  const updateProduct = useUpdateProduct();

  const categories = useMemo(() => {
    return Array.from(
      new Map(
        products
          .filter((product) => product.category)
          .map((product) => [
            product.category.id,
            product.category,
          ]),
      ).values(),
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchTerm = search.trim().toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && product.isActive) ||
        (statusFilter === 'inactive' && !product.isActive);

      const matchesCategory =
        categoryFilter === 'all' ||
        product.category?.id === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, search, statusFilter, categoryFilter]);

  const activeCount = products.filter(
    (product) => product.isActive,
  ).length;

  const inactiveCount = products.filter(
    (product) => !product.isActive,
  ).length;

  const lowStockCount = products.filter(
    (product) =>
      product.isActive && product.stockQuantity <= 5,
  ).length;

  const handleToggleStatus = (
    productId: string,
    currentStatus: boolean,
  ) => {
    updateProduct.mutate({
      id: productId,
      payload: {
        isActive: !currentStatus,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <p className="text-sm text-gray-600">
          Loading products...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <h2 className="font-semibold">
            Unable to load products
          </h2>
        </div>

        <p className="mt-2 text-sm text-red-600">
          Please check your connection and try again.
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminNavigation />
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Admin / Products
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            Product Management
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Manage your boutique products, prices, stock, and visibility.
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Products"
          value={products.length}
          icon={<Package className="h-5 w-5" />}
        />

        <SummaryCard
          title="Active Products"
          value={activeCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <SummaryCard
          title="Inactive Products"
          value={inactiveCount}
          icon={<ToggleLeft className="h-5 w-5" />}
        />

        <SummaryCard
          title="Low Stock"
          value={lowStockCount}
          icon={<Boxes className="h-5 w-5" />}
          description="Active products with 5 or fewer items"
        />
      </div>

      {/* Mutation feedback */}
      {updateProduct.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Could not update the product status. Please try again.
        </div>
      )}

      {updateProduct.isSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Product status updated successfully.
        </div>
      )}

      {/* Search and filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or SKU..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-black"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          >
            <option value="all">All categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Products table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">
              Products
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredProducts.length} product(s) found
            </p>
          </div>

          {updateProduct.isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-300" />

            <h3 className="mt-3 font-semibold text-gray-900">
              No products found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>

            {products.length === 0 && (
              <Link
                href="/products/create"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
                Create your first product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">
                    Manage
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const isUpdating =
                    updateProduct.isPending &&
                    updateProduct.variables?.id === product.id;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          SKU: {product.sku}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {product.category?.name ?? 'Uncategorized'}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">
                          ₦{Number(product.price).toLocaleString('en-NG')}
                        </div>

                        {product.discountPrice && (
                          <div className="mt-1 text-xs text-green-700">
                            Discount: ₦
                            {Number(
                              product.discountPrice,
                            ).toLocaleString('en-NG')}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            product.stockQuantity <= 5
                              ? 'font-medium text-red-600'
                              : 'text-gray-700'
                          }
                        >
                          {product.stockQuantity}
                        </span>

                        {product.stockQuantity <= 5 && (
                          <p className="mt-1 text-xs text-red-500">
                            Low stock
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            product.isActive
                              ? 'inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700'
                              : 'inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600'
                          }
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.id}/edit`}
                            title="Edit product"
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>

                          <Link
                            href={`/admin/products/${product.id}/images`}
                            title="Manage images"
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Link>

                          <Link
                            href={`/admin/products/${product.id}/variants`}
                            title="Manage variants"
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <Boxes className="h-4 w-4" />
                          </Link>

                          <Link
                            href={`/products/${product.id}/stock`}
                            title="Manage stock"
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            title={
                              product.isActive
                                ? 'Deactivate product'
                                : 'Activate product'
                            }
                            disabled={isUpdating}
                            onClick={() =>
                              handleToggleStatus(
                                product.id,
                                product.isActive,
                              )
                            }
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : product.isActive ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

function SummaryCard({
  title,
  value,
  icon,
  description,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-gray-500">{icon}</span>
      </div>

      <p className="mt-3 text-2xl font-bold text-gray-900">
        {value.toLocaleString()}
      </p>

      {description && (
        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
}
