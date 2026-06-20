import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function ProductsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black">
        <h1 className="text-xl font-bold">Store not found</h1>
      </div>
    );
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  console.log("ERROR:", error);

  return (
    <main className="min-h-screen bg-white text-black">

      <div className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              Products
            </h1>

            <p className="text-gray-600">
              {store.name}
            </p>
          </div>

          <Link
            href={`/store/${slug}/add-product`}
            className="bg-black text-white px-5 py-3 rounded-xl"
          >
            + Add Product
          </Link>

        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {!products || products.length === 0 ? (
          <div className="border rounded-2xl p-10 text-center">
            <h2 className="text-xl font-semibold">
              No products yet
            </h2>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-2xl p-5"
              >
                <h2 className="font-semibold">
                  {product.name}
                </h2>

                <p className="text-sm">
                  Owner: {product.owner}
                </p>

                <p className="text-sm">
                  Barcode: {product.barcode || "—"}
                </p>

                <div className="mt-2 flex justify-between text-sm">
                  <span>💰 {product.price ?? "—"}</span>
                  <span>📦 {product.quantity ?? 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}