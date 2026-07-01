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

  const handleSave = async () => {
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!store) {
      alert("Store not found");
      return;
    }

    await supabase.from("products").insert({
      store_id: store.id,
      name,
      barcode,
      price: price ? Number(price) : null,
      quantity: Number(quantity),
    });

    router.push(`/store/${slug}/products`);
  };

  return (
    <div className="p-6 text-black space-y-3">
      <h1 className="text-2xl font-bold">Add Product</h1>

      <input
        className="border p-3 w-full"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-3 w-full"
        placeholder="Barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />

      <input
        className="border p-3 w-full"
        placeholder="Price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        className="border p-3 w-full"
        placeholder="Quantity"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="bg-black text-white px-4 py-3 rounded-xl"
      >
        Save
      </button>
    </div>
  );
}