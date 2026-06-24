"use client";

import { useState, useEffect } from "react";
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
  const [foundId, setFoundId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const filtered = products.filter((p) => {
    const q = query.toLowerCase();

    return (
      String(p.name || "").toLowerCase().includes(q) ||
      String(p.barcode || "").toLowerCase().includes(q)
    );
  });

  // 📷 CAMERA SCANNER (client only safe)
  useEffect(() => {
    if (!scannerOpen) return;

    let scanner: any;

    const startScanner = async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");

      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render(
        (decodedText: string) => {
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
        () => {}
      );
    };

    startScanner();

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
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

      {/* SEARCH + SCAN */}
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

      {/* CAMERA */}
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

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-2 gap-6">

        {filtered.map((product) => (
          <div
            key={product.id}
            className={`bg-white border rounded-3xl p-5 flex flex-col justify-between transition-all duration-300
              ${foundId === product.id ? "ring-4 ring-pink-400 scale-[1.02]" : ""}
            `}
          >

            {/* TOP */}
            <div className="space-y-1">
              <h2 className="font-bold text-lg truncate">
                {product.name}
              </h2>

              <p className="text-xs text-gray-500 truncate">
                🔖 {product.barcode || "No barcode"}
              </p>
            </div>

            {/* PRICE + STOCK */}
            <div className="mt-4 bg-gray-50 rounded-2xl p-3 text-sm">
              <div className="flex justify-between">
                <span>💰 {product.price ?? "—"}</span>
                <span>📦 {product.quantity ?? 0}</span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex justify-between">

              <button
                onClick={() => setEditing(product)}
                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                ✏️ Edit
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
                className="text-xs px-3 py-1.5 rounded-full text-red-500 bg-red-50 hover:bg-red-100 transition"
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
                disabled={loading}
                className="px-5 py-2 rounded-2xl bg-black text-white"
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