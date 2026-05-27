import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, Loader2 } from "lucide-react";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (e?: React.FormEvent, override?: { email: string; password: string }) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    const creds = override ?? { email, password };
    const { error } = await supabase.auth.signInWithPassword(creds);
    if (error) setError("Invalid email or password");
    setLoading(false);
  };

  const demo = async () => {
    setEmail("admin@ramaiaiclinic.in");
    setPassword("Demo@1234");
    await signIn(undefined, { email: "admin@ramaiaiclinic.in", password: "Demo@1234" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] card-surface p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center mb-3">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-navy">ClinicOS</h1>
          <p className="text-xs text-muted-foreground mt-1">Your Clinic Buddy</p>
        </div>

        <form onSubmit={signIn} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 text-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="you@clinic.in"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 text-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Sign in
          </button>
          <button
            type="button"
            onClick={demo}
            disabled={loading}
            className="w-full py-2.5 rounded-md border border-border bg-white text-navy text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-60"
          >
            Demo login
          </button>
        </form>

        <p className="text-[11px] text-muted-foreground text-center mt-6">
          Demo credentials are pre-filled with the Demo login button.
        </p>
      </div>
    </div>
  );
}
