import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, MapPin, Check, X, Inbox } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saCard, saChip } from "./tokens";
import type { Database } from "@/integrations/supabase/types";

type Request = Database["public"]["Tables"]["clinic_signup_requests"]["Row"];

export function SignupRequestsPage({ onLaunch }: { onLaunch: (r: Request) => void }) {
  const [rows, setRows] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "done" | "rejected">("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clinic_signup_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("clinic_signup_requests")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Marked as ${status}`);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    const { error } = await supabase.from("clinic_signup_requests").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const counts = {
    all: rows.length,
    new: rows.filter((r) => r.status === "new").length,
    contacted: rows.filter((r) => r.status === "contacted").length,
    done: rows.filter((r) => r.status === "done").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };

  const tabs: { key: typeof filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "contacted", label: "Contacted" },
    { key: "done", label: "Onboarded" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Signup Requests</h1>
        <p className="text-sm mt-1" style={{ color: "#7FBBC5" }}>
          Clinic details submitted from the landing page. Review, contact, and launch new clinics from here.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
            style={
              filter === t.key
                ? { background: "#02C39A", color: "#0A2535" }
                : { background: "#102F40", color: "#7FBBC5", border: "1px solid #1A4055" }
            }
          >
            {t.label} <span className="opacity-70">({counts[t.key]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm" style={{ color: "#7FBBC5" }}>
          <Loader2 className="w-4 h-4 animate-spin" /> Loading requests…
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center" style={saCard}>
          <Inbox className="w-8 h-8 mx-auto" style={{ color: "#7FBBC5" }} />
          <p className="mt-3 text-sm" style={{ color: "#7FBBC5" }}>No requests in this view.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => (
            <div key={r.id} style={saCard} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold">{r.clinic_name}</h3>
                    <span style={{ ...saChip, ...statusStyle(r.status) }}>{r.status}</span>
                    {r.speciality && <span style={saChip}>{r.speciality}</span>}
                    {r.clinic_size && <span style={saChip}>{r.clinic_size}</span>}
                  </div>
                  <div className="mt-1 text-sm" style={{ color: "#7FBBC5" }}>
                    Contact: <span className="text-white">{r.contact_name}</span>
                  </div>
                </div>
                <div className="text-[11px]" style={{ color: "#7FBBC5" }}>
                  {new Date(r.created_at).toLocaleString("en-IN")}
                </div>
              </div>

              <div className="mt-3 grid md:grid-cols-3 gap-2 text-[13px]">
                <a href={`mailto:${r.email}`} className="inline-flex items-center gap-2 hover:underline" style={{ color: "#02C39A" }}>
                  <Mail className="w-3.5 h-3.5" /> {r.email}
                </a>
                <a href={`tel:${r.phone}`} className="inline-flex items-center gap-2 hover:underline" style={{ color: "#02C39A" }}>
                  <Phone className="w-3.5 h-3.5" /> {r.phone}
                </a>
                {(r.city || r.state) && (
                  <div className="inline-flex items-center gap-2" style={{ color: "#7FBBC5" }}>
                    <MapPin className="w-3.5 h-3.5" /> {[r.city, r.state].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>

              {r.notes && (
                <div className="mt-3 p-3 rounded-md text-[13px]"
                  style={{ background: "#0A2535", border: "1px solid #1A4055", color: "#CFE3E8" }}>
                  {r.notes}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onLaunch(r)}
                  className="px-3 py-1.5 rounded-md text-[12px] font-semibold"
                  style={{ background: "#02C39A", color: "#0A2535" }}
                >
                  Launch clinic
                </button>
                {r.status !== "contacted" && (
                  <button
                    onClick={() => setStatus(r.id, "contacted")}
                    className="px-3 py-1.5 rounded-md text-[12px] font-medium"
                    style={{ background: "#102F40", color: "#7FBBC5", border: "1px solid #1A4055" }}
                  >
                    Mark contacted
                  </button>
                )}
                {r.status !== "done" && (
                  <button
                    onClick={() => setStatus(r.id, "done")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[12px] font-medium"
                    style={{ background: "#102F40", color: "#7FBBC5", border: "1px solid #1A4055" }}
                  >
                    <Check className="w-3 h-3" /> Onboarded
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    onClick={() => setStatus(r.id, "rejected")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[12px] font-medium"
                    style={{ background: "#102F40", color: "#E05C5C", border: "1px solid #1A4055" }}
                  >
                    <X className="w-3 h-3" /> Reject
                  </button>
                )}
                <button
                  onClick={() => remove(r.id)}
                  className="ml-auto px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-white/5"
                  style={{ color: "#7FBBC5" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function statusStyle(s: string): React.CSSProperties {
  if (s === "new") return { background: "rgba(2,195,154,0.15)", color: "#02C39A", borderColor: "transparent" };
  if (s === "contacted") return { background: "rgba(59,130,246,0.15)", color: "#60A5FA", borderColor: "transparent" };
  if (s === "done") return { background: "rgba(16,185,129,0.15)", color: "#10B981", borderColor: "transparent" };
  if (s === "rejected") return { background: "rgba(224,92,92,0.15)", color: "#E05C5C", borderColor: "transparent" };
  return {};
}
