import { createFileRoute } from "@tanstack/react-router";
import { Stub } from "@/components/Stub";
export const Route = createFileRoute("/lab-reports")({ component: () => <Stub title="Lab Reports" /> });
