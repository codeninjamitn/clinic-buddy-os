import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saCard, saInput, saLabel } from "./tokens";

export function PlatformSettingsPage() {
  const [platformName, setPlatformName] = useState("ClinicOS");
  const [supportEmail, setSupportEmail] = useState("support@clinicos.in");
  const [newPw, setNewPw] = useState("");

  useEffect(() => {
    setPlatformName(localStorage.getItem("sa.platformName") || "ClinicOS");
    setSupportEmail(localStorage.getItem("sa.supportEmail") || "support@clinicos.in");
  }, []);

  const save = () => {
    localStorage.setItem("sa.platformName", platformName);
    localStorage.setItem("sa.supportEmail", supportEmail);
    toast.success("Platform info saved");
  };

  const changePw = async () => {
    if (newPw.length < 8) return toast.error("Min 8 chars");
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    setNewPw("");
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-[13px]" style={{ color: "#7FBBC5" }}>Configure ClinicOS platform-wide settings.</p>
      </div>

      <section className="p-5 space-y-4" style={saCard}>
        <h2 className="text-[15px] font-semibold">Platform Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={saLabel}>Platform name</label>
            <input value={platformName} onChange={(e) => setPlatformName(e.target.value)} style={saInput} />
          </div>
          <div>
            <label style={saLabel}>Support email</label>
            <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} style={saInput} />
          </div>
        </div>
        <button onClick={save} className="px-4 py-2 rounded-md text-[12px] font-semibold" style={{ background: "#02C39A", color: "#0A2535" }}>Save</button>
      </section>

      <section className="p-5 space-y-3" style={saCard}>
        <h2 className="text-[15px] font-semibold">Plan Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: "Starter", price: "₹999/mo", feats: ["Up to 2 doctors", "Basic features"] },
            { name: "Pro", price: "₹1,999/mo", feats: ["Up to 10 doctors", "Full features + ABDM"] },
            { name: "Enterprise", price: "Custom", feats: ["Unlimited doctors", "White-label + API"] },
          ].map((p) => (
            <div key={p.name} className="p-4 rounded-md" style={{ background: "#0A2535", border: "1px solid #1A4055" }}>
              <div className="text-[14px] font-bold">{p.name}</div>
              <div className="text-[12px]" style={{ color: "#02C39A" }}>{p.price}</div>
              <ul className="text-[11px] mt-2 space-y-0.5" style={{ color: "#7FBBC5" }}>
                {p.feats.map((f) => <li key={f}>• {f}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-[11px]" style={{ color: "#7FBBC5" }}>Coming soon: edit plans</p>
      </section>

      <section className="p-5 space-y-3" style={saCard}>
        <h2 className="text-[15px] font-semibold">Super Admin Account</h2>
        <div className="text-[13px]" style={{ color: "#7FBBC5" }}>superadmin@clinicos.in</div>
        <div className="flex gap-2 items-end max-w-md">
          <div className="flex-1">
            <label style={saLabel}>New password</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} style={saInput} />
          </div>
          <button onClick={changePw} className="px-4 py-2 rounded-md text-[12px] font-semibold whitespace-nowrap" style={{ background: "#02C39A", color: "#0A2535" }}>Change Password</button>
        </div>
      </section>
    </div>
  );
}
