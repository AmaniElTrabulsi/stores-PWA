"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Html5Qrcode } from "html5-qrcode";

export default function ProductsManager({
  products,
}: {
  products: any[];
  storeId: string;
}) {
  const [query, setQuery] = useState("");
  const [localProducts, setLocalProducts] = useState(products);
  const [selected, setSelected] = useState<any | null>(null);

  const [form, setForm] = useState({
    name: "",
    barcode: "",
    price: "",
    quantity: "",
    expiry_date: "",
    description: "",
  });

  // -------------------------
  // SEARCH
  // -------------------------
  const filtered = localProducts.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  // -------------------------
  // OPEN PRODUCT
  // -------------------------
  const openProduct = (p: any) => {
    setSelected(p);

    setForm({
      name: p.name || "",
      barcode: p.barcode || "",
      price: p.price?.toString() || "",
      quantity: p.quantity?.toString() || "",
      expiry_date: p.expiry_date || "",
      description: p.description || "",
    });
  };

  // -------------------------
  // SAVE
  // -------------------------
  const saveProduct = async () => {
    if (!selected?.id) {
      alert("No product selected");
      return;
    }

    const payload = {
      name: form.name,
      barcode: form.barcode,
      price: Number(form.price) || null,
      quantity: Number(form.quantity) || 0,
      expiry_date: form.expiry_date || null,
      description: form.description,
    };

    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", selected.id);

    if (error) {
      console.error("SAVE ERROR:", error);
      alert(error.message);
      return;
    }

    setLocalProducts((prev) =>
      prev.map((p) =>
        p.id === selected.id ? { ...p, ...payload } : p
      )
    );

    setSelected(null);
  };

  // -------------------------
  // SCANNER
  // -------------------------
  const startScanner = async () => {
    const scanner = new Html5Qrcode("reader");

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (barcode: string) => {
          await scanner.stop();

          const { data } = await supabase
            .from("products")
            .select("*")
            .eq("barcode", barcode)
            .single();

          if (data) openProduct(data);
          else alert("Product not found");
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // 🔥 FIXED EXPIRY LOGIC (NO BUGS)
  // -------------------------
  const getExpiry = (date?: string) => {
    if (!date) return null;

    const exp = new Date(date);
    const now = new Date();

    // IMPORTANT: remove time part (fixes 0-day bug)
    exp.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 🔴 EXPIRED (today OR past)
    if (diffDays <= 0) {
      return {
        text: `EXPIRED`,
        type: "expired",
      };
    }

    // 🟡 WARNING
    if (diffDays <= 60) {
      return {
        text: `Exp in ${diffDays}d`,
        type: "warning",
      };
    }

    return {
      text: `Exp in ${diffDays}d`,
      type: "normal",
    };
  };

  return (
    <div className="space-y-4">

      {/* SCAN + SEARCH */}
      <div className="flex gap-2">
        <button
          onClick={startScanner}
          className="bg-black text-white px-4 py-2 rounded-xl"
        >
          Scan
        </button>

        <input
          className="w-full border p-3 rounded-xl"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div id="reader" />

      {/* LIST */}
      <div className="bg-white border rounded-xl">
        {filtered.map((p) => {
          const exp = getExpiry(p.expiry_date);

          let rowClass =
            "flex justify-between p-3 border-b cursor-pointer hover:bg-gray-50";

          if (exp?.type === "expired") {
            rowClass =
              "flex justify-between p-3 border-b cursor-pointer bg-red-600 text-white hover:bg-red-700 font-bold";
          } else if (exp?.type === "warning") {
            rowClass =
              "flex justify-between p-3 border-b cursor-pointer bg-yellow-100 text-yellow-900 hover:bg-yellow-200";
          }

          return (
            <div
              key={p.id}
              onClick={() => openProduct(p)}
              className={rowClass}
            >
              {/* LEFT */}
              <div>
                <div className="font-bold">{p.name}</div>

                <div className="text-sm opacity-80">
                  {p.barcode}
                </div>

                {exp && (
                  <div className="text-xs mt-1 font-semibold">
                    {exp.text}
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div className="font-bold text-lg">
                {p.quantity ?? 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[420px] space-y-3">

            <h2 className="text-xl font-bold">Edit Product</h2>

            <input
              className="border p-2 w-full"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Name"
            />

            <input
              className="border p-2 w-full"
              value={form.barcode}
              onChange={(e) =>
                setForm({ ...form, barcode: e.target.value })
              }
              placeholder="Barcode"
            />

            <input
              className="border p-2 w-full"
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
              placeholder="Price"
            />

            <input
              className="border p-2 w-full"
              type="number"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: e.target.value })
              }
              placeholder="Stock"
            />

            <input
              className="border p-2 w-full"
              type="date"
              value={form.expiry_date}
              onChange={(e) =>
                setForm({ ...form, expiry_date: e.target.value })
              }
            />

            <textarea
              className="border p-2 w-full"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Description"
            />

            {/* ACTIONS */}
            <div className="flex justify-between mt-4">

              <button
                onClick={() => setSelected(null)}
                className="px-3 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={saveProduct}
                className="px-3 py-2 bg-black text-white rounded"
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