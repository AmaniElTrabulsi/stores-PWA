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

  // 🔍 SEARCH
  const filtered = products.filter((p) => {
    const q = query.toLowerCase();

    return (
      p.name?.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  // 🗑️ DELETE
  const deleteProduct = async (id: string) => {
    if (!confirm("Delete product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  };

  // 💾 SAVE EDIT
  const saveProduct = async () => {
    if (!editing) return;

    setLoading(true);

    const { error } = await supabase
      .from("products")
      .update({
        name: editing.name,
        barcode: editing.barcode,
        price: editing.price,
        quantity: editing.quantity,
        category: editing.category,
        owner: editing.owner,
        description: editing.description,
        expiry_date: editing.expiry_date,
      })
      .eq("id", editing.id);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setEditing(null);
    router.refresh();
  };

  return (
    <div>

      {/* 🔍 SEARCH BAR */}
      <input
        className="w-full border p-3 rounded-xl mb-6 bg-white"
        placeholder="Search by name, barcode, description..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* 📦 PRODUCTS GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {filtered.map((product) => (
          <div
            key={product.id}
            className="border rounded-2xl p-5 bg-white shadow-sm"
          >

            <h2 className="font-semibold text-lg">
              {product.name}
            </h2>

            <p className="text-sm text-gray-600">
              Barcode: {product.barcode}
            </p>

            <p className="text-sm text-gray-600">
              Owner: {product.owner || "—"}
            </p>

            <div className="mt-2 flex justify-between text-sm">
              <span>💰 {product.price ?? "—"}</span>
              <span>📦 {product.quantity ?? 0}</span>
            </div>

            {/* BUTTONS */}
            <div className="mt-4 flex gap-2">

              <button
                onClick={() => setEditing(product)}
                className="flex-1 bg-black text-white rounded-xl py-2"
              >
                Edit
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
                className="bg-red-500 text-white px-3 rounded-xl"
              >
                Delete
              </button>

            </div>
          </div>
        ))}

      </div>

      {/* ✏️ MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-2xl rounded-3xl p-6">

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
              value={editing.barcode}
              onChange={(e) =>
                setEditing({ ...editing, barcode: e.target.value })
              }
            />

            <input
              className="w-full border p-3 rounded-xl mb-2"
              type="number"
              value={editing.price || ""}
              onChange={(e) =>
                setEditing({ ...editing, price: Number(e.target.value) })
              }
            />

            <input
              className="w-full border p-3 rounded-xl mb-2"
              type="number"
              value={editing.quantity || 0}
              onChange={(e) =>
                setEditing({ ...editing, quantity: Number(e.target.value) })
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