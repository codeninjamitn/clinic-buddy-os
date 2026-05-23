import { createFileRoute } from "@tanstack/react-router";
import { Stub } from "@/components/Stub";
export const Route = createFileRoute("/inventory")({ component: () => <Stub title="Inventory" /> });
