import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About TrailForge 4x4" },
      { name: "description", content: "Who we are and why we test every Jeep part on the trail." },
      { property: "og:title", content: "About TrailForge 4x4" },
      { property: "og:description", content: "Who we are and why we test every Jeep part on the trail." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="About us" sub="Jeep people, building parts for Jeep people." />
      <div className="container-page max-w-3xl space-y-5 py-12 leading-relaxed text-muted-foreground">
        <p>TrailForge started in a two-bay garage with one goal: sell only parts we'd trust on our own rigs. Every product we carry is installed and wheeled by our team before it hits the store.</p>
        <p>We focus on Wrangler JK, JL and Gladiator JT, so our fitment advice is specific — not generic. Not sure what you need? Our build team answers every message.</p>
      </div>
    </>
  ),
});
