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
      String(p.barcode || "").toLowerCase().includes(q)
    );
  });

  const deleteProduct = async (id: string) => {
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6 rounded-3xl">

      {/* SEARCH */}
      <div className="mb-6">
        <input
          className="w-full px-4 py-3 rounded-2xl border bg-white/70 backdrop-blur shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-6">

        {filtered.map((product) => (
          <div
            key={product.id}
            className="bg-white/80 backdrop-blur border border-white shadow-md rounded-3xl p-5 hover:scale-[1.02] transition-all duration-200"
          >

            {/* TOP BAR */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                {product.name}
              </h2>

              <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 text-gray-700">
                #{product.barcode || "—"}
              </span>
            </div>

            {/* INFO CARDS */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">


              <div className="rounded-2xl p-3 bg-gradient-to-br from-blue-100 to-cyan-100">
                <p className="text-xs text-gray-600">Stock</p>
                <p className="font-bold text-gray-800">
                  📦 {product.quantity ?? 0}
                </p>
              </div>

            </div>

            {/* ACTIONS */}
            <div className="mt-5 flex justify-between items-center">

              <button
                onClick={() => setEditing(product)}
                className="text-xs px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow hover:opacity-90 transition"
              >
                ✏️ Edit
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
                className="text-xs px-4 py-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
              >
                🗑 Delete
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No products found
        </div>
      )}

      {/* MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl">

            <h2 className="text-xl font-semibold mb-5">
              Edit Product
            </h2>

            <div className="space-y-3">

              <input
                className="w-full border rounded-2xl p-3"
                value={editing.name || ""}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />

              <input
                className="w-full border rounded-2xl p-3"
                value={editing.barcode || ""}
                onChange={(e) =>
                  setEditing({ ...editing, barcode: e.target.value })
                }
              />

              <input
                type="number"
                className="w-full border rounded-2xl p-3"
                value={editing.price || 0}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    price: Number(e.target.value),
                  })
                }
              />

              <input
                type="number"
                className="w-full border rounded-2xl p-3"
                value={editing.quantity || 0}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    quantity: Number(e.target.value),
                  })
                }
              />

              <textarea
                className="w-full border rounded-2xl p-3"
                value={editing.description || ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    description: e.target.value,
                  })
                }
              />

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setEditing(null)}
                className="px-5 py-2 rounded-2xl border"
              >
                Cancel
              </button>

              <button
                onClick={saveProduct}
                disabled={loading}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white"
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