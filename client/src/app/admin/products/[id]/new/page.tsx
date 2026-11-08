import NewProductVariantPage from '@/app/products/[id]/variants/new/page';

export default function AdminCreateProductVariantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <NewProductVariantPage
      params={params}
      basePath="/admin/products"
    />
  );
}
