import { supabase } from "@/lib/supabase";
import ProductsManager from "@/components/ProductsManager";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;

  const slug = decodeURIComponent(rawSlug)
    .trim()
    .toLowerCase();

  console.log("RAW SLUG:", rawSlug);
  console.log("CLEAN SLUG:", slug);

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .ilike("slug", slug)
    .maybeSingle();

  console.log("STORE:", store);
  console.log("STORE ERROR:", storeError);

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black">
        <div className="text-center">
          <h1 className="text-xl font-bold">
            Store not found
          </h1>

          <p className="text-gray-500 mt-2">
            Slug received: {rawSlug}
          </p>
        </div>
      </div>
    );
  }

  const { data: products, error: productsError } =
    await supabase
      .from("products")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false });


  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <div className="border-b bg-white p-6">
        <h1 className="text-2xl font-bold">
          {store.name}
        </h1>

        <p className="text-gray-500">
          Products
        </p>
      </div>

      <div className="p-6">
        <div className="mb-4 p-4 rounded-xl bg-yellow-100">

          <p>
            <strong>Products Count:</strong>{" "}
            {products?.length || 0}
          </p>
        </div>

        <ProductsManager
          products={products || []}
        />
      </div>
    </main>
  );
}