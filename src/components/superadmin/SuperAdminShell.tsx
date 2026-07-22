import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard, Building2, PlusCircle, ActivitySquare, Settings, Bell, ChevronDown, LogOut, Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listClinicsWithStats } from "@/lib/superadmin.functions";
import { OverviewPage } from "./OverviewPage";
import { AllClinicsPage } from "./AllClinicsPage";
import { ActivityLogPage } from "./ActivityLogPage";
import { PlatformSettingsPage } from "./PlatformSettingsPage";
import { AddClinicWizard } from "./AddClinicWizard";
import { SignupRequestsPage } from "./SignupRequestsPage";

type Tab = "overview" | "clinics" | "add" | "requests" | "log" | "settings";

export function SuperAdminShell() {
  const [tab, setTab] = useState<Tab>("overview");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [accMenu, setAccMenu] = useState(false);

  const fetchList = useServerFn(listClinicsWithStats);
  const { data, refetch } = useQuery({
    queryKey: ["sa-clinics"],
    queryFn: () => fetchList(),
    refetchOnWindowFocus: false,
  });
  const totalClinics = data?.clinics.length ?? 0;

  const onWizardClose = (created: boolean) => {
    setWizardOpen(false);
    if (created) refetch();
  };

  const navItems: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }>; accent?: boolean }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "clinics", label: "All Clinics", icon: Building2 },
    { key: "add", label: "Add Clinic", icon: PlusCircle, accent: true },
    { key: "log", label: "Activity Log", icon: ActivitySquare },
    { key: "settings", label: "Platform Settings", icon: Settings },
  ];

  const selectTab = (k: Tab) => {
    if (k === "add") { setWizardOpen(true); return; }
    setTab(k);
  };

  return (
    <div className="min-h-screen text-white" style={{ background: "#0C2D3E" }}>
      {/* TOP BAR */}
      <header className="h-14 flex items-center justify-between px-5 border-b" style={{ background: "#0A2535", borderColor: "#1A4055" }}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight">ClinicOS</span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: "#02C39A", color: "#0A2535" }}>Super Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full text-[12px] font-medium" style={{ background: "#102F40", border: "1px solid #1A4055", color: "#7FBBC5" }}>
            {totalClinics} {totalClinics === 1 ? "Clinic" : "Clinics"}
          </span>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5" aria-label="Notifications">
            <Bell className="w-4 h-4" style={{ color: "#7FBBC5" }} />
          </button>
          <div className="relative">
            <button onClick={() => setAccMenu((v) => !v)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-white/5">
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: "#0C2D3E", color: "#02C39A", border: "1px solid #1A4055" }}>SA</span>
              <ChevronDown className="w-4 h-4" style={{ color: "#7FBBC5" }} />
            </button>
            {accMenu && (
              <div className="absolute right-0 top-11 w-44 rounded-md py-1 z-50" style={{ background: "#102F40", border: "1px solid #1A4055" }}>
                <button className="w-full text-left px-3 py-2 text-[13px] hover:bg-white/5" onClick={() => setAccMenu(false)}>Account</button>
                <button onClick={() => supabase.auth.signOut()} className="w-full text-left px-3 py-2 text-[13px] hover:bg-white/5 inline-flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-[220px] min-h-[calc(100vh-56px)] flex flex-col justify-between" style={{ background: "#091F2D", borderRight: "1px solid #1A4055" }}>
          <nav className="p-3 space-y-1">
            {navItems.map(({ key, label, icon: Icon, accent }) => {
              const active = tab === key && !accent;
              return (
                <button
                  key={key}
                  onClick={() => selectTab(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                    active ? "" : "hover:bg-white/5"
                  }`}
                  style={
                    active
                      ? { background: "#0C2D3E", color: "#02C39A", border: "1px solid #1A4055" }
                      : accent
                      ? { color: "#02C39A" }
                      : { color: "#7FBBC5" }
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t" style={{ borderColor: "#1A4055" }}>
            <div className="text-[11px]" style={{ color: "#7FBBC5" }}>superadmin@clinicos.in</div>
            <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: "#02C39A", color: "#0A2535" }}>
              Super Admin
            </span>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 max-w-[1500px]">
          {tab === "overview" && <OverviewPage onAdd={() => setWizardOpen(true)} />}
          {tab === "clinics" && <AllClinicsPage onAdd={() => setWizardOpen(true)} />}
          {tab === "log" && <ActivityLogPage />}
          {tab === "settings" && <PlatformSettingsPage />}
        </main>
      </div>

      {wizardOpen && <AddClinicWizard onClose={onWizardClose} />}
    </div>
  );
}
