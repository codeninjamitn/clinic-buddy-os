import { Bell } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-[15px] font-semibold text-navy">Ramaiah Clinic</h1>
        <p className="text-xs text-muted-foreground">Bengaluru · KA</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center">
          <Bell className="w-5 h-5 text-navy" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-danger ring-2 ring-white" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-navy leading-tight">Dr. Ramaiah</div>
            <div className="text-[11px] text-muted-foreground leading-tight">General Physician</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary text-white font-semibold flex items-center justify-center text-sm">
            DR
          </div>
        </div>
      </div>
    </header>
  );
}
