import { useState } from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { deleteClinic } from "@/lib/superadmin.functions";
import { saCard, saInput } from "./tokens";
import type { SAClinic } from "./types";

export function DeleteClinicModal({ clinic, onClose }: { clinic: SAClinic; onClose: (deleted: boolean) => void }) {
  const del = useServerFn(deleteClinic);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const matches = confirm === clinic.name;

  const onDel = async () => {
    setBusy(true);
    try {
      await del({ data: { id: clinic.id } });
      toast.success("SAClinic deleted");
      onClose(true);
    } catch (e) { toast.error((e as Error).message); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,37,53,0.7)" }} onClick={() => onClose(false)}>
      <div className="w-full max-w-[480px] p-6" style={saCard} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" style={{ color: "#E05C5C" }} /><h3 className="text-lg font-bold">Delete {clinic.name}?</h3></div>
          <button onClick={() => onClose(false)} className="p-1 rounded hover:bg-white/5"><X className="w-4 h-4" style={{ color: "#7FBBC5" }} /></button>
        </div>
        <p className="text-[13px] mb-4" style={{ color: "#7FBBC5" }}>
          This will permanently delete the clinic and all its data — patients, appointments, invoices, lab reports, inventory and staff. This cannot be undone.
        </p>
        <label className="block text-[11px] font-semibold mb-1.5" style={{ color: "#7FBBC5" }}>Type "{clinic.name}" to confirm</label>
        <input style={saInput} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => onClose(false)} className="px-4 py-2 rounded-md text-[12px]" style={{ background: "#0A2535", color: "#7FBBC5", border: "1px solid #1A4055" }}>Cancel</button>
          <button disabled={!matches || busy} onClick={onDel} className="px-4 py-2 rounded-md text-[12px] font-semibold inline-flex items-center gap-2" style={{ background: "#E05C5C", color: "#FFFFFF", opacity: matches && !busy ? 1 : 0.5 }}>
            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Delete permanently
          </button>
        </div>
      </div>
    </div>
  );
}
