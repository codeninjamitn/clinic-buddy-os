import { Bell, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useClinic, initials } from "@/lib/auth";

export function TopBar() {
  const { clinic } = useClinic();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const userLabel = user?.email?.split("@")[0] ?? "User";
  const initLabel = initials(userLabel.replace(/[._]/g, " "));

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-[15px] font-semibold text-navy">{clinic?.name ?? "Clinic"}</h1>
        <p className="text-xs text-muted-foreground">Bengaluru · KA</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center">
          <Bell className="w-5 h-5 text-navy" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-danger ring-2 ring-white" />
        </button>
        <div className="relative" ref={ref}>
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-navy leading-tight">Dr. Ramaiah</div>
              <div className="text-[11px] text-muted-foreground leading-tight">{user?.email ?? "Signed in"}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary text-white font-semibold flex items-center justify-center text-sm">
              {initLabel || "DR"}
            </div>
          </button>
          {open && (
            <div className="absolute right-0 top-12 w-56 bg-white border border-border rounded-md shadow-lg z-50 py-1 animate-fade-in">
              <div className="px-3 py-2 border-b border-border">
                <div className="text-xs text-muted-foreground">Signed in as</div>
                <div className="text-sm font-medium text-navy truncate">{user?.email}</div>
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full px-3 py-2 text-left text-sm text-navy hover:bg-muted flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
