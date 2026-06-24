import { supabase } from "@/lib/supabase";
import ProductManager from "./ProductManager";

export default async function ProductsPage() {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen w-full bg-gray-50">

      {/* FULL WIDTH CONTAINER */}
      <div className="w-full max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <div className="text-sm text-gray-500">
            Total: {products?.length || 0}
          </div>
        </div>

        {/* TABLE */}
        <div className="w-full">
          <ProductManager products={products || []} />
        </div>

      </div>
    </div>
  );
}