"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ProductsManager({
  products = [],
}: {
  products?: any[];
}) {
  const router = useRouter();

  const [editing, setEditing] =
    useState<any | null>(null);

  const deleteProduct = async (
    id: string
  ) => {
    await supabase
      .from("products")
      .delete()
      .eq("id", id);

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
      })
      .eq("id", editing.id);

    setEditing(null);
    router.refresh();
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <table className="w-full">

          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-4">
                Product
              </th>

              <th className="text-left p-4">
                Barcode
              </th>

              <th className="text-left p-4">
                Price
              </th>

              <th className="text-left p-4">
                Stock
              </th>

              <th className="text-left p-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center p-10 text-gray-500"
                >
                  No products found
                </td>
              </tr>
            )}

            {products.map((product) => (
              <tr
                key={product.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4 font-medium">
                  {product.name}
                </td>

                <td className="p-4">
                  {product.barcode || "—"}
                </td>

                <td className="p-4">
                  ${product.price ?? 0}
                </td>

                <td className="p-4">
                  {product.quantity ?? 0}
                </td>

                <td className="p-4">
                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        setEditing(product)
                      }
                      className="px-3 py-1 rounded bg-blue-100 text-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteProduct(product.id)
                      }
                      className="px-3 py-1 rounded bg-red-100 text-red-700"
                    >
                      Delete
                    </button>

                  </div>
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl p-6 w-full max-w-md">

            <h2 className="text-xl font-bold mb-4">
              Edit Product
            </h2>

            <input
              className="w-full border rounded p-2 mb-2"
              value={editing.name || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  name: e.target.value,
                })
              }
            />

            <input
              className="w-full border rounded p-2 mb-2"
              value={editing.barcode || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  barcode: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="w-full border rounded p-2 mb-2"
              value={editing.price || 0}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  price: Number(
                    e.target.value
                  ),
                })
              }
            />

            <input
              type="number"
              className="w-full border rounded p-2 mb-4"
              value={editing.quantity || 0}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  quantity: Number(
                    e.target.value
                  ),
                })
              }
            />

            <div className="flex justify-end gap-2">

              <button
                onClick={() =>
                  setEditing(null)
                }
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
    </>
  );
}