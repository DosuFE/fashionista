
import EditProductVariantPage from '@/app/products/[id]/variants/[variantId]/edit/page';

export default function AdminEditProductVariantPage({
  params,
}: {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
}) {
  return (
    <EditProductVariantPage
      params={params}
      basePath="/admin/products"
    />
  );
}
