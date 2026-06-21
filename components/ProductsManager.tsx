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

  // ⚠️ EXPIRY WARNING
  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return diff > 0 && diff < 1000 * 60 * 60 * 24 * 7; // 7 days
  };

  // 💾 SAVE EDIT
  const saveProduct = async () => {
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

  return (
    <div>

      {/* 🔍 SEARCH BAR */}
      <input
        className="w-full border p-3 rounded-xl mb-6"
        placeholder="Search products (name, barcode, description)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* 📦 GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {filtered.map((p) => (
          <div
            key={p.id}
            className={`border rounded-2xl p-5 ${
              isExpired(p.expiry_date)
                ? "border-red-500"
                : isExpiringSoon(p.expiry_date)
                ? "border-yellow-500"
                : ""
            }`}
          >

            {/* NAME */}
            <h2 className="font-semibold text-lg">
              {p.name}
            </h2>

            {/* BADGES */}
            {isExpired(p.expiry_date) && (
              <p className="text-red-600 text-sm">
                ⚠️ Expired
              </p>
            )}

            {!isExpired(p.expiry_date) &&
              isExpiringSoon(p.expiry_date) && (
                <p className="text-yellow-600 text-sm">
                  ⚠️ Expiring soon
                </p>
              )}

            <p className="text-sm text-gray-600">
              Barcode: {p.barcode}
            </p>

            <p className="text-sm text-gray-600">
              Owner: {p.owner}
            </p>

            <div className="mt-2 flex justify-between text-sm">
              <span>💰 {p.price ?? "—"}</span>
              <span>📦 {p.quantity}</span>
            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditing(p)}
                className="flex-1 bg-black text-white rounded-xl py-2"
              >
                Edit
              </button>

              <button
                onClick={() => deleteProduct(p.id)}
                className="bg-red-500 text-white rounded-xl px-3"
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

          <div className="bg-white w-full max-w-2xl p-6 rounded-3xl">

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
              type="date"
              className="w-full border p-3 rounded-xl mb-2"
              value={editing.expiry_date || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  expiry_date: e.target.value,
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
                Save
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}