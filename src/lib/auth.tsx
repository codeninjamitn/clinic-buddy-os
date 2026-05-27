import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Clinic } from "@/types/database";

// ---------- helpers ----------
const PALETTE = ["#028090", "#02C39A", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#10B981"];

export function initials(name: string) {
  return name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function ageFromDob(dob: string | null) {
  if (!dob) return "—";
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export function endOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
}

export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday=0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isoDate(d: Date) {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function formatINR(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

// ---------- Auth ----------
interface AuthCtx { session: Session | null; user: User | null; loading: boolean }
const AuthContext = createContext<AuthCtx>({ session: null, user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

// ---------- Clinic ----------
interface ClinicCtx { clinic: Clinic | null; loading: boolean; refresh: () => Promise<void> }
const ClinicContext = createContext<ClinicCtx>({ clinic: null, loading: true, refresh: async () => {} });

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await supabase.from("clinics").select("*").limit(1).maybeSingle();
    setClinic((data as Clinic) ?? null);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  return <ClinicContext.Provider value={{ clinic, loading, refresh }}>{children}</ClinicContext.Provider>;
}

export const useClinic = () => useContext(ClinicContext);
