"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProductsManager({
  products,
}: {
  products: any[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = products.filter((p) => {
    const q = query.toLowerCase();

    return (
      String(p.name || "").toLowerCase().includes(q) ||
      String(p.barcode || "").toLowerCase().includes(q) ||
      String(p.description || "").toLowerCase().includes(q)
    );
  });

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete product?")) return;

    await supabase.from("products").delete().eq("id", id);
    router.refresh();
  };

  const saveProduct = async () => {
    if (!editing) return;

    setLoading(true);

    await supabase
      .from("products")
      .update({
        name: editing.name,
        barcode: editing.barcode,
        price: editing.price,
        quantity: editing.quantity,
        description: editing.description,
      })
      .eq("id", editing.id);

    setLoading(false);
    setEditing(null);
    router.refresh();
  };

  return (
    <div>

      {/* SEARCH */}
      <input
        className="w-full border rounded-2xl p-3 mb-6 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {filtered.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-lg transition"
          >

            <h2 className="font-bold text-lg text-gray-900">
              {product.name}
            </h2>

            <p className="text-sm text-gray-500">
              Barcode: {product.barcode || "—"}
            </p>

            <div className="mt-4 flex justify-between text-sm bg-gray-50 rounded-xl p-3">
              <span>💰 {product.price ?? "—"}</span>
              <span>📦 {product.quantity ?? 0}</span>
            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex gap-2">

              <button
                onClick={() => setEditing(product)}
                className="flex-1 bg-black text-white rounded-xl py-2"
              >
                Edit
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
                className="bg-red-500 text-white px-4 rounded-xl"
              >
                Delete
              </button>

            </div>
          </div>
        ))}

      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No products found
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6">

            <h2 className="text-xl font-bold mb-4">
              Edit Product
            </h2>

            <input
              className="w-full border p-3 rounded-xl mb-2"
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />

            <input
              className="w-full border p-3 rounded-xl mb-2"
              value={editing.barcode || ""}
              onChange={(e) =>
                setEditing({ ...editing, barcode: e.target.value })
              }
            />

            <input
              className="w-full border p-3 rounded-xl mb-2"
              type="number"
              value={editing.price || 0}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  price: Number(e.target.value),
                })
              }
            />

            <input
              className="w-full border p-3 rounded-xl mb-2"
              type="number"
              value={editing.quantity || 0}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  quantity: Number(e.target.value),
                })
              }
            />

            <textarea
              className="w-full border p-3 rounded-xl mb-2"
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  description: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={saveProduct}
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded-xl"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}