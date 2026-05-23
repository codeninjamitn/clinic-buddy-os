import { createFileRoute } from "@tanstack/react-router";
import { Stub } from "@/components/Stub";
export const Route = createFileRoute("/billing")({ component: () => <Stub title="Billing" /> });
