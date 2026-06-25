import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function StorePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!store) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Store not found</h1>
      </div>
    );
  }

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">{store.name}</h1>

          <p className="mt-2 text-gray-500">
            Store Dashboard
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white border p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Products
            </p>

            <p className="mt-2 text-3xl font-bold">
              {productCount ?? 0}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={`/store/${slug}/products`}
            className="rounded-xl border bg-white px-5 py-3 hover:bg-gray-50"
          >
            View Products
          </Link>

          <Link
            href={`/store/${slug}/add-product`}
            className="rounded-xl border bg-white px-5 py-3 hover:bg-gray-50"
          >
            Add Product
          </Link>

          <Link
            href={`/store/${slug}/settings`}
            className="rounded-xl border bg-white px-5 py-3 hover:bg-gray-50"
          >
            Settings
          </Link>
        </div>
      </div>
    </main>
  );
}