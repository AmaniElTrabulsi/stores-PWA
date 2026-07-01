"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [foundId, setFoundId] = useState<string | null>(null);

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // =========================
  // FAST LOOKUP MAP (performance boost)
  // =========================
  const productMap = useMemo(() => {
    const map = new Map();
    (products || []).forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const selected = selectedId ? productMap.get(selectedId) : null;

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

  const getExpiryLabel = (p: any) => {
    const days = getDaysUntilExpiry(p.expiry_date);

    if (days === null) return null;
    if (days < 0) return "EXPIRED";
    if (days <= 60) return `EXP: ${days}d`;
    return null;
  };

  const getExpiryClass = (p: any) => {
    const days = getDaysUntilExpiry(p.expiry_date);

    if (days === null) return "";
    if (days < 0) return "bg-red-100";
    if (days <= 60) return "bg-yellow-100";
    return "";
  };

  const isOutOfStock = (p: any) => p.status === "out_of_stock";

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
              }, 150);
            }

            setScannerOpen(false);

            if (running) {
              running = false;
              scanner?.stop().catch(() => {});
            }
          },
          () => {}
        );

        running = true;
      } catch (err) {
        console.error(err);
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
  // ACTIONS
  // =========================
  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setSelectedId(null);
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
        description: editing.description,
        expiry_date: editing.expiry_date,
      })
      .eq("id", editing.id);

    setEditing(null);
    setSelectedId(null);
    router.refresh();
  };

  const markOutOfStock = async (id: string) => {
    await supabase
      .from("products")
      .update({ status: "out_of_stock" })
      .eq("id", id);

    router.refresh();
  };

  const restockProduct = async (id: string) => {
    const qty = prompt("Enter new stock quantity:", "10");
    if (!qty) return;

    await supabase
      .from("products")
      .update({
        status: "active",
        quantity: Number(qty),
      })
      .eq("id", id);

    router.refresh();
  };

  // =========================
  // SELECT (FAST)
  // =========================
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // =========================
  // UI
  // =========================
  return (
    <div className="space-y-4 text-black">

      {/* SEARCH + SCAN */}
      <div className="flex gap-2">
        <input
          className="w-full border rounded-xl p-3"
          placeholder="Search medicine..."
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
          <div id="reader" />
          <button
            onClick={() => setScannerOpen(false)}
            className="mt-2 w-full border rounded-xl p-2"
          >
            Close
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white border rounded-2xl overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-[4fr_1fr_2fr] p-4 bg-gray-50 font-semibold text-sm">
          <div>Product</div>
          <div>Stock</div>
          <div>Status</div>
        </div>

        {/* ROWS */}
        {filtered?.map((p) => {
          const label = getExpiryLabel(p);

          return (
            <div
              key={p.id}
              ref={(el) => (rowRefs.current[p.id] = el)}
              className={`grid grid-cols-[4fr_1fr_2fr] p-4 border-t cursor-pointer transition text-black
                ${
                  foundId === p.id
                    ? "bg-green-100"
                    : isOutOfStock(p)
                    ? "bg-orange-100"
                    : getExpiryClass(p)
                }
              `}
            >
              {/* NAME */}
              <div
                className="font-medium truncate"
                onClick={() => handleSelect(p.id)}
              >
                {p.name}

                {isOutOfStock(p) && (
                  <span className="ml-2 text-xs bg-orange-200 px-2 py-1 rounded">
                    OUT OF STOCK
                  </span>
                )}
              </div>

              {/* STOCK */}
              <div className="text-center font-medium">
                {p.quantity ?? 0}
              </div>

              {/* STATUS LABELS */}
              <div className="text-sm font-medium">
                {label && (
                  <span
                    className={
                      label === "EXPIRED"
                        ? "text-red-600 font-bold"
                        : "text-yellow-700"
                    }
                  >
                    {label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================
          DETAIL MODAL
      ========================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl space-y-2 text-black">

            <h2 className="text-xl font-bold">{selected.name}</h2>

            <p><b>Barcode:</b> {selected.barcode}</p>
            <p><b>Price:</b> {selected.price}</p>
            <p><b>Stock:</b> {selected.quantity}</p>
            <p><b>Status:</b> {selected.status || "active"}</p>
            <p><b>Expiry Date:</b> {selected.expiry_date || "—"}</p>
            <p><b>Description:</b> {selected.description || "—"}</p>

            <div className="flex flex-wrap gap-2 pt-3">

              <button
                onClick={() => setEditing(selected)}
                className="px-3 py-2 bg-gray-100 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => markOutOfStock(selected.id)}
                className="px-3 py-2 bg-orange-100 rounded"
              >
                Mark Finished
              </button>

              {selected.status === "out_of_stock" && (
                <button
                  onClick={() => restockProduct(selected.id)}
                  className="px-3 py-2 bg-green-100 rounded"
                >
                  Restock
                </button>
              )}

              <button
                onClick={() => deleteProduct(selected.id)}
                className="px-3 py-2 bg-red-100 text-red-600 rounded"
              >
                Delete
              </button>

              <button
                onClick={() => setSelectedId(null)}
                className="ml-auto px-3 py-2 border rounded"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =========================
          EDIT MODAL
      ========================= */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl space-y-2 text-black">

            <h2 className="text-lg font-bold">Edit Product</h2>

            <input
              className="w-full border p-2 rounded"
              value={editing.name || ""}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />

            <input
              className="w-full border p-2 rounded"
              value={editing.barcode || ""}
              onChange={(e) =>
                setEditing({ ...editing, barcode: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full border p-2 rounded"
              value={editing.price || 0}
              onChange={(e) =>
                setEditing({ ...editing, price: Number(e.target.value) })
              }
            />

            <input
              type="number"
              className="w-full border p-2 rounded"
              value={editing.quantity || 0}
              onChange={(e) =>
                setEditing({ ...editing, quantity: Number(e.target.value) })
              }
            />

            <input
              type="date"
              className="w-full border p-2 rounded"
              value={editing.expiry_date || ""}
              onChange={(e) =>
                setEditing({ ...editing, expiry_date: e.target.value })
              }
            />

            <textarea
              className="w-full border p-2 rounded"
              value={editing.description || ""}
              onChange={(e) =>
                setEditing({ ...editing, description: e.target.value })
              }
            />

            <div className="flex justify-end gap-2 pt-2">
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