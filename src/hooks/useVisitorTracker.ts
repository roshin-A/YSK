import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

export function useVisitorTracker() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  useEffect(() => {
    // Only track non-admin public website pages
    if (pathname.startsWith("/admin")) return;

    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: pathname }),
      }).catch(() => {});
    } catch {}
  }, [pathname]);
}

