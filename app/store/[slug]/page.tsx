import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: store, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !store) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">
          Store not found
        </h1>

        <p className="mt-4 text-gray-500">
          slug: {slug}
        </p>

        <pre className="mt-4">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  const { count: productCount } = await supabase
    .from("products")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("store_id", store.id);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">

        <h1 className="text-4xl font-bold">
          {store.name}
        </h1>

        <p className="text-gray-500 mt-2">
          Store Dashboard
        </p>

        <div className="mt-8">
          <div className="bg-white border rounded-2xl p-6 w-64">
            <p className="text-sm text-gray-500">
              Products
            </p>

            <p className="text-3xl font-bold mt-2">
              {productCount ?? 0}
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">

          <Link
            href={`/store/${slug}/products`}
            className="px-5 py-3 bg-black text-white rounded-xl"
          >
            View Products
          </Link>

          <Link
            href={`/store/${slug}/add-product`}
            className="px-5 py-3 border rounded-xl"
          >
            Add Product
          </Link>

        </div>

      </div>
    </main>
  );
}