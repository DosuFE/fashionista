import ProductVariantsPage from '@/app/products/[id]/variants/page';

export default function AdminProductVariantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <ProductVariantsPage
      params={params}
      basePath="/admin/products"
      isAdmin
    />
  );
}
