import { Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Toaster } from "@/components/ui/sonner";
import { Menu, X } from "lucide-react";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 w-10 h-10 rounded-md bg-white border border-border flex items-center justify-center shadow"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-navy" />
      </button>

      {/* Sidebar wrapper */}
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

      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
