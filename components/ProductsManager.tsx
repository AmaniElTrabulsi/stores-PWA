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

  // 📷 FIXED SCANNER (STABLE + NO CRASH + BACK CAMERA)
  useEffect(() => {
    if (!scannerOpen) return;

    let scanner: any;
    let active = true;

    const startScanner = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");

      scanner = new Html5Qrcode("reader");

      try {
        const cameras = await Html5Qrcode.getCameras();

        const backCamera =
          cameras.find((c) =>
            /back|rear|environment/i.test(c.label)
          ) || cameras[0];

        await scanner.start(
          backCamera.id,
          {
            fps: 12,
            qrbox: { width: 280, height: 120 },
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true,
            },
          },
          async (decodedText: string) => {
            if (!active) return;

            const code = decodedText.replace(/\s/g, "");

            const product = products.find(
              (p) =>
                String(p.barcode || "").replace(/\s/g, "") === code
            );

            setQuery(code);

            if (product) {
              setFoundId(product.id);
              setTimeout(() => setFoundId(null), 2000);
            }

            active = false;

            try {
              await scanner.stop();
            } catch {}

            setScannerOpen(false);
          }
        );
      } catch (err) {
        console.log("Scanner error:", err);
        setScannerOpen(false);
      }
    };

    startScanner();

    return () => {
      active = false;
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
      })
      .eq("id", editing.id);

    setLoading(false);
    setEditing(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6 rounded-3xl">

      {/* SEARCH */}
      <div className="mb-6 space-y-3">
        <input
          className="w-full px-4 py-3 rounded-2xl border bg-white"
          placeholder="Search or scan barcode..."
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

      {/* SCANNER UI (CLEAN + NO GLITCH) */}
      {scannerOpen && (
        <div className="mb-6 rounded-2xl overflow-hidden bg-black border relative">

          <div className="absolute top-3 left-3 z-10 text-white text-xs bg-black/60 px-3 py-1 rounded-full">
            Align barcode in frame
          </div>

          <div id="reader" className="w-full" />

          <button
            onClick={() => setScannerOpen(false)}
            className="absolute bottom-3 left-3 right-3 bg-white text-black py-3 rounded-xl font-semibold"
          >
            Close Scanner
          </button>
        </div>
      )}

      {/* PRODUCTS (CLEAN POS ROWS) */}
      <div className="flex flex-col gap-3">

        {filtered.map((product) => (
          <div
            key={product.id}
            className={`bg-white border rounded-2xl p-4 flex items-center justify-between gap-4 transition
              ${foundId === product.id ? "ring-4 ring-pink-400" : ""}
            `}
          >

            {/* NAME */}
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-semibold text-gray-900 truncate">
                {product.name}
              </span>

              <span className="text-xs text-gray-500 truncate">
                {product.barcode || "No barcode"}
              </span>
            </div>

            {/* PRICE */}
            <div className="w-[80px] text-right text-sm font-medium text-gray-700">
              ${product.price ?? 0}
            </div>

            {/* STOCK */}
            <div className="w-[70px] text-right text-sm text-gray-600">
              {product.quantity ?? 0}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 shrink-0">

              <button
                onClick={() => setEditing(product)}
                className="px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200"
              >
                ✏️
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
                className="px-3 py-1 text-xs rounded-full bg-red-50 text-red-600 hover:bg-red-100"
              >
                🗑
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