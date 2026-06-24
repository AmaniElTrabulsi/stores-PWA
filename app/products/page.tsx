"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProductManager({ products }: { products: any[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<any | null>(null);

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
        price: editing.price,
        quantity: editing.quantity,
      })
      .eq("id", editing.id);

    setEditing(null);
    router.refresh();
  };

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">

      {/* HEADER */}
      <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr] bg-gray-50 p-4 text-sm font-semibold text-gray-600">
        <div>Product</div>
        <div>Barcode</div>
        <div>Price</div>
        <div>Stock</div>
        <div>Actions</div>
      </div>

      {/* ROWS */}
      {products.map((p) => (
        <div
          key={p.id}
          className="grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr] p-4 border-t items-center"
        >

          {/* PRODUCT NAME */}
          <div className="min-w-0">
            <div className="font-medium truncate">{p.name}</div>
          </div>

          {/* BARCODE */}
          <div className="text-sm text-gray-600 truncate">
            {p.barcode || "—"}
          </div>

          {/* PRICE */}
          <div className="text-sm whitespace-nowrap">
            ${p.price ?? 0}
          </div>

          {/* STOCK */}
          <div className="text-sm whitespace-nowrap">
            {p.quantity ?? 0}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 shrink-0">

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

          <div className="bg-white w-full max-w-md rounded-2xl p-6">

            <h2 className="text-lg font-bold mb-4">
              Edit Product
            </h2>

            <input
              className="w-full border rounded p-2 mb-2"
              value={editing.name || ""}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />

            <input
              className="w-full border rounded p-2 mb-2"
              value={editing.barcode || ""}
              onChange={(e) =>
                setEditing({ ...editing, barcode: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full border rounded p-2 mb-2"
              value={editing.price || 0}
              onChange={(e) =>
                setEditing({ ...editing, price: Number(e.target.value) })
              }
            />

            <input
              type="number"
              className="w-full border rounded p-2 mb-4"
              value={editing.quantity || 0}
              onChange={(e) =>
                setEditing({ ...editing, quantity: Number(e.target.value) })
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