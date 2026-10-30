import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  CreditCard,
  Truck,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Tag,
  ArrowLeft,
  RotateCcw,
  Check,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice, getProduct, SHIPPING_FREE_OVER } from "@/lib/catalog";
import { computeTotals, useStore } from "@/lib/store";
import { ProductCard } from "@/components/site";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { useExcelProducts } from "@/hooks/useExcelProducts";
import {
  createWhatsAppUrl,
  buildCartWhatsAppText,
  buildProductWhatsAppText,
} from "@/lib/whatsapp";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart — YSK 4X4 Parts & Equipment" },
      { name: "description", content: "Review and order your 4x4 parts and equipment." },
      { property: "og:title", content: "Shopping Cart — YSK 4X4 Parts & Equipment" },
      { property: "og:description", content: "Review and order your 4x4 parts and equipment." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, setQty, remove, coupon, applyCoupon, clearCoupon, add } = useStore();
  const [code, setCode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    paymentMethod: "cod",
  });

  const t = computeTotals(cart, coupon);
  const { whatsappNumber } = useStoreInfo();
  const { products: allCatalogProducts } = useExcelProducts();

  // Calculate free shipping milestone
  const netAmount = Math.max(0, t.subtotal - t.discount);
  const freeShippingThreshold = SHIPPING_FREE_OVER;
  const freeShippingUnlocked = netAmount >= freeShippingThreshold;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - netAmount);
  const shippingProgress = Math.min(100, Math.round((netAmount / freeShippingThreshold) * 100));

  // Recommended products (exclude items already in cart)
  const cartSlugs = new Set(cart.map((c) => c.slug));
  const recommendedProducts = allCatalogProducts
    .filter((p) => !cartSlugs.has(p.slug))
    .slice(0, 4);

  const cartWhatsAppUrl = createWhatsAppUrl(
    whatsappNumber,
    buildCartWhatsAppText({
      items: cart.map((i) => {
        const p = getProduct(i.slug);
        return {
          name: p ? p.name : i.slug,
          qty: i.qty,
          price: p ? p.price : 0,
          option: i.option,
          image: p ? p.image : "",
        };
      }),
      total: t.total,
    })
  );

  const confirmedWhatsAppUrl = completedOrder
    ? createWhatsAppUrl(
        whatsappNumber,
        buildCartWhatsAppText({
          orderId: completedOrder.id,
          items: completedOrder.items || [],
          total: completedOrder.total,
          customer: completedOrder.customer,
        })
      )
    : "";

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.address.trim()) {
      toast.error("Please fill in required fields (Name, Email, Address)");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: cart.map((i) => {
            const p = getProduct(i.slug);
            return {
              slug: i.slug,
              name: p ? p.name : i.slug,
              price: p ? p.price : 0,
              qty: i.qty,
              option: i.option,
              image: p ? p.image : "",
            };
          }),
          subtotal: t.subtotal,
          discount: t.discount,
          shipping: t.shipping,
          total: t.total,
          paymentMethod: form.paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order");
      }

      // Clear the cart
      cart.forEach((i) => remove(i.slug, i.option));
      setCompletedOrder(data.order);
      setIsCheckingOut(false);
      toast.success("Order Placed Successfully!", {
        description: `Order ID: ${data.orderId}`,
      });
    } catch (err: any) {
      toast.error("Order Failed", {
        description: err.message || "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Confirmed Screen
  if (completedOrder) {
    return (
      <div className="min-h-[75vh] py-14">
        <div className="container-page max-w-2xl text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="size-10" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">
            <Check className="size-3.5" /> Order Placed Successfully
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            Thank You for Your Order!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We have received your order and our 4x4 parts team is preparing it for shipment.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border bg-card text-left shadow-card">
            <div className="flex flex-wrap items-center justify-between border-b bg-muted/40 p-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Order Reference
                </p>
                <p className="font-mono text-lg font-bold text-primary">{completedOrder.id}</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                Payment: {completedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Card / UPI"}
              </span>
            </div>

            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient Name:</span>
                <span className="font-semibold text-foreground">{completedOrder.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{completedOrder.customer.email}</span>
              </div>
              {completedOrder.customer.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium text-foreground">{completedOrder.customer.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Address:</span>
                <span className="font-medium text-foreground text-right max-w-xs">
                  {completedOrder.customer.address}, {completedOrder.customer.city} {completedOrder.customer.state}
                </span>
              </div>
              <div className="flex justify-between border-t pt-4 font-bold text-lg">
                <span>Total Amount:</span>
                <span className="text-primary">{formatPrice(completedOrder.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={confirmedWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] px-7 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="size-5" />
              <span>Send Order to WhatsApp</span>
            </a>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-bold hover:bg-secondary transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Modern Empty Cart Screen
  if (cart.length === 0) {
    return (
      <div className="min-h-[75vh]">
        {/* Header Banner */}
        <div className="border-b bg-gradient-to-b from-muted/80 to-background py-10">
          <div className="container-page text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">YSK 4X4 Garage</span>
            <h1 className="mt-1 text-3xl md:text-4xl font-extrabold tracking-tight">Your Cart</h1>
          </div>
        </div>

        <div className="container-page py-16">
          <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-border/80 bg-card/60 p-8 md:p-12 text-center shadow-xs backdrop-blur-xs">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-8 ring-primary/5">
              <ShoppingBag className="size-10" />
            </div>

            <h2 className="mt-6 text-2xl md:text-3xl font-extrabold text-foreground">
              Your 4X4 Rig is Waiting for Upgrades
            </h2>
            <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Your shopping cart is currently empty. Explore heavy-duty suspensions, winches,
              recovery kits, and off-road accessories engineered for extreme adventures.
            </p>

            {/* Quick Category Badges */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                { name: "Suspension", slug: "suspension" },
                { name: "Recovery & Winches", slug: "recovery" },
                { name: "Lighting & Electrical", slug: "lighting" },
                { name: "Armor & Protection", slug: "armor" },
                { name: "Wheels & Tires", slug: "wheels" },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  to="/shop"
                  search={{ category: cat.slug }}
                  className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/shop"
                className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 font-bold"
              >
                <span>Explore All 4x4 Parts</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/deals"
                className="btn btn-outline inline-flex items-center gap-2 px-6 py-3 font-semibold"
              >
                <Tag className="size-4 text-primary" />
                <span>View Hot Deals</span>
              </Link>
            </div>
          </div>

          {/* Recommended products when cart is empty */}
          {recommendedProducts.length > 0 && (
            <div className="mt-20">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold md:text-2xl">Trending Gear for Your Rig</h3>
                  <p className="text-xs text-muted-foreground">High-performance upgrades chosen by off-roaders</p>
                </div>
                <Link to="/shop" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  View full catalog <ArrowRight className="size-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {recommendedProducts.map((p) => (
                  <ProductCard key={p.slug} p={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const totalItemsCount = cart.reduce((s, i) => s + i.qty, 0);

  // Active Cart View
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Banner / Progress Indicator */}
      <div className="border-b bg-gradient-to-b from-muted/60 via-muted/30 to-background py-8">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <ShoppingBag className="size-3.5" />
                <span>YSK 4X4 Checkout Queue</span>
              </div>
              <h1 className="mt-1 text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Review Your Equipment ({totalItemsCount} {totalItemsCount === 1 ? "item" : "items"})
              </h1>
            </div>

            {/* Step navigation indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-2 font-bold text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
                <span className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-extrabold">
                  1
                </span>
                Review Cart
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="flex items-center gap-2 font-medium text-muted-foreground px-2 py-1">
                <span className="size-5 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center text-[10px]">
                  2
                </span>
                WhatsApp / Order
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="flex items-center gap-2 font-medium text-muted-foreground px-2 py-1">
                <span className="size-5 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center text-[10px]">
                  3
                </span>
                Fast Dispatch
              </span>
            </div>
          </div>

          {/* Free Shipping Progress Milestone Bar */}
          <div className="mt-6 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-2 text-foreground">
                <Truck className="size-4 text-primary" />
                {freeShippingUnlocked ? (
                  <span className="text-emerald-600 font-bold">
                    🎉 You've unlocked FREE Freight Delivery on this order!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-primary font-bold">{formatPrice(freeShippingRemaining)}</strong> more to unlock <strong className="text-foreground">FREE Freight Delivery</strong>
                  </span>
                )}
              </span>
              <span className="text-muted-foreground">{shippingProgress}%</span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  freeShippingUnlocked ? "bg-emerald-500" : "bg-primary"
                }`}
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Cart Grid */}
      <div className="container-page mt-8 grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
        {/* Left Column: Cart Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Equipment Details
            </p>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear your cart?")) {
                  cart.forEach((i) => remove(i.slug, i.option));
                  toast.info("Cart cleared");
                }
              }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium cursor-pointer"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-3">
            {cart.map((i) => {
              const p = getProduct(i.slug);
              if (!p) return null;

              const singleItemWhatsAppUrl = createWhatsAppUrl(
                whatsappNumber,
                buildProductWhatsAppText(
                  {
                    name: p.name,
                    price: p.price,
                    slug: p.slug,
                    brand: p.brand,
                    fits: p.fits,
                    image: p.image,
                  },
                  i.qty,
                  i.option
                )
              );

              return (
                <div
                  key={i.slug + (i.option || "")}
                  className="group relative flex flex-col sm:flex-row gap-4 sm:gap-5 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs hover:border-primary/40 hover:shadow-card transition-all"
                >
                  {/* Product Thumbnail */}
                  <Link
                    to="/products/$slug"
                    params={{ slug: p.slug }}
                    className="relative shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted size-24 sm:size-28"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      width={112}
                      height={112}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const t = e.currentTarget;
                        t.onerror = null;
                        t.src = `https://placehold.co/200x200/e2e8f0/94a3b8?text=${encodeURIComponent(p.name)}`;
                      }}
                    />
                  </Link>

                  {/* Info & Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
                            {p.brand}
                          </p>
                          <Link
                            to="/products/$slug"
                            params={{ slug: p.slug }}
                            className="font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors line-clamp-2"
                          >
                            {p.name}
                          </Link>
                        </div>

                        {/* Row Price (Desktop) */}
                        <div className="text-right shrink-0 hidden sm:block">
                          <p className="text-lg font-extrabold text-foreground">
                            {formatPrice(p.price * i.qty)}
                          </p>
                          {i.qty > 1 && (
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(p.price)} each
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Options / Fitment */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                        {i.option && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground border border-border/60">
                            {p.options?.label || "Spec"}: <strong>{i.option}</strong>
                          </span>
                        )}
                        {p.fits && p.fits.length > 0 && (
                          <span className="text-muted-foreground text-[11px]">
                            Fits: {p.fits.slice(0, 2).join(", ")}
                            {p.fits.length > 2 ? ` +${p.fits.length - 2} more` : ""}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="mt-2 flex items-center gap-2">
                        {p.stock > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            In Stock · Ready to Dispatch
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-destructive">
                            Out of stock
                          </span>
                        )}
                        {p.stock > 0 && p.stock < i.qty && (
                          <span className="text-[11px] font-semibold text-destructive">
                            (Only {p.stock} available in warehouse)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Controls & Sub-actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-xl border border-border bg-background shadow-xs">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-l-xl transition-colors disabled:opacity-30"
                          onClick={() => setQty(i.slug, i.option, i.qty - 1)}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-9 text-center text-xs font-bold text-foreground">
                          {i.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-r-xl transition-colors disabled:opacity-30"
                          disabled={p.stock <= i.qty}
                          onClick={() => setQty(i.slug, i.option, i.qty + 1)}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      {/* Mobile Price */}
                      <div className="sm:hidden text-right">
                        <span className="text-base font-extrabold text-foreground">
                          {formatPrice(p.price * i.qty)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Quick single-item WhatsApp Order */}
                        <a
                          href={singleItemWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                          title="Ask or order just this item on WhatsApp"
                        >
                          <MessageCircle className="size-3.5" />
                          <span>Inquire on WhatsApp</span>
                        </a>

                        {/* Remove item */}
                        <button
                          type="button"
                          onClick={() => {
                            remove(i.slug, i.option);
                            toast.info("Removed from cart", { description: p.name });
                          }}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="size-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Shopping Link */}
          <div className="pt-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              <span>Add more parts to your build</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & WhatsApp Direct Action */}
        <div className="space-y-6">
          <aside className="sticky top-28 rounded-3xl border border-border/80 bg-card p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Order Summary
              </h2>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-foreground">
                {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Coupon Code Section */}
            {coupon ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 text-xs text-emerald-700">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Tag className="size-3.5" />
                  Code <strong>{coupon}</strong> applied!
                </span>
                <button
                  onClick={clearCoupon}
                  className="font-bold hover:underline text-destructive text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (applyCoupon(code)) {
                    toast.success("Promo code applied!");
                  } else {
                    toast.error("Invalid promo code");
                  }
                }}
              >
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Coupon code (e.g. TRAIL10)"
                    className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs font-medium focus:border-primary focus:outline-none"
                    aria-label="Coupon code"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {/* Price Calculations */}
            <dl className="space-y-2.5 text-sm">
              <Row k="Subtotal" v={formatPrice(t.subtotal)} />
              {t.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold text-sm">
                  <dt>Promo Discount</dt>
                  <dd>−{formatPrice(t.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <dt className="text-muted-foreground">Freight Shipping</dt>
                <dd className="font-semibold">
                  {t.shipping === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-xs bg-emerald-500/10 px-2 py-0.5 rounded">
                      Free Shipping
                    </span>
                  ) : (
                    formatPrice(t.shipping)
                  )}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-lg font-extrabold text-foreground">
                <dt>Estimated Total</dt>
                <dd className="text-primary text-xl font-black">{formatPrice(t.total)}</dd>
              </div>
            </dl>

            {/* Primary Action: Direct WhatsApp Order */}
            <div className="space-y-2.5 pt-2">
              <a
                href={cartWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex w-full flex-col items-center justify-center gap-1 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] p-4 text-white shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex items-center gap-2 font-black text-base">
                  <MessageCircle className="size-5" />
                  <span>Order on WhatsApp ({formatPrice(t.total)})</span>
                </div>
                <span className="text-[11px] font-medium text-white/90">
                  ⚡ Instant order · Fast dispatch · Direct vehicle support
                </span>
              </a>

              {/* Secondary Action: Standard Web Checkout */}
              <button
                type="button"
                className="w-full rounded-xl border border-border bg-background py-2.5 text-xs font-bold text-foreground hover:bg-secondary transition-colors cursor-pointer"
                onClick={() => setIsCheckingOut(true)}
              >
                Or Checkout with Form (Cash on Delivery / Card)
              </button>
            </div>

            {/* Trust and Assurance Badges */}
            <div className="rounded-2xl bg-secondary/50 p-4 space-y-2.5 text-xs text-muted-foreground border border-border/50">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span className="font-medium text-foreground">
                  100% Fitment Guarantee for specified models
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="size-4 text-primary shrink-0" />
                <span>Heavy-duty freight dispatch with tracking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="size-4 text-primary shrink-0" />
                <span>30-day hassle-free returns on uninstalled parts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="size-4 text-primary shrink-0" />
                <span>Real 4x4 off-road specialists ready to answer questions</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Recommended 4x4 Upgrades Grid */}
      {recommendedProducts.length > 0 && (
        <div className="container-page mt-20 border-t pt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Popular Upgrades
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Frequently Added by 4x4 Drivers
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Browse entire catalog <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </div>
      )}

      {/* Website Checkout Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold">Standard Website Checkout</h3>
                <p className="text-xs text-muted-foreground">
                  Enter your delivery contact details below
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Full Name *</label>
                <input
                  required
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-foreground">Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Phone Number</label>
                  <input
                    placeholder="+91 90000 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Street Address *</label>
                <input
                  required
                  placeholder="Street / Building / House number"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">City</label>
                  <input
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">State</label>
                  <input
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">Postal Code</label>
                  <input
                    placeholder="ZIP / PIN"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Payment Method</label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-colors ${
                      form.paymentMethod === "cod"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={form.paymentMethod === "cod"}
                      onChange={() => setForm({ ...form, paymentMethod: "cod" })}
                      className="sr-only"
                    />
                    <Truck className="size-4" />
                    Cash on Delivery
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-colors ${
                      form.paymentMethod === "card"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={form.paymentMethod === "card"}
                      onChange={() => setForm({ ...form, paymentMethod: "card" })}
                      className="sr-only"
                    />
                    <CreditCard className="size-4" />
                    Credit Card / UPI
                  </label>
                </div>
              </div>

              <div className="rounded-xl bg-secondary/60 p-3.5 text-xs space-y-1.5 border border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items total ({totalItemsCount} items):</span>
                  <span>{formatPrice(t.subtotal)}</span>
                </div>
                {t.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span>−{formatPrice(t.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping:</span>
                  <span>{t.shipping === 0 ? "Free" : formatPrice(t.shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
                  <span>Order Total:</span>
                  <span className="text-primary font-black">{formatPrice(t.total)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="rounded-xl border px-4 py-2.5 text-xs font-semibold hover:bg-secondary cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Confirm & Place Order ({formatPrice(t.total)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-foreground">{v}</dd>
    </div>
  );
}
