"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
  const [scannerOpen, setScannerOpen] = useState(false);
  const [foundId, setFoundId] = useState<string | null>(null);

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 🔍 SEARCH (name OR barcode)
  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return (products || []).filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        String(p.barcode || "").toLowerCase().includes(q)
      );
    });
  }, [products, query]);

  // 📷 SCANNER (SAFE + BACK CAMERA)
  useEffect(() => {
    if (!scannerOpen) return;

    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");

        const devices = await Html5Qrcode.getCameras();

        if (!devices?.length) return;

        const backCamera =
          devices.find((d) =>
            d.label.toLowerCase().includes("back")
          )?.id || devices[0].id;

        await html5QrCode.start(
          backCamera,
          {
            fps: 10,
            qrbox: 250,
          },
          (decodedText: string) => {
            console.log("SCAN:", decodedText);

            // 🚨 HARD SAFETY: prevent URL navigation bugs
            const cleanText = String(decodedText).trim();

            if (
              cleanText.startsWith("http") ||
              cleanText.startsWith("www")
            ) {
              console.warn("Blocked URL scan:", cleanText);
              return;
            }

            const product = (products || []).find(
              (p) => String(p.barcode) === cleanText
            );

            if (product) {
              setQuery(cleanText);
              setFoundId(product.id);

              setTimeout(() => {
                rowRefs.current[product.id]?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, 200);
            } else {
              console.warn("Product not found for barcode:", cleanText);
            }

            html5QrCode?.stop();
            setScannerOpen(false);
          },
          () => {
            // ignore scan errors
          }
        );
      } catch (err) {
        console.error("Scanner error:", err);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [scannerOpen, products]);

  // 🗑 DELETE
  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    router.refresh();
  };

  // ✏️ SAVE
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

      {/* SEARCH + SCAN */}
      <div className="flex gap-2">
        <input
          className="w-full border rounded-xl p-3"
          placeholder="Search by name or barcode..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={() => setScannerOpen(true)}
          className="px-4 bg-black text-white rounded-xl"
        >
          Scan
        </button>
      </div>

      {/* SCANNER */}
      {scannerOpen && (
        <div className="p-4 border rounded-xl">
          <div
            id="reader"
            className="w-full rounded-xl overflow-hidden"
          />
          <button
            onClick={() => setScannerOpen(false)}
            className="mt-2 w-full border rounded-xl p-2"
          >
            Close Scanner
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-2xl overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-3 p-4 bg-gray-50 font-semibold text-sm">
          <div>Product</div>
          <div>Stock</div>
          <div>Actions</div>
        </div>

        {/* ROWS */}
        {filtered?.map((p) => (
          <div
            key={p.id}
            ref={(el) => {
              rowRefs.current[p.id] = el;
            }}
            className={`grid grid-cols-3 p-4 border-t transition ${
              foundId === p.id ? "bg-green-100" : ""
            }`}
          >

            <div className="font-medium">
              {p.name}
            </div>

            <div>{p.quantity ?? 0}</div>

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