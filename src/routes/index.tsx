import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FORM Portal" },
      { name: "description", content: "FORM employee portal — development, career and time." },
      { property: "og:title", content: "FORM Portal" },
      { property: "og:description", content: "FORM employee portal — development, career and time." },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/me/development" });
  },
});
