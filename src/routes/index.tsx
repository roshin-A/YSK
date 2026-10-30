import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Wrench,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import {
  heroData,
  trustBadges,
  categoriesData,
  promoBannerData,
  reviewsData,
} from "@/data/homeData";
import { ProductCard } from "@/components/site";
import { useExcelProducts } from "@/hooks/useExcelProducts";
import { useCategories } from "@/hooks/useCategories";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YSK 4X4 Parts & Equipment — Premium Off-Road Parts" },
      {
        name: "description",
        content:
          "Trail-tested lift kits, bumpers, wheels, winches and lighting for Thar, Jimny, Wrangler & Fortuner.",
      },
      { property: "og:title", content: "YSK 4X4 Parts & Equipment — Premium Off-Road Parts" },
      {
        property: "og:description",
        content: "Trail-tested 4x4 parts with free shipping over $199.",
      },
    ],
  }),
  component: Index,
});

const iconMap = {
  Truck,
  ShieldCheck,
  RotateCcw,
  Wrench,
};

function Index() {
  const { products, loading, syncWithExcel } = useExcelProducts();
  const { categories } = useCategories();

  // Dynamic Hot & Latest Products direct from master Excel database
  // Automatically sorts newest items first so newly added products from admin appear at the top
  const hotProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const tA = new Date(a.createdAt || a.updatedAt || 0).getTime();
      const tB = new Date(b.createdAt || b.updatedAt || 0).getTime();
      if (tB !== tA && !isNaN(tB) && !isNaN(tA)) {
        return tB - tA;
      }
      return products.indexOf(b) - products.indexOf(a);
    });
  }, [products]);

  // Display top 8 latest products on homepage
  const latestProducts = useMemo(() => hotProducts.slice(0, 8), [hotProducts]);

  return (
    <>
      {/* 1. Hero Section — Simple, clean & spacious */}
      <section className="relative isolate min-h-[580px] overflow-hidden bg-[#2552A3] md:min-h-[680px] flex items-center">
        {/* Full-width hero image */}
        <img
          src={heroData.image}
          alt={heroData.alt}
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />

        {/* Smooth dark-to-transparent gradient for perfect readability */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2552A3]/95 via-[#2552A3]/75 to-transparent" />

        {/* Hero content */}
        <div className="container-page relative py-24 md:py-36">
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-white/90 uppercase">
            {heroData.badge}
          </p>

          <h1 className="mt-4 max-w-xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            {heroData.title}
          </h1>

          <p className="mt-5 max-w-md text-sm sm:text-base text-white/85 leading-relaxed">
            {heroData.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              to={heroData.primaryCta.link}
              className="btn bg-white text-[#2552A3] hover:bg-white/95 font-bold px-7 py-3 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              {heroData.primaryCta.label}
            </Link>
            <Link
              to={heroData.secondaryCta.link}
              className="btn border border-white/80 text-white hover:bg-white/10 font-semibold px-6 py-3 transition-colors"
            >
              {heroData.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Trust Bar — Clean, relaxing horizontal line */}
      <section className="border-b bg-card">
        <div className="container-page grid grid-cols-2 gap-6 py-7 md:grid-cols-4">
          {trustBadges.map((badge) => {
            const Icon = iconMap[badge.icon as keyof typeof iconMap] || ShieldCheck;
            return (
              <div
                key={badge.id}
                className="flex items-center gap-3 text-xs sm:text-sm font-medium text-foreground/90"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4 md:size-5" />
                </div>
                <span>{badge.title}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Shop by Category — Dynamic category cards from Admin/Config */}
      <section className="container-page mt-16 md:mt-20">
        <SectionTitle title="Shop by category" link="/shop" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group overflow-hidden rounded-xl border border-border/80 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-card"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={816}
                  height={816}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4 md:p-5">
                <p className="font-display font-bold text-base md:text-lg group-hover:text-primary transition-colors">
                  {c.name}
                </p>
                <p className="mt-1 line-clamp-1 text-xs md:text-sm text-muted-foreground">
                  {c.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Hot & Latest Products — Dynamically loaded from Excel */}
      <section className="container-page mt-16 md:mt-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl tracking-tight text-foreground">
              Hot & Latest Products
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Direct from master inventory · Updated automatically
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={syncWithExcel}
              disabled={loading}
              title="Sync with Excel catalog"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/70 px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-600" />
              <span>Excel Live</span>
              <RefreshCw className={`size-3 ${loading ? "animate-spin text-primary" : ""}`} />
            </button>

            <Link
              to="/shop"
              className="text-xs sm:text-sm font-semibold text-primary hover:underline"
            >
              View all ({products.length}) →
            </Link>
          </div>
        </div>

        {latestProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {latestProducts.map((p) => (
                <ProductCard key={p.slug} p={p} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/shop"
                className="btn btn-outline font-bold px-8 py-2.5 text-sm hover:bg-secondary shadow-xs transition-all"
              >
                View All Products in Shop →
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p className="font-semibold text-sm">No products found in Excel catalog.</p>
            <p className="mt-1 text-xs">Add products from the Admin Panel or upload a new products.xlsx</p>
          </div>
        )}
      </section>

      {/* 5. Promotional Banner — Clean, peaceful accent */}
      <section className="container-page mt-16 md:mt-20">
        <div className="grid items-center gap-8 rounded-2xl bg-[#2552A3] p-8 text-white md:grid-cols-2 md:p-12 lg:p-14 shadow-card">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase opacity-85">
              {promoBannerData.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-extrabold text-white">
              {promoBannerData.title}
            </h2>
            <p className="mt-3 text-sm md:text-base opacity-90">
              {promoBannerData.subtitle}{" "}
              <strong className="underline underline-offset-4 decoration-white/60">
                {promoBannerData.code}
              </strong>
              .
            </p>
          </div>
          <div className="md:text-right">
            <Link
              to={promoBannerData.link}
              className="btn bg-white text-[#2552A3] hover:bg-white/95 font-bold px-7 py-3 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              {promoBannerData.buttonText}
            </Link>
          </div>
        </div>
      </section>

      {/* 6. From the Trail — Relaxing Customer Reviews */}
      <section className="container-page mt-16 md:mt-20 mb-20">
        <SectionTitle title="From the trail" />
        <div className="grid gap-6 md:grid-cols-3">
          {reviewsData.map((r) => (
            <figure
              key={r.name}
              className="rounded-xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/40 transition-all duration-300"
            >
              <p className="text-primary text-sm font-bold">★★★★★</p>
              <blockquote className="mt-3 text-sm md:text-base leading-relaxed text-foreground/90">
                “{r.text}”
              </blockquote>
              <figcaption className="mt-4 border-t pt-3 text-xs sm:text-sm text-muted-foreground flex items-center justify-between">
                <span className="font-semibold text-foreground">{r.name}</span>
                <span>{r.rig}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionTitle({ title, link }: { title: string; link?: "/shop" }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-2xl font-extrabold md:text-3xl tracking-tight text-foreground">
        {title}
      </h2>
      {link && (
        <Link to={link} className="text-xs sm:text-sm font-semibold text-primary hover:underline">
          View all →
        </Link>
      )}
    </div>
  );
}
