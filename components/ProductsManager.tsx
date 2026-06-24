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

  // 📷 CLEAN BARCODE SCANNER (FIXED)
  useEffect(() => {
    if (!scannerOpen) return;

    let scanner: any;

    const startScanner = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");

      scanner = new Html5Qrcode("reader");

      const cameras = await Html5Qrcode.getCameras();
      const cameraId = cameras?.[0]?.id;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 280, height: 120 },
        },
        (decodedText: string) => {
          const cleanCode = decodedText.trim();

          const product = products.find(
            (p) => String(p.barcode).trim() === cleanCode
          );

          if (product) {
            setFoundId(product.id);
          }

          // 🔥 auto-fill search so it "finds" instantly
          setQuery(cleanCode);

          setTimeout(() => setFoundId(null), 2000);

          scanner.stop();
          setScannerOpen(false);
        },
        () => {}
      );
    };

    startScanner();

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
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
          placeholder="Search products or scan barcode..."
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

      {/* SCANNER UI */}
      {scannerOpen && (
        <div className="mb-6 rounded-3xl overflow-hidden border bg-black relative">

          <div className="absolute top-2 left-2 z-10 text-white text-sm bg-black/60 px-3 py-1 rounded-full">
            📷 Align barcode inside box
          </div>

          <div id="reader" className="w-full" />

          <button
            onClick={() => setScannerOpen(false)}
            className="absolute bottom-3 left-3 right-3 bg-white text-black py-2 rounded-xl font-medium"
          >
            Close Scanner
          </button>
        </div>
      )}

      {/* PRODUCTS LIST (ROW STYLE) */}
      <div className="flex flex-col gap-3">

        {filtered.map((product) => (
          <div
            key={product.id}
            className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 transition
              ${foundId === product.id ? "ring-4 ring-pink-400" : ""}
            `}
          >

            {/* NAME + BARCODE */}
            <div className="flex flex-col min-w-[200px]">
              <span className="font-semibold text-gray-900">
                {product.name}
              </span>

              <span className="text-xs text-gray-500">
                Barcode: {product.barcode || "—"}
              </span>
            </div>

            {/* PRICE */}
            <div className="text-sm font-medium text-gray-700 min-w-[80px]">
              💰 {product.price ?? 0}
            </div>

            {/* STOCK */}
            <div className="text-sm text-gray-600 min-w-[80px]">
              📦 {product.quantity ?? 0}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(product)}
                className="px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200"
              >
                ✏️ Edit
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
                className="px-3 py-1 text-xs rounded-full bg-red-50 text-red-600 hover:bg-red-100"
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