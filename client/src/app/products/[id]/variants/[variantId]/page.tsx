
'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { useProductVariant } from '@/hooks/product-variants/use-product-variant';
import { useDeleteProductVariant } from '@/hooks/product-variants/use-delete-product-variant';

export default function ProductVariantDetailsPage({
  params,
  basePath = '/products',
  isAdmin = false,
}: {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
  basePath?: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();

  const {
    id: productId,
    variantId,
  } = use(params);

  const {
    data: variant,
    isLoading,
    isError,
  } = useProductVariant(productId, variantId);

  const deleteVariant = useDeleteProductVariant();

  const variantsPath = `${basePath}/${productId}/variants`;

  const handleDelete = () => {
    deleteVariant.mutate(
      {
        productId,
        variantId,
      },
      {
        onSuccess: () => {
          router.push(variantsPath);
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

  if (isError || !variant) {
    return (
      <div className="p-6">
        <p className="text-red-500">
          Product variant not found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href={variantsPath}>
            ← Back to Variants
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{variant.sku}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              SKU
            </p>
            <p className="font-medium">
              {variant.sku}
            </p>
          </div>

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

          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>
            <p className="font-medium">
              {variant.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link
                href={`${variantsPath}/${variantId}/edit`}
              >
                Edit Variant
              </Link>
            </Button>

            {isAdmin && (
              <Button asChild variant="outline">
                <Link
                  href={`${variantsPath}/${variantId}/stock`}
                >
                  Manage Stock
                </Link>
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Delete Variant
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete this variant?
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    This will permanently delete the variant{' '}
                    <strong>{variant.sku}</strong>.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteVariant.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteVariant.isPending
                      ? 'Deleting...'
                      : 'Delete Variant'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {deleteVariant.isError && (
            <p className="text-sm text-red-500">
              Failed to delete variant. Please try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
