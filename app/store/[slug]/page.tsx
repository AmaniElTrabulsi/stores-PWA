import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!store) {
    return (
      <div className="p-10 text-black">
        <h1 className="text-2xl font-bold text-black">
          Store not found
        </h1>
      </div>
    );
  }

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id);

  return (
    <main className="min-h-screen bg-white text-black">
      
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-black">
            {store.name}
          </h1>

          <p className="mt-2 text-black">
            Store Dashboard
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 border text-black">
            <p className="text-sm text-black">
              Products
            </p>
            <p className="mt-2 text-3xl font-bold text-black">
              {productCount ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 border text-black">
            <p className="text-sm text-black">
              Barcode System
            </p>
            <p className="mt-2 font-semibold text-black">
              Ready
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 border text-black">
            <p className="text-sm text-black">
              Inventory Status
            </p>
            <p className="mt-2 font-semibold text-black">
              Active
            </p>
          </div>

        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">

          <Link
            href={`/store/${slug}/products`}
            className="rounded-xl border px-5 py-3 text-black"
          >
            View Products
          </Link>

          <Link
            href={`/store/${slug}/add-product`}
            className="rounded-xl border px-5 py-3 text-black"
          >
            Add Product
          </Link>

          <Link
            href={`/store/${slug}/settings`}
            className="rounded-xl border px-5 py-3 text-black"
          >
            Settings
          </Link>

        </div>

      </div>
    </main>
  );
}