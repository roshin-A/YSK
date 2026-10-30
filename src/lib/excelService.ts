import type { Product } from "@/lib/catalog";
import initialExcelData from "@/data/productsFromExcel.json";

/**
 * Resolve the image from the Excel `image` column.
 *
 * Supports:
 *  - Full URL:      "https://example.com/photo.jpg"  → used directly
 *  - Filename only: "my-product.jpg"                 → "/images/products/my-product.jpg"
 *  - Path:          "products/my-product.jpg"         → "/images/products/my-product.jpg"
 *  - Empty/missing:                                   → "" (no image)
 */
function resolveImage(imageVal?: unknown): string {
  if (typeof imageVal !== "string" || !imageVal.trim()) return "";
  const trimmed = imageVal.trim();

  // Full URL — use as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Absolute path starting with / — already a public path
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Filename or relative path — serve from /images/products/
  // e.g. "lift-kit.jpg" → "/images/products/lift-kit.jpg"
  // e.g. "products/lift-kit.jpg" → "/images/products/lift-kit.jpg"
  const filename = trimmed.split("/").pop() || trimmed;
  return `/images/products/${filename}`;
}

// Convert any Excel row into a fully-typed Product Card
export function createNewProductCard(row: Record<string, unknown>, index = 0): Product {
  const rawName = String(
    row["Product Name"] ||
    row.name ||
    row["item name"] ||
    row["Item Name"] ||
    row.item ||
    `Custom Item ${index + 1}`
  ).trim();

  const rawId = String(
    row["Product ID"] ||
    row.id ||
    row.slug ||
    rawName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") ||
    `YSK${String(index + 1).padStart(3, "0")}`
  );

  const priceNum =
    typeof row["Price"] === "number"
      ? row["Price"]
      : typeof row.price === "number"
      ? row.price
      : parseFloat(String(row["Price"] || row.price || "0").replace(/[^0-9.]/g, "")) || 0;

  const compareAtNum =
    typeof row["Compare At"] === "number"
      ? row["Compare At"]
      : typeof row.compareAt === "number"
      ? row.compareAt
      : parseFloat(String(row["Compare At"] || row.compareAt || row["original price"] || "").replace(/[^0-9.]/g, "")) || undefined;

  // Quantity / Stock
  const stockVal =
    typeof row["Stock"] === "number"
      ? row["Stock"]
      : typeof row.stock === "number"
      ? row.stock
      : typeof row.contity === "number"
      ? row.contity
      : parseInt(String(row["Stock"] || row.stock || row.quantity || row.contity || "10"), 10);

  // Offer / Discount
  let offerVal = typeof (row["Offer"] || row.offer) === "string" ? String(row["Offer"] || row.offer).trim() : undefined;
  if (!offerVal && compareAtNum && priceNum < compareAtNum) {
    const pct = Math.round((1 - priceNum / compareAtNum) * 100);
    if (pct > 0) offerVal = `${pct}% OFF`;
  }

  // Fits
  const fitsRaw = row["Fits"] || row.fits ? String(row["Fits"] || row.fits) : "Wrangler, Jimny, Thar";
  const fitsList = fitsRaw.split(",").map((s) => s.trim()).filter(Boolean);

  const category = String(row["Category"] || row.category || "suspension").toLowerCase().trim();

  // Images: resolve Image 1, Image 2, Image 3
  const img1 = resolveImage(row["Image 1"] || row.image);
  const img2 = resolveImage(row["Image 2"] || row.image2);
  const img3 = resolveImage(row["Image 3"] || row.image3);
  const allImages = [img1, img2, img3].filter(Boolean);

  const isNewVal =
    row["Is New"] === true ||
    row.isNew === true ||
    String(row["Is New"] || row.isNew).toUpperCase() === "TRUE" ||
    row["Is New"] === 1 ||
    row.isNew === 1;

  const bestSellerVal =
    row["Best Seller"] === true ||
    row.bestSeller === true ||
    String(row["Best Seller"] || row.bestSeller).toUpperCase() === "TRUE" ||
    row["Best Seller"] === 1 ||
    row.bestSeller === 1;

  const descVal = String(
    row["Description"] ||
    row.description ||
    "Trail-tested heavy-duty 4x4 component engineered for severe off-road durability and guaranteed chassis fitment."
  );

  return {
    slug: rawId,
    name: rawName,
    brand: String(row["Brand"] || row.brand || "YSK 4x4"),
    category,
    price: priceNum,
    compareAt: compareAtNum,
    rating: typeof (row["Rating"] ?? row.rating) === "number" ? Number(row["Rating"] ?? row.rating) : parseFloat(String(row["Rating"] || row.rating || "4.8")) || 4.8,
    reviews: typeof (row["Reviews"] ?? row.reviews) === "number" ? Number(row["Reviews"] ?? row.reviews) : parseInt(String(row["Reviews"] || row.reviews || "25"), 10) || 25,
    stock: isNaN(stockVal) ? 0 : stockVal,
    fits: fitsList,
    image: img1 || allImages[0] || "",
    image2: img2 || undefined,
    image3: img3 || undefined,
    images: allImages.length > 0 ? allImages : (img1 ? [img1] : []),
    isNew: isNewVal,
    bestSeller: bestSellerVal,
    offer: offerVal,
    description: descVal,
    specs: {
      Category: category.toUpperCase(),
      Stock: stockVal > 0 ? `${stockVal} Units` : "Sold Out",
      Fitment: fitsList.join(", "),
    },
    createdAt: String(row["Created Date"] || row.createdAt || new Date().toISOString()),
    updatedAt: String(row["Updated Date"] || row.updatedAt || new Date().toISOString()),
  };
}

// Convert raw Excel rows array into array of Product Cards
export function loadProductsFromExcel(rows: unknown[] | null | undefined): Product[] {
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return [];
  }
  return rows.map((r, i) => createNewProductCard(r as Record<string, unknown>, i));
}

// Initial cached products from synced Excel data
export const defaultExcelProducts: Product[] = loadProductsFromExcel(initialExcelData);

