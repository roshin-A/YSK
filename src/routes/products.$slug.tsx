import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Heart, Minus, Plus, Truck, ShieldCheck, RotateCcw, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, getCategory, getProduct, products } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { ProductCard, Stars } from "@/components/site";
import { useExcelProducts } from "@/hooks/useExcelProducts";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { createWhatsAppUrl, buildProductWhatsAppText } from "@/lib/whatsapp";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — TrailForge` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — TrailForge` },
          { property: "og:description", content: loaderData.product.description },
        ]
      : [{ title: "Part unavailable — TrailForge" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold">Part not found</h1>
      <Link to="/shop" className="btn btn-primary mt-6">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const { add, toggleWish, wishlist } = useStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [option, setOption] = useState(p.options?.values[0]);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  // Multi-image support
  const allImages = (p.images && p.images.length > 0)
    ? p.images
    : [p.image, p.image2, p.image3].filter(Boolean) as string[];
  const [activeImage, setActiveImage] = useState<string>(p.image || allImages[0] || "");

  // Update active image when product changes
  useEffect(() => {
    setActiveImage(p.image || allImages[0] || "");
  }, [p.slug, p.image]);

  // Track product view in analytics
  useEffect(() => {
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: `/products/${p.slug}`,
          productId: p.slug,
          productName: p.name,
          category: p.category,
        }),
      }).catch(() => {});
    } catch {}
  }, [p.slug]);

  const cat = getCategory(p.category);
  const { products: liveProducts } = useExcelProducts();
  const { whatsappNumber } = useStoreInfo();
  const activeCatalog = liveProducts.length > 0 ? liveProducts : products;
  const related = activeCatalog.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4);
  const soldOut = p.stock === 0;
  const eta = new Date(Date.now() + 5 * 864e5).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const whatsappUrl = createWhatsAppUrl(
    whatsappNumber,
    buildProductWhatsAppText({ ...p, image: activeImage || p.image }, qty, option)
  );

  const addToCart = (go?: boolean) => {
    add(p.slug, qty, option);
    if (go) navigate({ to: "/cart" });
    else toast.success("Added to cart", { description: p.name });
  };

  return (
    <div className="container-page py-8">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary">Home</Link> / <Link to="/shop" search={{ category: p.category }} className="hover:text-primary">{cat?.name}</Link> / <span className="text-foreground">{p.name}</span>
      </nav>
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-4">
          <div
            className="relative aspect-square cursor-zoom-in overflow-hidden rounded-xl border bg-muted"
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
            onMouseLeave={() => setZoom(null)}
          >
            <img
              src={activeImage || p.image}
              alt={p.name}
              width={816}
              height={816}
              className="size-full object-cover transition-transform duration-200"
              style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </div>

          {/* Multiple image gallery thumbnails */}
          {allImages.length > 1 && (
            <div className="flex flex-wrap gap-2.5">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`size-18 overflow-hidden rounded-lg border-2 transition-all ${
                    activeImage === img
                      ? "border-primary shadow-xs ring-2 ring-primary/20"
                      : "border-border hover:border-foreground/40 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`${p.name} view ${idx + 1}`} className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{p.brand}</p>
          <h1 className="mt-2 text-3xl font-extrabold">{p.name}</h1>
          <div className="mt-3"><Stars rating={p.rating} reviews={p.reviews} /></div>
          <p className="mt-5 text-2xl font-bold">
            {formatPrice(p.price)}
            {p.compareAt && <><span className="ml-3 text-lg font-normal text-muted-foreground line-through">{formatPrice(p.compareAt)}</span><span className="ml-3 text-base text-sale">Save {formatPrice(p.compareAt - p.price)}</span></>}
          </p>
          <p className="mt-5 leading-relaxed text-muted-foreground">{p.description}</p>
          <p className="mt-4 text-sm"><span className="font-semibold">Fits:</span> {p.fits.join(", ")}</p>

          {p.options && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">{p.options.label}: <span className="font-normal">{option}</span></p>
              <div className="flex flex-wrap gap-2">
                {p.options.values.map((v) => (
                  <button key={v} onClick={() => setOption(v)} className={`rounded-md border px-4 py-2 text-sm ${option === v ? "border-primary bg-accent font-semibold text-accent-foreground" : "hover:border-foreground"}`}>{v}</button>
                ))}
              </div>
            </div>
          )}

          <p className={`mt-6 text-sm font-semibold ${soldOut ? "text-destructive" : p.stock < 5 ? "text-sale" : "text-success"}`}>
            {soldOut ? "Out of stock" : p.stock < 5 ? `Only ${p.stock} left` : "In stock — ready to ship"}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center rounded-md border">
              <button aria-label="Decrease quantity" className="p-3" onClick={() => setQty(Math.max(1, qty - 1))} disabled={soldOut}><Minus className="size-4" /></button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <button aria-label="Increase quantity" className="p-3" onClick={() => setQty(Math.min(p.stock, qty + 1))} disabled={soldOut}><Plus className="size-4" /></button>
            </div>

            {/* Direct WhatsApp Order — Primary Action with Item Details & Image */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold shadow-xs transition-transform hover:-translate-y-0.5 text-sm cursor-pointer ${
                soldOut ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <MessageCircle className="size-5" />
              <span>Order on WhatsApp</span>
            </a>

            <button className="btn btn-outline" disabled={soldOut} onClick={() => addToCart()} title="Add to Cart">
              Add to cart
            </button>
            <button className="btn btn-outline" aria-label="Wishlist" onClick={() => toggleWish(p.slug)}>
              <Heart className={`size-4 ${wishlist.includes(p.slug) ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
          <ul className="mt-8 space-y-3 rounded-lg border p-5 text-sm">
            <li className="flex gap-3"><Truck className="size-5 text-primary" />Estimated delivery by {eta}. Free over $199.</li>
            <li className="flex gap-3"><RotateCcw className="size-5 text-primary" />30-day returns on uninstalled parts.</li>
            <li className="flex gap-3"><ShieldCheck className="size-5 text-primary" />Fitment guaranteed for listed models.</li>
          </ul>
          <h2 className="mt-10 text-lg font-bold">Specifications</h2>
          <dl className="mt-3 divide-y rounded-lg border text-sm">
            {Object.entries(p.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
            ))}
          </dl>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-extrabold">You may also need</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{related.map((r) => <ProductCard key={r.slug} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
