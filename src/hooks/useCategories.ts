import { useState, useEffect, useCallback } from "react";
import { categoriesData } from "@/data/homeData";
import type { Category } from "@/lib/catalog";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(categoriesData as Category[]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      }
    } catch {
      // Fallback stays as default categoriesData
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refreshCategories: fetchCategories };
}

