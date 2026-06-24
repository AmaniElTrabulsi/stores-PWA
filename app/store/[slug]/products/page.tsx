import { supabase } from "@/lib/supabase";
import ProductsManager from "@/components/ProductsManager";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;

  const slug = decodeURIComponent(rawSlug).trim().toLowerCase();

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .ilike("slug", slug)
    .maybeSingle();

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Store not found</h1>
        </div>
      </div>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-black">

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex items-end justify-between mb-10">

          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              {store.name}
            </h1>
            <p className="text-gray-500 mt-1">
              Products dashboard
            </p>
          </div>

          <div className="bg-white border rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-xs text-gray-500">Total Products</p>
            <p className="text-2xl font-bold">
              {products?.length || 0}
            </p>
          </div>

        </div>

        {/* CONTENT */}
        <div className="bg-white border rounded-3xl shadow-sm p-6">
          <ProductsManager products={products || []} />
        </div>

      </div>

    </main>
  );
}