import { categoriesData } from "@/data/homeData";
import { defaultExcelProducts } from "@/lib/excelService";

export type Category = { slug: string; name: string; description: string; image: string };
export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  stock: number;
  fits: string[];
  image: string;
  image2?: string;
  image3?: string;
  images?: string[];
  isNew?: boolean;
  bestSeller?: boolean;
  offer?: string;
  description: string;
  specs?: Record<string, string>;
  options?: { label: string; values: string[] };
  createdAt?: string;
  updatedAt?: string;
};

export const categories: Category[] = categoriesData as Category[];
// Products initialized directly from the synchronized Excel catalog
export const products: Product[] = defaultExcelProducts;

export const coupons: Record<string, number> = { TRAIL10: 0.1, MUD15: 0.15 };

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const getProduct = (slug: string) => {
  if (!slug) return undefined;
  const s = slug.toLowerCase().trim();
  return (
    products.find((p) => p.slug === slug || p.slug.toLowerCase() === s) ||
    defaultExcelProducts.find((p) => p.slug === slug || p.slug.toLowerCase() === s)
  );
};
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const SHIPPING_FREE_OVER = 199;
export const SHIPPING_FLAT = 19;
