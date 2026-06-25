import { supabase } from "@/lib/supabase";
import ProductsManager from "./ProductsManager";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ MUST AWAIT params in Next 16
  const { slug } = await params;

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (!store || storeError) {
    return (
      <div className="p-10">
        <h1 className="text-xl font-bold">
          Store not found
        </h1>

        <p className="text-gray-500 mt-2">
          slug: {slug}
        </p>

        <pre className="mt-4 text-xs">
          {JSON.stringify(storeError, null, 2)}
        </pre>
      </div>
    );
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-10 text-red-600">
        Error loading products
        <pre className="mt-4 text-xs">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">

        <h1 className="text-3xl font-bold">
          {store.name} Products
        </h1>

        <ProductsManager
          products={products ?? []}
        />

      </div>
    </main>
  );
}