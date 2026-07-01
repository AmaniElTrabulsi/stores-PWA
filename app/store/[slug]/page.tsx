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

  if (!store || error) {
    return (
      <div className="p-10 text-black">
        <h1 className="text-2xl font-bold">Store not found</h1>
        <p className="text-gray-500">Slug: {slug}</p>
      </div>
    );
  }

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id);

  return (
    <div className="min-h-screen p-6 text-black bg-gray-50">
      <h1 className="text-4xl font-bold">{store.name}</h1>

      <div className="mt-6 bg-white p-4 border rounded-xl w-64">
        <p className="text-gray-500">Products</p>
        <p className="text-3xl font-bold">{count ?? 0}</p>
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
  );
}