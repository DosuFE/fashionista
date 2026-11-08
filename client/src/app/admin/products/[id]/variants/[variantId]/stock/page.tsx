
import VariantStockPage from '@/app/products/[id]/variants/[variantId]/stock/page';

export default function AdminVariantStockPage({
  params,
}: {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
}) {
  return (
    <VariantStockPage
      params={params}
      basePath="/admin/products"
    />
  );
}
