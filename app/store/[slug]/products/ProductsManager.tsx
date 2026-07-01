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
  const [selected, setSelected] = useState<any | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [foundId, setFoundId] = useState<string | null>(null);

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // =========================
  // SEARCH
  // =========================
  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return (products || []).filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        String(p.barcode || "").toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });
  }, [products, query]);

  // =========================
  // EXPIRY LOGIC
  // =========================
  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    return Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const isExpired = (expiryDate?: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    return days !== null && days < 0;
  };

  const isExpiringSoon = (expiryDate?: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    return days !== null && days >= 0 && days <= 60;
  };

  const expiringProducts = (products || []).filter(
    (p) =>
      isExpired(p.expiry_date) || isExpiringSoon(p.expiry_date)
  );

  // =========================
  // SCANNER
  // =========================
  useEffect(() => {
    if (!scannerOpen) return;

    let scanner: Html5Qrcode | null = null;
    let running = false;

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode("reader");

        const devices = await Html5Qrcode.getCameras();
        if (!devices?.length) return;

        const backCamera =
          devices.find((d) =>
            d.label.toLowerCase().includes("back")
          )?.id || devices[0].id;

        await scanner.start(
          backCamera,
          { fps: 10, qrbox: 250 },
          (decodedText: string) => {
            const clean = String(decodedText).trim();

            setQuery(clean);

            const product = (products || []).find(
              (p) => String(p.barcode) === clean
            );

            if (product) {
              setFoundId(product.id);

              setTimeout(() => {
                rowRefs.current[product.id]?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, 200);
            }

            if (running) {
              running = false;
              scanner?.stop().catch(() => {});
            }

            setScannerOpen(false);
          },
          () => {}
        );

        running = true;
      } catch (err) {
        console.error("Scanner error:", err);
      }
    };

    startScanner();

    return () => {
      if (scanner && running) {
        running = false;
        scanner.stop().catch(() => {});
      }
    };
  }, [scannerOpen, products]);

  // =========================
  // DELETE
  // =========================
  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    router.refresh();
  };

  // =========================
  // SAVE
  // =========================
  const saveProduct = async () => {
    if (!editing) return;

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

    setEditing(null);
    setSelected(null);
    router.refresh();
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="space-y-4 text-black">

      {/* EXPIRY ALERT */}
      {expiringProducts.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-300 p-3 rounded-xl text-black">
          ⚠️ {expiringProducts.length} product(s) expired or expiring soon
        </div>
      )}

      {/* SEARCH + SCAN */}
      <div className="flex gap-2">
        <input
          className="w-full border rounded-xl p-3 text-black"
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
          <div id="reader" className="w-full" />
          <button
            onClick={() => setScannerOpen(false)}
            className="mt-2 w-full border rounded-xl p-2 text-black"
          >
            Close Scanner
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-2xl overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-[4fr_1fr_1.6fr] p-4 bg-gray-50 font-semibold text-sm text-black">
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
            className={`grid grid-cols-[4fr_1fr_1.6fr] p-4 border-t transition text-black
              ${
                foundId === p.id
                  ? "bg-green-100"
                  : isExpired(p.expiry_date)
                  ? "bg-red-100"
                  : isExpiringSoon(p.expiry_date)
                  ? "bg-yellow-100"
                  : ""
              }
            `}
          >

            {/* PRODUCT */}
            <div
              className="font-medium truncate cursor-pointer text-black"
              onClick={() => setSelected(p)}
            >
              {p.name}
            </div>

            {/* STOCK */}
            <div className="text-center font-medium text-black">
              {p.quantity ?? 0}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(p)}
                className="px-3 py-1 text-xs bg-gray-100 rounded text-black"
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

      {/* VIEW MODAL */}
      {selected && !editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl space-y-2 text-black">

            <h2 className="text-xl font-bold">Product Details</h2>

            <p><b>Name:</b> {selected.name}</p>
            <p><b>Barcode:</b> {selected.barcode}</p>
            <p><b>Price:</b> {selected.price}</p>
            <p><b>Stock:</b> {selected.quantity}</p>
            <p><b>Description:</b> {selected.description || "—"}</p>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 border rounded text-black"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-lg p-6 rounded-2xl space-y-2 text-black">

            <h2 className="text-lg font-bold">Edit Product</h2>

            <input
              className="w-full border p-2 rounded text-black"
              value={editing.name || ""}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
              placeholder="Name"
            />

            <input
              className="w-full border p-2 rounded text-black"
              value={editing.barcode || ""}
              onChange={(e) =>
                setEditing({ ...editing, barcode: e.target.value })
              }
              placeholder="Barcode"
            />

            <input
              type="number"
              className="w-full border p-2 rounded text-black"
              value={editing.price || 0}
              onChange={(e) =>
                setEditing({ ...editing, price: Number(e.target.value) })
              }
              placeholder="Price"
            />

            <input
              type="number"
              className="w-full border p-2 rounded text-black"
              value={editing.quantity || 0}
              onChange={(e) =>
                setEditing({ ...editing, quantity: Number(e.target.value) })
              }
              placeholder="Stock"
            />

            <textarea
              className="w-full border p-2 rounded text-black"
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
              placeholder="Description"
            />

            <div className="flex justify-end gap-2 pt-2">

              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border rounded text-black"
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