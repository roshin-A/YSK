import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  loadProductsFromExcel,
  createNewProductCard,
  defaultExcelProducts,
} from "@/lib/excelService";
import type { Product } from "@/lib/catalog";

export function useExcelProducts() {
  // Initialize directly from master Excel catalog to eliminate empty flash on SSR/load
  const [products, setProducts] = useState<Product[]>(defaultExcelProducts);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [excelSource, setExcelSource] = useState<string>("ysk-ecom.xlsx");

  // Fetch live rows from Excel file via server API
  const syncWithExcel = useCallback(async (isManual = false) => {
    try {
      setLoading(true);
      const res = await fetch("/api/excel-products", {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) {
        throw new Error(`Failed to read Excel (${res.status})`);
      }

      const data = await res.json();
      if (data && Array.isArray(data.rows)) {
        // Only show what's in Excel — if empty, show nothing
        const mappedProducts = loadProductsFromExcel(data.rows);
        setProducts(mappedProducts);
        setLastSync(new Date());
        if (data.source) setExcelSource(data.source);

        if (isManual) {
          if (mappedProducts.length > 0) {
            toast.success("Synchronized with Excel", {
              description: `Loaded ${mappedProducts.length} items from ${data.source.split("\\").pop() || "Excel"}`,
            });
          } else {
            toast.info("Excel has no products", {
              description: "Add rows to ysk-ecom.xlsx to show products on the page.",
            });
          }
        }
      }
    } catch (err: unknown) {
      console.warn("Excel live sync note:", err instanceof Error ? err.message : err);
      if (isManual) {
        toast.error("Could not read Excel file", {
          description: "Make sure ysk-ecom.xlsx exists and has product rows.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for real-time Excel file modifications from Vite watcher
  useEffect(() => {
    syncWithExcel(false);

    // If running with Vite HMR
    if (typeof window !== "undefined" && import.meta.hot) {
      import.meta.hot.on("excel-updated", () => {
        console.log("[Excel Hook] Excel file changed, re-syncing products...");
        syncWithExcel(false);
      });
    }
  }, [syncWithExcel]);

  // Function to create a brand new card dynamically
  const createNewCard = useCallback((row: Record<string, unknown>): Product => {
    const newCard = createNewProductCard(row, products.length);
    setProducts((prev) => [newCard, ...prev]);
    return newCard;
  }, [products.length]);

  return {
    products,
    loading,
    lastSync,
    excelSource,
    syncWithExcel: () => syncWithExcel(true),
    createNewCard,
  };
}

