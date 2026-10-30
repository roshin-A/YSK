import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PageHeader } from "@/components/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — TrailForge" },
      { name: "description", content: "Get fitment help or order support from the TrailForge team." },
      { property: "og:title", content: "Contact — TrailForge" },
      { property: "og:description", content: "Get fitment help or order support from the TrailForge team." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters)").max(1000),
});

function Contact() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const r = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!r.success) { setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message]))); return; }
    setErrors({}); setSent(true);
  };
  return (
    <>
      <PageHeader title="Contact us" sub="Fitment questions, order help — we reply within one business day." />
      <div className="container-page max-w-xl py-12">
        {sent ? <p className="rounded-lg bg-accent p-6 text-accent-foreground">Thanks! Your message is noted. (Message delivery isn't connected yet.)</p> : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            {(["name", "email"] as const).map((f) => (
              <div key={f}>
                <label className="mb-1 block text-sm font-medium capitalize" htmlFor={f}>{f}</label>
                <input id={f} name={f} type={f === "email" ? "email" : "text"} className="field" />
                {errors[f] && <p className="mt-1 text-sm text-destructive">{errors[f]}</p>}
              </div>
            ))}
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} className="field" placeholder="Year, model and what you're building…" />
              {errors["message"] && <p className="mt-1 text-sm text-destructive">{errors["message"]}</p>}
            </div>
            <button className="btn btn-primary">Send message</button>
          </form>
        )}
      </div>
    </>
  );
}
