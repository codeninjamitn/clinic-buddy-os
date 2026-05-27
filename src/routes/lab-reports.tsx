import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "@/lib/auth";
import { useModals } from "@/lib/modals";
import type { LabReport, LabStatus } from "@/types/database";
import { Upload, FileText, MessageCircle, Download, FlaskConical } from "lucide-react";

export const Route = createFileRoute("/lab-reports")({ component: LabReportsPage });

function badge(s: LabStatus) {
  const map: Record<LabStatus, string> = {
    Pending: "bg-amber-100 text-amber-700",
    Processing: "bg-blue-100 text-blue-700",
    Delivered: "bg-[#E1F5EE] text-primary",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[s]}`}>{s}</span>;
}

function LabReportsPage() {
  const { clinic } = useClinic();
  const { open: openModal, version } = useModals();
  const clinicId = clinic?.id;
  const [drag, setDrag] = useState(false);
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!clinicId) return;
    setLoading(true);
    const { data } = await supabase.from("lab_reports")
      .select("*, patients(name, phone)").eq("clinic_id", clinicId)
      .order("created_at", { ascending: false });
    setReports((data as LabReport[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [clinicId, version]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) openModal("upload-lab-report", { file });
  };

  const pending = reports.filter((r) => r.status !== "Delivered");
  const delivered = reports.filter((r) => r.status === "Delivered");

  return (
    <div className="max-w-[1500px] mx-auto animate-fade-in">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-navy">Lab Reports</h2>
        <p className="text-sm text-muted-foreground">Upload and deliver diagnostic reports</p>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`mb-5 block rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
          drag ? "border-primary bg-[#E1F5EE]" : "border-primary/40 bg-white hover:bg-[#E1F5EE]/40"
        }`}
      >
        <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => e.target.files?.[0] && openModal("upload-lab-report", { file: e.target.files[0] })} />
        <Upload className="w-10 h-10 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-navy">Drop PDF or image here, or click to browse</div>
        <div className="text-xs text-muted-foreground mt-1">Supports PDF, JPG, PNG up to 10 MB</div>
      </label>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-surface">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy">Pending Uploads</h3>
            <span className="text-xs text-muted-foreground">{pending.length} pending</span>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-muted rounded animate-pulse" />)}</div>
          ) : pending.length === 0 ? (
            <EmptyState icon={<FlaskConical />} text="No pending reports." />
          ) : (
            <div className="divide-y divide-border">
              {pending.map((r) => (
                <div key={r.id} className="px-4 py-3 hover:bg-[#E1F5EE]/40 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-navy truncate">{r.patients?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.test_name} · {r.lab_name ?? "—"}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Ordered {r.test_date ? new Date(r.test_date).toLocaleDateString("en-IN") : "—"}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {badge(r.status)}
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
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded animate-pulse" />)
            ) : delivered.length === 0 ? (
              <div className="card-surface"><EmptyState icon={<FileText />} text="No delivered reports yet." /></div>
            ) : delivered.map((r) => (
              <div key={r.id} className="card-surface p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-[#E1F5EE] text-primary flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-navy">{r.patients?.name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.test_name} · {new Date(r.created_at).toLocaleDateString("en-IN")}</div>
                    </div>
                  </div>
                  {badge(r.status)}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => toast.success(`Report sent to ${r.patients?.name} on WhatsApp`)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90">
                    <MessageCircle className="w-3.5 h-3.5" /> Send on WhatsApp
                  </button>
                  <button onClick={async () => {
                    if (!r.file_url) return;
                    const { data, error } = await supabase.storage.from("lab-reports").createSignedUrl(r.file_url, 60);
                    if (error || !data) { toast.error("Could not generate download link"); return; }
                    window.open(data.signedUrl, "_blank", "noreferrer");
                  }} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-navy text-xs font-semibold hover:bg-muted/70">
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
