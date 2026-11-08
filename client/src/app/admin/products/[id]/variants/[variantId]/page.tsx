
import ProductVariantDetailsPage from '@/app/products/[id]/variants/[variantId]/page';

export default function AdminProductVariantDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
}) {
  return (
    <ProductVariantDetailsPage
      params={params}
      basePath="/admin/products"
      isAdmin
    />
  );
}
