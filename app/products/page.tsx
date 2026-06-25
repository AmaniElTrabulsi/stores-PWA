import { supabase } from "@/lib/supabase";
import ProductsManager from "./ProductsManager";

export default async function ProductsPage() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const products = data ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500">
            Total Products: {products.length}
          </p>
        </div>

        <ProductsManager products={products} />
      </div>
    </div>
  );
}