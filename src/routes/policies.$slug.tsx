import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";

const policies: Record<string, { title: string; body: string[] }> = {
  shipping: { title: "Shipping & delivery", body: ["Orders ship within 1–2 business days from our warehouse.", "Free standard shipping on orders over $199 after discounts; otherwise a flat $19.", "Oversized items (bumpers, wheels, tires) may ship by freight and take 5–10 business days."] },
  returns: { title: "Returns & refunds", body: ["Return uninstalled parts in original packaging within 30 days for a full refund.", "Installed or modified parts can't be returned unless defective.", "Refunds are issued to the original payment method within 5 business days of receipt."] },
  privacy: { title: "Privacy policy", body: ["We collect only the information needed to process orders and support requests.", "We never sell your personal data.", "Your cart and wishlist are stored in your browser."] },
  terms: { title: "Terms & conditions", body: ["Prices and availability may change without notice.", "Off-road modifications may affect your vehicle warranty and street legality; check local laws.", "Jeep® is a registered trademark of FCA US LLC. TrailForge is not affiliated with Jeep or Stellantis."] },
};

export const Route = createFileRoute("/policies/$slug")({
  loader: ({ params }) => {
    const policy = policies[params.slug];
    if (!policy) throw notFound();
    return policy;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — TrailForge` },
          { name: "description", content: loaderData.body[0] },
          { property: "og:title", content: `${loaderData.title} — TrailForge` },
          { property: "og:description", content: loaderData.body[0] },
        ]
      : [{ title: "Unavailable — TrailForge" }, { name: "robots", content: "noindex" }],
  }),
  component: Policy,
});

function Policy() {
  const p = Route.useLoaderData();
  return (
    <>
      <PageHeader title={p.title} />
      <div className="container-page max-w-3xl space-y-4 py-12 leading-relaxed text-muted-foreground">
        {p.body.map((b) => <p key={b}>{b}</p>)}
      </div>
    </>
  );
}
