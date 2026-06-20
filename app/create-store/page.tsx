"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CreateStorePage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function createSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  const handleCreate = async () => {
    if (!name) return;

    setLoading(true);

    const slug = createSlug(name);

    const { error } = await supabase.from("stores").insert([
      { name, slug },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Create Store
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Add a new store to your system
        </p>

        <input
          type="text"
          placeholder="Store name (e.g. ABC Pharmacy)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition"
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full mt-5 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Store"}
        </button>
      </div>
    </div>
  );
}