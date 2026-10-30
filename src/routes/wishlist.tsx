import { createFileRoute, Link } from "@tanstack/react-router";
import { products } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { PageHeader, ProductCard } from "@/components/site";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — TrailForge" },
      { name: "description", content: "Jeep parts you've saved for your next build." },
      { property: "og:title", content: "Wishlist — TrailForge" },
      { property: "og:description", content: "Jeep parts you've saved for your next build." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist, add } = useStore();
  const items = products.filter((p) => wishlist.includes(p.slug));
  return (
    <>
      <PageHeader title="Wishlist" sub="Parts saved for your next build." />
      <div className="container-page py-10">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold">Nothing saved yet.</p>
            <Link to="/shop" className="btn btn-primary mt-6">Browse parts</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {items.map((p) => (
              <div key={p.slug}>
                <ProductCard p={p} />
                <button className="btn btn-outline mt-3 w-full" disabled={p.stock === 0} onClick={() => add(p.slug, 1, p.options?.values[0])}>
                  {p.stock === 0 ? "Out of stock" : "Add to cart"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
