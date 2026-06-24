"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProductsManager({
  products,
}: {
  products: any[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [foundId, setFoundId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = products.filter((p) => {
    const q = query.toLowerCase();

    return (
      String(p.name || "").toLowerCase().includes(q) ||
      String(p.barcode || "").toLowerCase().includes(q)
    );
  });

  // 📦 SCAN BARCODE
  const handleScan = (value: string) => {
    setBarcodeInput(value);

    const product = products.find(
      (p) => String(p.barcode) === String(value)
    );

    if (product) {
      setFoundId(product.id);

      // auto-open edit (optional)
      // setEditing(product);

      setTimeout(() => setFoundId(null), 2000);
    }
  };

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

      {/* SEARCH + SCANNER */}
      <div className="mb-6 space-y-3">

        {/* Normal search */}
        <input
          className="w-full px-4 py-3 rounded-2xl border bg-white"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Barcode scanner input */}
        <input
          ref={inputRef}
          className="w-full px-4 py-3 rounded-2xl border bg-white focus:ring-2 focus:ring-pink-300"
          placeholder="Scan barcode here..."
          value={barcodeInput}
          onChange={(e) => handleScan(e.target.value)}
        />

        {barcodeInput && (
          <p className="text-sm text-gray-600">
            Scanned: <b>{barcodeInput}</b>
          </p>
        )}

      </div>

      {/* PRODUCTS GRID (2 PER ROW) */}
      <div className="grid grid-cols-2 gap-6">

        {filtered.map((product) => (
          <div
            key={product.id}
            className={`bg-white border rounded-3xl p-5 transition-all duration-300
              ${foundId === product.id ? "ring-4 ring-pink-400 scale-105" : ""}
            `}
          >

            <h2 className="font-bold text-lg">
              {product.name}
            </h2>

            <p className="text-sm text-gray-500">
              Barcode: {product.barcode || "—"}
            </p>

            <div className="mt-4 flex justify-between text-sm bg-gray-50 p-3 rounded-xl">
              <span>💰 {product.price ?? "—"}</span>
              <span>📦 {product.quantity ?? 0}</span>
            </div>

            <div className="mt-5 flex justify-between">

              <button
                onClick={() => setEditing(product)}
                className="text-xs px-4 py-1.5 rounded-full bg-gray-100"
              >
                ✏️ Edit
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
                className="text-xs px-4 py-1.5 rounded-full text-red-500 bg-red-50"
              >
                🗑 Delete
              </button>

            </div>

          </div>
        ))}

      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-xl rounded-3xl p-6">

            <h2 className="text-xl font-semibold mb-5">
              Edit Product
            </h2>

            <input
              className="w-full border rounded-2xl p-3 mb-2"
              value={editing.name || ""}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />

            <input
              className="w-full border rounded-2xl p-3 mb-2"
              value={editing.barcode || ""}
              onChange={(e) =>
                setEditing({ ...editing, barcode: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full border rounded-2xl p-3 mb-2"
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
              className="w-full border rounded-2xl p-3 mb-2"
              value={editing.quantity || 0}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  quantity: Number(e.target.value),
                })
              }
            />

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() => setEditing(null)}
                className="px-5 py-2 rounded-2xl border"
              >
                Cancel
              </button>

              <button
                onClick={saveProduct}
                className="px-5 py-2 rounded-2xl bg-black text-white"
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