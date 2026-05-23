import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { labReports, type LabStatus } from "@/lib/mockData2";
import { Upload, FileText, MessageCircle, Download, FlaskConical } from "lucide-react";

export const Route = createFileRoute("/lab-reports")({ component: LabReportsPage });

function badge(s: LabStatus) {
  const map = {
    Pending: "bg-amber-100 text-amber-700",
    Processing: "bg-blue-100 text-blue-700",
    Delivered: "bg-[#E1F5EE] text-primary",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[s]}`}>{s}</span>;
}

function LabReportsPage() {
  const [drag, setDrag] = useState(false);
  const pending = labReports.filter((r) => r.status !== "Delivered");
  const delivered = labReports.filter((r) => r.status === "Delivered");

  return (
    <div className="max-w-[1500px] mx-auto animate-fade-in">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-navy">Lab Reports</h2>
        <p className="text-sm text-muted-foreground">Upload and deliver diagnostic reports</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); toast.success("Report uploaded successfully"); }}
        className={`mb-5 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
          drag ? "border-primary bg-[#E1F5EE]" : "border-primary/40 bg-white hover:bg-[#E1F5EE]/40"
        }`}
      >
        <Upload className="w-10 h-10 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-navy">Drop PDF or image here, or click to browse</div>
        <div className="text-xs text-muted-foreground mt-1">Supports PDF, JPG, PNG up to 10 MB</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-surface">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy">Pending Uploads</h3>
            <span className="text-xs text-muted-foreground">{pending.length} pending</span>
          </div>
          {pending.length === 0 ? (
            <EmptyState icon={<FlaskConical />} text="No pending reports." />
          ) : (
            <div className="divide-y divide-border">
              {pending.map((r) => (
                <div key={r.id} className="px-4 py-3 hover:bg-[#E1F5EE]/40 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-navy truncate">{r.patient}</div>
                      <div className="text-xs text-muted-foreground">{r.test} · {r.lab}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Ordered {r.orderedDate}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {badge(r.status)}
                      <button
                        onClick={() => toast.success(`Upload started for ${r.patient}`)}
                        className="px-3 py-1.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90"
                      >
                        Upload Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="px-1 mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy">Delivered Reports</h3>
            <span className="text-xs text-muted-foreground">{delivered.length} delivered</span>
          </div>
          <div className="space-y-2">
            {delivered.map((r) => (
              <div key={r.id} className="card-surface p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-[#E1F5EE] text-primary flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-navy">{r.patient}</div>
                      <div className="text-xs text-muted-foreground">{r.test} · {r.reportDate}</div>
                    </div>
                  </div>
                  {badge(r.status)}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => toast.success(`Report sent to ${r.patient} on WhatsApp`)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90">
                    <MessageCircle className="w-3.5 h-3.5" /> Send on WhatsApp
                  </button>
                  <button onClick={() => toast.success("Download started")} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-navy text-xs font-semibold hover:bg-muted/70">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="p-10 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-[#E1F5EE] text-primary flex items-center justify-center mb-3 [&_svg]:w-6 [&_svg]:h-6">{icon}</div>
      <div className="text-sm text-muted-foreground">{text}</div>
    </div>
  );
}
