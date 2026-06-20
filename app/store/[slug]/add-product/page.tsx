"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();
  const params = useParams();

  const slug = params.slug as string;

  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("medicine");
  const [owner, setOwner] = useState("general");
  const [expiryDate, setExpiryDate] = useState("");
  const [description, setDescription] = useState(""); // ⭐ NEW
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) {
      alert("Product name is required");
      return;
    }

    setLoading(true);

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .single();

    if (storeError || !store) {
      alert("Store not found");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("products").insert([
      {
        store_id: store.id,
        name: name.trim(),
        barcode: barcode.trim() || null,
        price: price ? Number(price) : null,
        quantity: Number(quantity),
        category,
        owner,
        expiry_date: expiryDate || null,
        description: description.trim() || null, // ⭐ NEW
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Product added successfully!");
    router.push(`/store/${slug}/products`);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 text-black">
      <div className="w-full max-w-xl border rounded-2xl p-6 shadow-sm">

        <h1 className="text-2xl font-bold mb-1">
          Add Product
        </h1>

        <p className="mb-6 text-gray-600">
          Add medicines, items, or inventory products
        </p>

        {/* NAME */}
        <input
          className="w-full border p-3 rounded-xl mb-3"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* BARCODE */}
        <input
          className="w-full border p-3 rounded-xl mb-3"
          placeholder="Barcode (optional)"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        />

        {/* PRICE */}
        <input
          className="w-full border p-3 rounded-xl mb-3"
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* QUANTITY */}
        <input
          className="w-full border p-3 rounded-xl mb-3"
          placeholder="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        {/* EXPIRY DATE */}
        <input
          className="w-full border p-3 rounded-xl mb-3"
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />

        {/* DESCRIPTION ⭐ NEW */}
        <textarea
          className="w-full border p-3 rounded-xl mb-3"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* OWNER */}
        <select
          className="w-full border p-3 rounded-xl mb-5"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        >
          <option value="general">General</option>
          <option value="me">Amani</option>
          <option value="husband">Hadi</option>
          <option value="child">Noah</option>
          <option value="cat">Melody</option>
        </select>

        {/* BUTTON */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-xl hover:bg-gray-800"
        >
          {loading ? "Saving..." : "Add Product"}
        </button>

      </div>
    </div>
  );
}