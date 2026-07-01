import { supabase } from "@/lib/supabase";
import ProductsManager from "./ProductsManager";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: store } = await supabase
    .from("stores")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (!store) {
    return <div className="p-10">Store not found</div>;
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-4">
        {store.name} Products
      </h1>

      <ProductsManager
        products={products ?? []}
        storeId={store.id}
      />
    </div>
  );
}