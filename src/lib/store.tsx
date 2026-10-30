import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { coupons, getProduct, SHIPPING_FLAT, SHIPPING_FREE_OVER } from "./catalog";

export type CartItem = { slug: string; option?: string | undefined; qty: number };

type Store = {
  cart: CartItem[];
  wishlist: string[];
  coupon: string | null;
  add: (slug: string, qty?: number, option?: string) => void;
  setQty: (slug: string, option: string | undefined, qty: number) => void;
  remove: (slug: string, option?: string) => void;
  toggleWish: (slug: string) => void;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
};

const Ctx = createContext<Store | null>(null);

export function computeTotals(cart: CartItem[], coupon: string | null) {
  const subtotal = cart.reduce((s, i) => s + (getProduct(i.slug)?.price ?? 0) * i.qty, 0);
  const discount = coupon && coupons[coupon] ? Math.round(subtotal * coupons[coupon]) : 0;
  const shipping = subtotal === 0 || subtotal - discount >= SHIPPING_FREE_OVER ? 0 : SHIPPING_FLAT;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("trailforge-store") || "{}");
      setCart(s.cart ?? []);
      setWishlist(s.wishlist ?? []);
      setCoupon(s.coupon ?? null);
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem("trailforge-store", JSON.stringify({ cart, wishlist, coupon }));
  }, [cart, wishlist, coupon, loaded]);

  const same = (i: CartItem, slug: string, option?: string) => i.slug === slug && i.option === option;

  const value: Store = {
    cart, wishlist, coupon,
    add: (slug, qty = 1, option) => {
      const stock = getProduct(slug)?.stock ?? 0;
      setCart((c) => {
        const ex = c.find((i) => same(i, slug, option));
        if (ex) return c.map((i) => (same(i, slug, option) ? { ...i, qty: Math.min(stock, i.qty + qty) } : i));
        return [...c, { slug, option, qty: Math.min(stock, qty) }];
      });
    },
    setQty: (slug, option, qty) => {
      const stock = getProduct(slug)?.stock ?? 0;
      setCart((c) => c.map((i) => (same(i, slug, option) ? { ...i, qty: Math.max(1, Math.min(stock, qty)) } : i)));
    },
    remove: (slug, option) => setCart((c) => c.filter((i) => !same(i, slug, option))),
    toggleWish: (slug) => setWishlist((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug])),
    applyCoupon: (code) => {
      const c = code.trim().toUpperCase();
      if (!coupons[c]) return false;
      setCoupon(c);
      return true;
    },
    clearCoupon: () => setCoupon(null),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
