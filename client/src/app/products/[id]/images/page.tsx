'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import {
  useProductImages,
} from '@/hooks/product-images/use-product-images';

import {
  useDeleteProductImage,
} from '@/hooks/product-images/use-delete-product-image';

import {
  useUploadProductImage,
} from '@/hooks/product-images/use-upload-product-image';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ProductImagesPage() {
  const params = useParams();

  const productId = params.id as string;

  const {
    data: images,
    isLoading: imagesLoading,
    isError: imagesError,
    error: imagesErrorDetails,
  } = useProductImages(productId);

  const uploadMutation =
    useUploadProductImage();

  const deleteImageMutation =
    useDeleteProductImage();

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [altText, setAltText] =
    useState('');

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [imageToDelete, setImageToDelete] =
    useState<string | null>(null);

  /*
   * Handle image selection
   */
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Remove previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);

    const preview = URL.createObjectURL(file);

    setPreviewUrl(preview);
  };

  /*
   * Upload image
   */
  const handleUpload = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    uploadMutation.mutate(
      {
        productId,
        payload: {
          file: selectedFile,
          altText: altText || undefined,
        },
      },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setAltText('');

          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }

          setPreviewUrl(null);
        },
      },
    );
  };

  /*
   * Delete image
   */
  const handleDeleteImage = () => {
    if (!imageToDelete) {
      return;
    }

    deleteImageMutation.mutate(
      {
        productId,
        imageId: imageToDelete,
      },
      {
        onSuccess: () => {
          setImageToDelete(null);
        },
      },
    );
  };

  /*
   * Cleanup preview URL
   */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      {/* Page Header */}

      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Product Images
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Upload and manage images for this product.
        </p>
      </div>

      {/* Upload Image Form */}

      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-semibold">
          Upload Image
        </h2>

        <form
          onSubmit={handleUpload}
          className="mt-4 space-y-4"
        >
          {/* File Input */}

          <div className="space-y-2">
            <label
              htmlFor="productImage"
              className="text-sm font-medium"
            >
              Product Image
            </label>

            <input
              id="productImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-md border bg-background px-3 py-2 text-sm"
            />

            <p className="text-xs text-muted-foreground">
              Accepted formats: JPG, PNG, and WebP.
            </p>
          </div>

          {/* Image Preview */}

          {previewUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Preview
              </p>

              <div className="overflow-hidden rounded-lg border">
                <img
                  src={previewUrl}
                  alt="Selected image preview"
                  className="h-64 w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Alt Text */}

          <div className="space-y-2">
            <label
              htmlFor="altText"
              className="text-sm font-medium"
            >
              Alt Text
            </label>

            <input
              id="altText"
              type="text"
              value={altText}
              onChange={(event) =>
                setAltText(event.target.value)
              }
              placeholder="Blue denim jeans"
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </div>

          {/* Upload Success */}

          {uploadMutation.isSuccess && (
            <p className="text-sm text-green-600">
              Product image uploaded successfully.
            </p>
          )}

          {/* Upload Error */}

          {uploadMutation.isError && (
            <p className="text-sm text-red-500">
              {uploadMutation.error instanceof Error
                ? uploadMutation.error.message
                : 'Failed to upload image'}
            </p>
          )}

          {/* Upload Button */}

          <button
            type="submit"
            disabled={
              !selectedFile ||
              uploadMutation.isPending
            }
            className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadMutation.isPending
              ? 'Uploading...'
              : 'Upload Image'}
          </button>
        </form>
      </section>

      {/* Image Gallery */}

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Image Gallery
          </h2>

          <p className="text-sm text-muted-foreground">
            {images?.length ?? 0} image(s)
          </p>
        </div>

        {/* Loading */}

        {imagesLoading && (
          <p>Loading images...</p>
        )}

        {/* Error */}

        {imagesError && (
          <p className="text-sm text-red-500">
            {imagesErrorDetails instanceof Error
              ? imagesErrorDetails.message
              : 'Failed to load images'}
          </p>
        )}

        {/* Empty State */}

        {!imagesLoading &&
          !imagesError &&
          images?.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                No images have been added yet.
              </p>
            </div>
          )}

        {/* Gallery */}

        {!imagesLoading &&
          !imagesError &&
          images &&
          images.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-lg border"
                >
                  <div className="aspect-square bg-muted">
                    <img
                      src={image.imageUrl}
                      alt={
                        image.altText ||
                        'Product image'
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <p className="text-sm font-medium">
                        {image.isPrimary
                          ? 'Primary image'
                          : 'Product image'}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        Sort order: {image.sortOrder}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setImageToDelete(image.id)
                      }
                      className="w-full rounded-md border border-red-500 px-3 py-2 text-sm text-red-500"
                    >
                      Delete Image
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>

      {/* Delete Confirmation Dialog */}

      <AlertDialog
        open={Boolean(imageToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setImageToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this image?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This image will be permanently removed
              from this product.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={
                deleteImageMutation.isPending
              }
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteImage}
              disabled={
                deleteImageMutation.isPending
              }
            >
              {deleteImageMutation.isPending
                ? 'Deleting...'
                : 'Delete Image'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}