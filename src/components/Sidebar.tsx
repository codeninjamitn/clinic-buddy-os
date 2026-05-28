import { Link as RouterLink, useRouterState } from "@tanstack/react-router";
const Link = RouterLink as any;
import {
  LayoutDashboard, Calendar, Users, Receipt, FlaskConical, Package, Settings,
  Stethoscope,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { useClinic } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";
import { ROLE_BADGE } from "@/lib/permissions";

const nav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; perm?: Permission }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/appointments", label: "Appointments", icon: Calendar, perm: "view_appointments" },
  { to: "/patients", label: "Patients", icon: Users, perm: "view_patients" },
  { to: "/billing", label: "Billing", icon: Receipt, perm: "view_billing" },
  { to: "/lab-reports", label: "Lab Reports", icon: FlaskConical, perm: "view_lab_reports" },
  { to: "/inventory", label: "Inventory", icon: Package, perm: "view_inventory" },
  { to: "/settings", label: "Settings", icon: Settings, perm: "access_settings" },
];

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { can, role, staffName } = useRole();
  const { clinic } = useClinic();
  const items = nav.filter((n) => !n.perm || can(n.perm));

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-navy text-navy-foreground flex flex-col z-20">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-[15px] leading-tight">ClinicOS</div>
          <div className="text-[11px] text-white/60 leading-tight">Clinic Management</div>
        </div>
      </div>
      {role && (
        <div className="px-5 py-3 border-b border-white/10">
          <div className="text-[11px] text-white/50 uppercase tracking-wide">Signed in</div>
          <div className="text-sm font-semibold text-white truncate">{staffName}</div>
          <span className={`mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE[role]}`}>
            {role}
          </span>
        </div>
      )}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {items.map((item) => {
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors relative ${
                active
                  ? "bg-[#E1F5EE] text-primary"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />}
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 text-[11px] text-white/50">
        v1.0 · © {clinic?.name ?? "ClinicOS"}
      </div>
    </aside>
  );
}
