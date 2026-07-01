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
    if (!selected?.id) return;

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
  // MARK DONE
  // -------------------------
  const markDone = async (p: any) => {
    const { error } = await supabase
      .from("products")
      .update({ status: "out_of_stock" })
      .eq("id", p.id);

    if (!error) {
      setLocalProducts((prev) =>
        prev.map((x) =>
          x.id === p.id ? { ...x, status: "out_of_stock" } : x
        )
      );
    }
  };

  // -------------------------
  // MARK RESTOCK
  // -------------------------
  const markRestocked = async (p: any) => {
    const { error } = await supabase
      .from("products")
      .update({ status: "active", quantity: 10 })
      .eq("id", p.id);

    if (!error) {
      setLocalProducts((prev) =>
        prev.map((x) =>
          x.id === p.id
            ? { ...x, status: "active", quantity: 10 }
            : x
        )
      );
    }
  };

  // -------------------------
  // SCANNER (FIXED 4 ARGS)
  // -------------------------
  const startScanner = async () => {
    const scanner = new Html5Qrcode("reader");

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },

        // SUCCESS
        async (barcode: string) => {
          await scanner.stop();

          const { data } = await supabase
            .from("products")
            .select("*")
            .eq("barcode", barcode)
            .single();

          if (data) openProduct(data);
          else alert("Product not found");
        },

        // ERROR CALLBACK (required by new version)
        () => {}
      );
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // EXPIRY (FIXED 100%)
  // -------------------------
  const getExpiry = (date?: string) => {
    if (!date) return null;

    const exp = new Date(date);
    const now = new Date();

    exp.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diff = Math.floor(
      (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff <= 0) {
      return { text: "EXPIRED", type: "expired" };
    }

    if (diff <= 60) {
      return { text: `Exp in ${diff}d`, type: "warning" };
    }

    return { text: `Exp in ${diff}d`, type: "normal" };
  };

  return (
    <div className="space-y-4">

      {/* SEARCH + SCAN */}
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

          if (p.status === "out_of_stock") {
            rowClass =
              "flex justify-between p-3 border-b bg-gray-200 text-gray-600";
          } else if (exp?.type === "expired") {
            rowClass =
              "flex justify-between p-3 border-b bg-red-600 text-white font-bold";
          } else if (exp?.type === "warning") {
            rowClass =
              "flex justify-between p-3 border-b bg-yellow-100 text-yellow-900";
          }

          return (
            <div
              key={p.id}
              className={rowClass}
              onClick={() => openProduct(p)}
            >
              {/* LEFT */}
              <div>
                <div className="font-bold">{p.name}</div>
                <div className="text-sm opacity-80">{p.barcode}</div>

                {exp && (
                  <div className="text-xs mt-1 font-semibold">
                    {exp.text}
                  </div>
                )}

                {p.status === "out_of_stock" && (
                  <div className="text-xs font-bold">
                    OUT OF STOCK
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div className="flex gap-3 items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markDone(p);
                  }}
                  className="text-red-500 text-sm"
                >
                  Done
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markRestocked(p);
                  }}
                  className="text-green-500 text-sm"
                >
                  Restock
                </button>

                <div className="font-bold">
                  {p.quantity}
                </div>
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
            />

            <input
              className="border p-2 w-full"
              value={form.barcode}
              onChange={(e) =>
                setForm({ ...form, barcode: e.target.value })
              }
            />

            <input
              className="border p-2 w-full"
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
            />

            <input
              className="border p-2 w-full"
              type="number"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: e.target.value })
              }
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
            />

            <button
              onClick={saveProduct}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Save
            </button>

          </div>
        </div>
      )}
    </div>
  );
}