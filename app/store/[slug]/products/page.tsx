import { supabase } from "@/lib/supabase";
import ProductsManager from "@/components/ProductsManager";

export default async function ProductsPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black">
        Store not found
      </div>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-500">{store.name}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <ProductsManager products={products || []} />
      </div>
    </main>
  );
}