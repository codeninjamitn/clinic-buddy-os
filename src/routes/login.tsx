import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/components/LoginScreen";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ClinicOS" },
      { name: "description", content: "Sign in to your ClinicOS dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginScreen,
});
