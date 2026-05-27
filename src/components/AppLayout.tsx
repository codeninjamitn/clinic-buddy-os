import { Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Toaster } from "@/components/ui/sonner";
import { Menu, X, Loader2 } from "lucide-react";
import { AuthProvider, ClinicProvider, useAuth } from "@/lib/auth";
import { ModalsProvider } from "@/lib/modals";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { SuperAdminProvider, useSuperAdmin } from "@/context/SuperAdminContext";
import { LoginScreen } from "./LoginScreen";
import { SuperAdminShell } from "./superadmin/SuperAdminShell";
import { SuperAdminBanner } from "./superadmin/SuperAdminBanner";

export function AppLayout() {
  return (
    <AuthProvider>
      <AuthGate />
      <Toaster position="bottom-right" richColors closeButton />
    </AuthProvider>
  );
}

function AuthGate() {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!session) return <LoginScreen />;
  return (
    <RoleProvider>
      <SuperAdminProvider>
        <RoleRouter />
      </SuperAdminProvider>
    </RoleProvider>
  );
}

function RoleRouter() {
  const { isSuperAdmin, loading } = useRole();
  const { activeSuperAdminClinicId } = useSuperAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Super Admin without a selected clinic → super admin shell
  if (isSuperAdmin && !activeSuperAdminClinicId) {
    return <SuperAdminShell />;
  }

  // Normal users (or super admin viewing a specific clinic)
  return (
    <ClinicProvider clinicId={activeSuperAdminClinicId ?? undefined}>
      <ModalsProvider>
        {isSuperAdmin && activeSuperAdminClinicId && <SuperAdminBanner />}
        <Shell />
      </ModalsProvider>
    </ClinicProvider>
  );
}

function Shell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 w-10 h-10 rounded-md bg-white border border-border flex items-center justify-center shadow"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-navy" />
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-3 right-[-44px] w-10 h-10 rounded-md bg-white border border-border flex items-center justify-center shadow"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-navy" />
        </button>
      </div>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="md:hidden fixed inset-0 z-30 bg-black/40" />
      )}

      <div className="md:ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main key={path} className="flex-1 p-4 md:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
