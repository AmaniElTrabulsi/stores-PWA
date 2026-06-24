"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ScanPage() {
  const [product, setProduct] = useState<any | null>(null);
  const [scannerOpen, setScannerOpen] = useState(true);

  useEffect(() => {
    if (!scannerOpen) return;

    let scanner: any;
    let active = true;

    const start = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");

      scanner = new Html5Qrcode("reader");

      const cameras = await Html5Qrcode.getCameras();

      const back =
        cameras.find((c) =>
          /back|rear|environment/i.test(c.label)
        ) || cameras[0];

      await scanner.start(
        back.id,
        { fps: 12, qrbox: { width: 280, height: 120 } },
        async (code: string) => {
          if (!active) return;

          const clean = code.trim();

          const { data } = await supabase
            .from("products")
            .select("*")
            .eq("barcode", clean)
            .single();

          setProduct(data || null);

          active = false;

          try {
            await scanner.stop();
          } catch {}

          setScannerOpen(false);
        }
      );
    };

    start();

    return () => {
      active = false;
      if (scanner) scanner.stop().catch(() => {});
    };
  }, [scannerOpen]);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">Scan Product</h1>

      {/* CAMERA */}
      {scannerOpen && (
        <div className="bg-black rounded-2xl overflow-hidden">
          <div id="reader" />
        </div>
      )}

      {/* RESULT */}
      {product && (
        <div className="mt-6 bg-white border rounded-2xl p-5">

          <h2 className="text-xl font-bold">
            {product.name}
          </h2>

          <p className="text-sm text-gray-600">
            Barcode: {product.barcode}
          </p>

          <p className="mt-2">
            💰 Price: ${product.price}
          </p>

          <p>
            📦 Stock: {product.quantity}
          </p>

        </div>
      )}

    </div>
  );
}