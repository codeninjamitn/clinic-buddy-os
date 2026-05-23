import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";

function Stub({ title }: { title: string }) {
  return (
    <div className="max-w-[1400px] mx-auto">
      <h2 className="text-2xl font-bold text-navy mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-6">Module preview</p>
      <div className="card-surface p-16 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-4">
          <Construction className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-navy">{title} coming soon</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          This module is part of the ClinicOS roadmap. Dashboard and Patients are fully interactive in this preview.
        </p>
      </div>
    </div>
  );
}

export const stub = (title: string) => () => <Stub title={title} />;
