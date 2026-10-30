import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { PageHeader, ProductCard } from "@/components/site";
import { useExcelProducts } from "@/hooks/useExcelProducts";
import { useCategories } from "@/hooks/useCategories";

type Search = {
  q?: string | undefined;
  category?: string | undefined;
  sort?: string | undefined;
  model?: string | undefined;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" ? s["q"] as string : undefined,
    category: typeof s["category"] === "string" ? s["category"] as string : undefined,
    sort: typeof s["sort"] === "string" ? s["sort"] as string : undefined,
    model: typeof s["model"] === "string" ? s["model"] as string : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop Off-Road Parts & Equipment — YSK 4X4" },
      { name: "description", content: "Browse lift kits, bumpers, wheels, winches, lighting and drivetrain parts for Thar, Jimny, Wrangler & Fortuner." },
      { property: "og:title", content: "Shop Off-Road Parts & Equipment — YSK 4X4" },
      { property: "og:description", content: "Filter by vehicle fitment, category, brand, price and rating." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { q, category, sort = "popular", model: searchModel } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });

  // Dynamically load products exclusively from live Excel catalog
  const { products: excelProducts, loading } = useExcelProducts();
  const { categories } = useCategories();
  const activeProducts = excelProducts;

  const [brand, setBrand] = useState<string[]>([]);
  const [model, setModel] = useState<string | null>(searchModel || null);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [inStock, setInStock] = useState(false);
  const [visible, setVisible] = useState(9);

  // Sync model state if search params change
  useEffect(() => {
    if (searchModel !== undefined) {
      setModel(searchModel);
    }
  }, [searchModel]);

  const cat = category ? categories.find((c) => c.slug.toLowerCase() === category.toLowerCase()) : undefined;

  // Dynamically extract brands from actual Excel products
  const brands = useMemo(() => {
    return [...new Set(activeProducts.map((p) => p.brand).filter(Boolean))].sort();
  }, [activeProducts]);

  // Dynamically extract vehicle models from actual Excel products' fits
  const models = useMemo(() => {
    const set = new Set<string>();
    activeProducts.forEach((p) => {
      (p.fits || []).forEach((f) => {
        const clean = f.trim();
        if (clean) set.add(clean);
      });
    });
    return Array.from(set).sort();
  }, [activeProducts]);

  const list = useMemo(() => {
    const term = q?.toLowerCase().trim();
    let r = activeProducts.filter((p) => {
      const matchCategory = !category || p.category.toLowerCase() === category.toLowerCase();

      const searchContent = [
        p.name,
        p.brand,
        p.category,
        p.description,
        ...(p.fits || []),
      ].join(" ").toLowerCase();

      const matchTerm = !term || searchContent.includes(term);
      const matchBrand = brand.length === 0 || brand.includes(p.brand);
      const matchModel =
        !model ||
        (p.fits || []).some(
          (f) =>
            f.toLowerCase().includes(model.toLowerCase()) ||
            model.toLowerCase().includes(f.toLowerCase())
        ) ||
        (p.name || "").toLowerCase().includes(model.toLowerCase());
      const matchPrice = p.price <= maxPrice;
      const matchStock = !inStock || p.stock > 0;

      return matchCategory && matchTerm && matchBrand && matchModel && matchPrice && matchStock;
    });

    const sorters: Record<string, (a: typeof r[0], b: typeof r[0]) => number> = {
      popular: (a, b) => b.reviews - a.reviews,
      newest: (a, b) => {
        const tA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const tB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return tB - tA;
      },
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
    };
    return [...r].sort(sorters[sort] ?? sorters["popular"]);
  }, [activeProducts, q, category, brand, model, maxPrice, inStock, sort]);

  const chips: [string, () => void][] = [
    ...(q ? [[`"${q}"`, () => navigate({ search: (s) => ({ ...s, q: undefined }) })] as [string, () => void]] : []),
    ...(cat ? [[cat.name, () => navigate({ search: (s) => ({ ...s, category: undefined }) })] as [string, () => void]] : []),
    ...brand.map((b) => [b, () => setBrand(brand.filter((x) => x !== b))] as [string, () => void]),
    ...(model ? [[model, () => { setModel(null); navigate({ search: (s) => ({ ...s, model: undefined }) }); }] as [string, () => void]] : []),
    ...(inStock ? [["In stock", () => setInStock(false)] as [string, () => void]] : []),
    ...(maxPrice < 3000 ? [[`Under $${maxPrice}`, () => setMaxPrice(3000)] as [string, () => void]] : []),
  ];

  const clearAll = () => {
    setBrand([]);
    setModel(null);
    setInStock(false);
    setMaxPrice(3000);
    navigate({ search: {} });
  };

  return (
    <>
      <PageHeader
        title={q ? `Results for "${q}"` : model ? `Parts for ${model}` : cat?.name ?? "All Products"}
        sub={cat?.description ?? "Dynamic live product catalogue direct from master inventory."}
      />
      <div className="container-page grid gap-10 py-10 md:grid-cols-[220px_1fr]">
        <aside className="space-y-8 text-sm">
          <Group title="Category">
            <Link
              to="/shop"
              search={(s: Search) => ({ ...s, category: undefined })}
              className={!category ? "font-semibold text-primary" : "hover:text-primary"}
            >
              All Categories
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/shop"
                search={(s: Search) => ({ ...s, category: c.slug })}
                className={category === c.slug ? "font-semibold text-primary" : "hover:text-primary"}
              >
                {c.name}
              </Link>
            ))}
          </Group>

          {models.length > 0 && (
            <Group title="Vehicle Fitment">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="model"
                  checked={model === null}
                  onChange={() => {
                    setModel(null);
                    navigate({ search: (s) => ({ ...s, model: undefined }) });
                  }}
                  className="accent-primary"
                />
                All Vehicles
              </label>
              {models.map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="model"
                    checked={model === m}
                    onChange={() => {
                      setModel(m);
                      navigate({ search: (s) => ({ ...s, model: m }) });
                    }}
                    className="accent-primary"
                  />
                  {m}
                </label>
              ))}
            </Group>
          )}

          {brands.length > 0 && (
            <Group title="Brand">
              {brands.map((b) => (
                <label key={b} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brand.includes(b)}
                    onChange={() =>
                      setBrand(brand.includes(b) ? brand.filter((x) => x !== b) : [...brand, b])
                    }
                    className="accent-primary"
                  />
                  {b}
                </label>
              ))}
            </Group>
          )}

          <Group title={`Max price: $${maxPrice}`}>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(+e.target.value)}
              className="w-full accent-primary"
              aria-label="Maximum price"
            />
          </Group>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="accent-primary"
            />
            In stock only
          </label>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">{list.length} products</p>
            {chips.map(([label, fn]) => (
              <button
                key={label}
                onClick={fn}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
              >
                {label}
                <X className="size-3" />
              </button>
            ))}
            {chips.length > 0 && (
              <button onClick={clearAll} className="text-xs font-semibold text-primary hover:underline">
                Clear all
              </button>
            )}
            <select
              value={sort}
              onChange={(e) => navigate({ search: (s) => ({ ...s, sort: e.target.value }) })}
              className="field ml-auto w-auto"
              aria-label="Sort"
            >
              <option value="popular">Most popular</option>
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          {list.length === 0 ? (
            <div className="rounded-lg border border-dashed p-16 text-center">
              <p className="font-semibold text-base">No products match those filters.</p>
              <p className="text-xs text-muted-foreground mt-1">Showing only live items from the Excel database.</p>
              <button onClick={clearAll} className="btn btn-outline mt-4">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
                {list.slice(0, visible).map((p) => (
                  <ProductCard key={p.slug} p={p} />
                ))}
              </div>
              {visible < list.length && (
                <div className="mt-10 text-center">
                  <button onClick={() => setVisible(visible + 9)} className="btn btn-outline">
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 font-semibold">{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
