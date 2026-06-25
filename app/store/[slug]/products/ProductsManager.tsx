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
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

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
        quantity: editing.quantity, // STOCK
      })
      .eq("id", editing.id);

    setLoading(false);
    setEditing(null);
    router.refresh();
  };

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">

      {/* HEADER */}
      <div className="grid grid-cols-4 p-4 bg-gray-50 text-sm font-semibold text-gray-600">
        <div>Product</div>
        <div>Barcode</div>
        <div>Stock</div>
        <div>Actions</div>
      </div>

      {/* ROWS */}
      {products?.map((p) => (
        <div
          key={p.id}
          className="grid grid-cols-4 p-4 border-t items-center"
        >

          {/* NAME */}
          <div className="font-medium truncate">
            {p.name}
          </div>

          {/* BARCODE */}
          <div className="text-sm text-gray-600 truncate">
            {p.barcode || "—"}
          </div>

          {/* STOCK */}
          <div className="text-sm font-semibold">
            {p.quantity ?? 0}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">

            <button
              onClick={() => setEditing(p)}
              className="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
            >
              Edit
            </button>

            <button
              onClick={() => deleteProduct(p.id)}
              className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              Delete
            </button>

          </div>
        </div>
      ))}

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
              className="w-full border p-2 mb-2 rounded"
              value={editing.barcode || ""}
              onChange={(e) =>
                setEditing({ ...editing, barcode: e.target.value })
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
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded"
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