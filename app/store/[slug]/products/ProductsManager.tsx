"use client";

import { useMemo, useState } from "react";
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
  const [foundId, setFoundId] = useState<string | null>(null);

  // 🔍 SEARCH by name OR barcode
  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return products?.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        String(p.barcode || "").toLowerCase().includes(q)
      );
    });
  }, [products, query]);

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    router.refresh();
  };

  const saveProduct = async () => {
    if (!editing) return;

    await supabase
      .from("products")
      .update({
        name: editing.name,
        barcode: editing.barcode,
        quantity: editing.quantity,
      })
      .eq("id", editing.id);

    setEditing(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">

      {/* 🔍 SEARCH BAR */}
      <div className="flex gap-2">
        <input
          className="w-full border rounded-xl p-3"
          placeholder="Search by product name or barcode..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={() => {
            // hook this to your scanner later
            alert("Connect scanner here");
          }}
          className="px-4 rounded-xl bg-black text-white"
        >
          Scan
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">

        {/* HEADER */}
        <div className="grid grid-cols-3 p-4 bg-gray-50 text-sm font-semibold text-gray-600">
          <div>Product</div>
          <div>Stock</div>
          <div>Actions</div>
        </div>

        {/* ROWS */}
        {filtered?.map((p) => (
          <div
            key={p.id}
            className={`grid grid-cols-3 p-4 border-t items-center transition ${
              foundId === p.id ? "bg-green-50" : ""
            }`}
          >

            {/* NAME (FULL, NO TRUNCATE) */}
            <div className="font-medium">
              {p.name}
            </div>

            {/* STOCK */}
            <div className="text-sm font-semibold">
              {p.quantity ?? 0}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">

              <button
                onClick={() => setEditing(p)}
                className="px-3 py-1 text-xs bg-gray-100 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => deleteProduct(p.id)}
                className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded"
              >
                Delete
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md p-6 rounded-2xl">

            <h2 className="text-lg font-bold mb-4">
              Edit Product
            </h2>

            <input
              className="w-full border p-2 mb-2 rounded"
              value={editing.name || ""}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full border p-2 mb-4 rounded"
              value={editing.quantity || 0}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  quantity: Number(e.target.value),
                })
              }
            />

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={saveProduct}
                className="px-4 py-2 bg-black text-white rounded"
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