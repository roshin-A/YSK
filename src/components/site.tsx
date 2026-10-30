import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Heart, Search, ShoppingBag, Star, Menu, X, Shield } from "lucide-react";
import { categories, formatPrice, type Product } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function SiteHeader() {
  const { cart, wishlist } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();

  const count = cart.reduce((s, i) => s + i.qty, 0);

  // Shrink the navbar when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    navigate({
      to: "/shop",
      search: { q: q.trim() || undefined },
    });

    setOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-xs" : "bg-background"
        }`}
    >
      {/* Announcement bar */}
      <div
        className={`overflow-hidden bg-ink text-center text-xs font-medium text-ink-foreground transition-all duration-300 ${scrolled ? "max-h-0 py-0 opacity-0 pointer-events-none" : "max-h-12 py-2 opacity-100"
          }`}
      >
        Free shipping on orders over $199 · Use code TRAIL10 for 10% off
      </div>

      {/* Main navbar */}
      <div
        className={`container-page flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-20 md:h-24"
          }`}
      >
        {/* Left: Mobile menu button & YSK Logo */}
        <div className="flex flex-1 items-center justify-start gap-3">
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-secondary transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>

          <Link to="/" className="flex shrink-0 items-center">
            <img
              src="/images/YSK 4X4 Parts & Equipment Logo.png"
              alt="YSK 4X4 Parts & Equipment"
              className={`w-auto object-contain transition-all duration-300 ${scrolled ? "h-8 md:h-9" : "h-12 md:h-14"
                }`}
            />
          </Link>
        </div>

        {/* Center: Desktop navigation — Centers dynamically on scroll with sleek pill style */}
        <nav
          className={`hidden md:flex shrink-0 items-center justify-center transition-all duration-300 ${scrolled
              ? "mx-auto gap-6 lg:gap-8 px-6 py-1.5 rounded-full bg-secondary/80 backdrop-blur-md border border-border/80 shadow-xs text-sm font-semibold"
              : "mx-auto gap-7 lg:gap-9 text-base font-semibold"
            }`}
        >
          <Link
            to="/shop"
            className="hover:text-primary transition-colors"
            activeProps={{ className: "text-primary font-bold" }}
          >
            Shop all
          </Link>

          <Link
            to="/shop"
            search={{ category: "suspension" }}
            className="hover:text-primary transition-colors"
          >
            Suspension
          </Link>

          <Link
            to="/shop"
            search={{ category: "armor" }}
            className="hover:text-primary transition-colors"
          >
            Armor
          </Link>

          <Link
            to="/shop"
            search={{ category: "wheels" }}
            className="hover:text-primary transition-colors"
          >
            Wheels
          </Link>

          <Link
            to="/deals"
            className="hover:text-primary transition-colors"
            activeProps={{ className: "text-primary font-bold" }}
          >
            Deals
          </Link>
        </nav>

        {/* Right: Desktop search + Wishlist + Cart */}
        <div className="flex flex-1 items-center justify-end gap-3 lg:gap-4">
          <form
            onSubmit={submit}
            className={`hidden md:block transition-all duration-300 ${scrolled ? "w-36 lg:w-44" : "w-44 lg:w-56"
              }`}
            role="search"
          >
            <label className="relative block">
              <span className="sr-only">Search parts</span>
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search parts…"
                className={`field pl-8.5 py-1 text-xs lg:text-sm bg-background/80 transition-all ${scrolled ? "h-8" : "h-9"
                  }`}
              />
            </label>
          </form>

          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative p-2 rounded-full hover:bg-secondary transition-colors text-foreground hover:text-primary"
          >
            <Heart className="size-5" />
            {wishlist.length > 0 && <Badge n={wishlist.length} />}
          </Link>

          <Link
            to="/cart"
            aria-label="Cart"
            className="relative p-2 rounded-full hover:bg-secondary transition-colors text-foreground hover:text-primary"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && <Badge n={count} />}
          </Link>

          {/* Admin Access Icon */}
          <Link
            to="/admin"
            aria-label="Admin Dashboard"
            title="Admin Dashboard"
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <Shield className="size-4" />
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="container-page space-y-3 border-t py-4 md:hidden">

          {/* Mobile search */}
          <form onSubmit={submit}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search parts…"
              className="field"
            />
          </form>

          {/* Product categories */}
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              onClick={() => setOpen(false)}
              className="block text-sm font-medium"
            >
              {c.name}
            </Link>
          ))}

          <Link
            to="/deals"
            onClick={() => setOpen(false)}
            className="block text-sm font-medium text-primary"
          >
            Deals
          </Link>
        </div>
      )}
    </header>
  );
}

// Cart and wishlist count badge
function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -top-2 -right-2 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
      {n}
    </span>
  );
}

// Website footer
export function SiteFooter() {
  const [done, setDone] = useState(false);

  return (
    <footer className="mt-24 border-t bg-muted">
      <div className="container-page grid gap-10 py-14 md:grid-cols-5">

        {/* Brand and newsletter */}
        <div className="md:col-span-2">
          <Link to="/" className="inline-flex items-center">
            <img
              src="/images/YSK 4X4 Parts & Equipment Logo.png"
              alt="YSK 4X4 Parts & Equipment"
              className="h-12 w-auto object-contain"
            />
          </Link>

          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Quality 4x4 parts and equipment for your next off-road adventure.
          </p>

          <form
            className="mt-6 flex max-w-sm gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <input
              type="email"
              required
              placeholder="Your email"
              aria-label="Email"
              className="field"
            />

            <button type="submit" className="btn btn-primary">
              Join
            </button>
          </form>

          {done && (
            <p className="mt-2 text-sm text-success">
              Thanks — you're on the list.
            </p>
          )}
        </div>

        <FooterCol
          title="Shop"
          links={[
            ["/shop", "All parts"],
            ["/deals", "Deals"],
            ["/wishlist", "Wishlist"],
            ["/cart", "Cart"],
          ]}
        />

        <FooterCol
          title="Help"
          links={[
            ["/faq", "FAQ"],
            ["/contact", "Contact"],
            ["/policies/shipping", "Shipping"],
            ["/policies/returns", "Returns"],
          ]}
        />

        <FooterCol
          title="Company"
          links={[
            ["/about", "About"],
            ["/policies/privacy", "Privacy"],
            ["/policies/terms", "Terms"],
          ]}
        />
      </div>

      <div className="container-page border-t py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} YSK 4X4 Parts & Equipment. All rights reserved.
      </div>
    </footer>
  );
}

// Footer link column
function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>

      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Product rating stars
export function Stars({
  rating,
  reviews,
}: {
  rating: number;
  reviews?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="size-3.5 fill-primary text-primary" />

      <span className="font-semibold text-foreground">
        {rating.toFixed(1)}
      </span>

      {reviews !== undefined && <span>({reviews})</span>}
    </span>
  );
}

// Product card
export function ProductCard({ p }: { p: Product }) {
  const { wishlist, toggleWish } = useStore();

  const wished = wishlist.includes(p.slug);

  const off = p.compareAt
    ? Math.round((1 - p.price / p.compareAt) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col rounded-xl border border-border/75 bg-card p-3 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-card">
      {/* Product image */}
      <Link
        to="/products/$slug"
        params={{ slug: p.slug }}
        className="relative block aspect-square overflow-hidden rounded-lg bg-muted"
      >
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          width={816}
          height={816}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // If the image URL fails to load, fall back to a placeholder
            const t = e.currentTarget;
            t.onerror = null; // prevent infinite loop
            t.src = `https://placehold.co/816x816/e2e8f0/94a3b8?text=${encodeURIComponent(p.name)}`;
          }}
        />

        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
          {p.offer ? (
            <span className="rounded bg-sale px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow-xs">
              {p.offer}
            </span>
          ) : off > 0 ? (
            <span className="rounded bg-sale px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow-xs">
              -{off}%
            </span>
          ) : null}

          {p.isNew && (
            <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground shadow-xs">
              New
            </span>
          )}

          {p.stock === 0 && (
            <span className="rounded bg-ink px-2 py-0.5 text-[11px] font-bold text-ink-foreground shadow-xs">
              Sold out
            </span>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        type="button"
        onClick={() => toggleWish(p.slug)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-5 right-5 grid size-8 place-items-center rounded-full bg-background/90 backdrop-blur-xs shadow-card hover:bg-background transition-transform active:scale-95"
      >
        <Heart
          className={`size-4 transition-colors ${wished ? "fill-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
        />
      </button>

      {/* Product details */}
      <div className="mt-3 flex flex-1 flex-col justify-between space-y-1">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {p.brand}
          </p>

          <Link
            to="/products/$slug"
            params={{ slug: p.slug }}
            className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold hover:text-primary transition-colors leading-snug"
          >
            {p.name}
          </Link>
        </div>

        <div>
          <Stars rating={p.rating} reviews={p.reviews} />

          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-sm md:text-base">
              <span className="font-extrabold text-foreground">
                {formatPrice(p.price)}
              </span>

              {p.compareAt && (
                <span className="ml-2 text-xs text-muted-foreground line-through">
                  {formatPrice(p.compareAt)}
                </span>
              )}
            </p>

            {p.stock > 0 && p.stock <= 5 && (
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                Only {p.stock} left
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Page heading
export function PageHeader({
  title,
  sub,
}: {
  title: string;
  sub?: string;
}) {
  return (
    <div className="border-b bg-muted">
      <div className="container-page py-12">
        <h1 className="text-3xl font-extrabold md:text-4xl">
          {title}
        </h1>

        {sub && (
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
