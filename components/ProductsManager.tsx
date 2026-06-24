"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ProductsManager({
  products,
}: {
  products: any[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [foundId, setFoundId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  // 📦 FILTER
  const filtered = products.filter((p) => {
    const q = query.toLowerCase();

    return (
      String(p.name || "").toLowerCase().includes(q) ||
      String(p.barcode || "").toLowerCase().includes(q)
    );
  });

  // 📷 CAMERA SCANNER
  useEffect(() => {
    if (!scannerOpen) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        const product = products.find(
          (p) => String(p.barcode) === String(decodedText)
        );

        if (product) {
          setFoundId(product.id);
          setTimeout(() => setFoundId(null), 2000);
        }

        scanner.clear();
        setScannerOpen(false);
      },
      (error) => {
        // ignore scan errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scannerOpen, products]);

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

      {/* SEARCH + SCAN BUTTON */}
      <div className="mb-6 space-y-3">

        <input
          className="w-full px-4 py-3 rounded-2xl border bg-white"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={() => setScannerOpen(true)}
          className="w-full py-3 rounded-2xl bg-black text-white"
        >
          📷 Scan Barcode
        </button>

      </div>

      {/* CAMERA SCANNER */}
      {scannerOpen && (
        <div className="mb-6">
          <div
            id="reader"
            className="w-full rounded-3xl overflow-hidden"
          />
          <button
            onClick={() => setScannerOpen(false)}
            className="mt-3 w-full py-2 rounded-xl border"
          >
            Close Scanner
          </button>
        </div>
      )}

      {/* GRID (2 PER ROW) */}
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

            {/* PRICE + STOCK + BARCODE */}
            <div className="mt-4 space-y-2 text-sm bg-gray-50 p-3 rounded-xl">

              <div className="flex justify-between">
                <span>💰 {product.price ?? "—"}</span>
                <span>📦 {product.quantity ?? 0}</span>
              </div>

              <div className="text-xs text-gray-500">
                🔖 {product.barcode || "No barcode"}
              </div>

            </div>

            {/* ACTIONS */}
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