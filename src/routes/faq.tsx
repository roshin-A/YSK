import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";

const faqs = [
  ["How do I know a part fits my Jeep?", "Every product lists the models it fits. Filter the shop by your model, or message us with your year and trim."],
  ["How long does shipping take?", "Most orders ship within 1–2 business days and arrive in 3–7 days. Freight items like bumpers may take longer."],
  ["Is shipping free?", "Yes, on orders over $199 after discounts. Otherwise it's a flat $19."],
  ["Can I return a part?", "Uninstalled parts in original packaging can be returned within 30 days."],
  ["Do you offer installation?", "We don't install, but our team provides install guides and phone support."],
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — TrailForge" },
      { name: "description", content: "Answers about fitment, shipping and returns for Jeep parts." },
      { property: "og:title", content: "FAQ — TrailForge" },
      { property: "og:description", content: "Answers about fitment, shipping and returns for Jeep parts." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Frequently asked questions" />
      <div className="container-page max-w-3xl divide-y py-8">
        {faqs.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="cursor-pointer list-none font-semibold group-open:text-primary">{q}</summary>
            <p className="mt-3 text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </>
  ),
});
