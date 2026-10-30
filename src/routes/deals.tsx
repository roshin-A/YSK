import { createFileRoute } from "@tanstack/react-router";
import { coupons } from "@/lib/catalog";
import { PageHeader, ProductCard } from "@/components/site";
import { useExcelProducts } from "@/hooks/useExcelProducts";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Deals on 4x4 Parts — YSK 4X4" },
      { name: "description", content: "Current sales and promotional offers on 4x4 off-road parts." },
      { property: "og:title", content: "Deals on 4x4 Parts — YSK 4X4" },
      { property: "og:description", content: "Current sales and promotional offers on 4x4 off-road parts." },
    ],
  }),
  component: Deals,
});

function Deals() {
  const { products: excelProducts } = useExcelProducts();
  const activeProducts = excelProducts;
  const sale = activeProducts.filter((p) => p.compareAt && p.compareAt > p.price);

  return (
    <>
      <PageHeader title="Deals & offers" sub="Limited-time pricing on trail-proven gear direct from catalog." />
      <div className="container-page py-10">
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(coupons).map(([code, pct]) => (
            <div key={code} className="flex items-center justify-between rounded-lg border border-dashed border-primary bg-accent p-5">
              <div>
                <p className="font-display text-xl font-extrabold text-accent-foreground">{Math.round(pct * 100)}% off</p>
                <p className="text-sm text-muted-foreground">Sitewide, applied at cart</p>
              </div>
              <code className="rounded bg-background px-3 py-1.5 font-bold">{code}</code>
            </div>
          ))}
        </div>
        <h2 className="mt-14 mb-6 text-2xl font-extrabold">On sale now</h2>
        {sale.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {sale.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground text-sm">
            No sale items currently in the catalog.
          </div>
        )}
      </div>
    </>
  );
}
