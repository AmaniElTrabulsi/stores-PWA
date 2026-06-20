import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function Home() {
  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Stores
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage all your stores from one place
            </p>
          </div>

          <Link
            href="/create-store"
            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            ➕ Create Store
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Stores</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stores?.length ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Platform Status</p>
            <p className="mt-2 text-lg font-semibold text-green-600">
              Active
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Inventory System</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              Ready
            </p>
          </div>
        </div>

        {/* Empty State */}
        {(!stores || stores.length === 0) && (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
              🏪
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              No stores yet
            </h2>

            <p className="mt-2 text-gray-500">
              Create your first store to start managing products,
              inventory, and barcodes.
            </p>

            <Link
              href="/create-store"
              className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Create First Store
            </Link>
          </div>
        )}

        {/* Stores Grid */}
        {stores && stores.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/store/${store.slug}`}
                className="group rounded-3xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                    🏪
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-semibold text-gray-900">
                  {store.name}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Manage products, inventory, prices and barcodes.
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    /store/{store.slug}
                  </span>

                  <span className="font-medium text-black group-hover:translate-x-1 transition">
                    Open →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}