import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Stethoscope, ArrowRight, Clock, Users, Zap, ShieldCheck, Smartphone,
  Calendar, FlaskConical, Receipt, Package, CheckCircle2, MessageCircle,
} from "lucide-react";
import { GetStartedModal } from "@/components/modals/GetStartedModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClinicOS — Clinic Management for Indian Doctors & Labs" },
      { name: "description", content: "Modern queue, patients, billing, lab reports & inventory for small clinics and diagnostic labs. Start in 5 minutes." },
      { property: "og:title", content: "ClinicOS — Clinic Management for Indian Doctors & Labs" },
      { property: "og:description", content: "Modern queue, patients, billing, lab reports & inventory for small clinics and diagnostic labs. Start in 5 minutes." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [signupOpen, setSignupOpen] = useState(false);
  const openSignup = () => setSignupOpen(true);
  return (
    <div className="min-h-screen bg-background text-navy">
      <Header onGetStarted={openSignup} />
      <Hero onGetStarted={openSignup} />
      <Trust />
      <Features />
      <PerfectFor />
      <Modules />
      <CTA onGetStarted={openSignup} />
      <Footer onGetStarted={openSignup} />
      <GetStartedModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div className="font-bold text-lg">ClinicOS</div>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-navy">Features</a>
          <a href="#modules" className="hover:text-navy">Modules</a>
          <a href="#for" className="hover:text-navy">Who it's for</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-sm font-medium px-3.5 py-2 rounded-md text-navy hover:bg-muted transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-[#E1F5EE] px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Made in India, for Indian clinics
        </span>
        <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
          <span className="text-primary">ClinicOS</span><br />
          Your Clinic,<br />Beautifully Organised.
        </h1>
        <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
          Appointments, patients, billing, lab reports and inventory — one calm dashboard for
          independent doctors and diagnostic labs. Start in 5 minutes.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign in to dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-border bg-white text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> See what's inside
          </a>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" />No downloads</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" />No installations</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent" />Runs in your browser</span>
        </div>
      </div>
      <HeroPreview />
    </section>
  );
}

function HeroPreview() {
  const queue = [
    { name: "Rajesh Kumar", time: "10:15", tag: "Next", tone: "bg-[#E1F5EE] text-primary" },
    { name: "Priya Sharma", time: "10:30", tag: "Urgent", tone: "bg-red-50 text-red-700" },
    { name: "Amit Patel", time: "10:45", tag: "Waiting", tone: "bg-amber-50 text-amber-700" },
    { name: "Sneha Reddy", time: "11:00", tag: "Waiting", tone: "bg-amber-50 text-amber-700" },
  ];
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-gradient-to-br from-[#E1F5EE] via-white to-blue-50 rounded-3xl -z-10" />
      <div className="card-surface p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Today's Queue</div>
            <div className="font-bold text-lg">4 patients waiting</div>
          </div>
          <div className="text-xs font-medium text-primary bg-[#E1F5EE] px-2.5 py-1 rounded-full">Live</div>
        </div>
        <ul className="mt-4 space-y-2">
          {queue.map((q) => (
            <li key={q.name} className="flex items-center gap-3 border border-border rounded-lg p-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                {q.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{q.name}</div>
                <div className="text-xs text-muted-foreground">{q.time} AM</div>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${q.tone}`}>{q.tag}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Trust() {
  return (
    <section className="bg-navy text-white py-14 md:py-16">
      <div className="max-w-6xl mx-auto px-5 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Built for clinics that see 10–50 patients a day</h2>
        <p className="mt-3 text-white/70 max-w-2xl mx-auto text-sm md:text-base">
          No complicated dashboards. No unnecessary forms. Just the tools your clinic actually needs
          to run faster and smoother.
        </p>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { Icon: Clock, title: "5-Minute Setup", body: "Start using immediately. No complex configuration or long onboarding." },
            { Icon: Zap, title: "Zero Training", body: "Your reception staff can learn the system in under 5 minutes." },
            { Icon: Smartphone, title: "Works Everywhere", body: "Any device — phone, tablet or computer. No special hardware." },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-6 text-left">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <f.Icon className="w-5 h-5" />
              </div>
              <div className="mt-4 font-semibold">{f.title}</div>
              <div className="mt-1.5 text-sm text-white/70">{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { Icon: ShieldCheck, title: "ABDM-ready", body: "Enterprise plans link with ABHA and Health IDs — future-proof from day one." },
    { Icon: Users, title: "Role-based access", body: "Doctors, receptionists, lab techs and pharmacists each see only what they need." },
    { Icon: Clock, title: "Real-time updates", body: "Bookings, payments and lab uploads sync instantly across your team." },
  ];
  return (
    <section id="features" className="py-20">
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-primary uppercase tracking-wide">Why ClinicOS</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">Everything to run a clinic. Nothing you don't need.</h2>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {items.map((f) => (
            <div key={f.title} className="card-surface p-6">
              <div className="w-10 h-10 rounded-lg bg-[#E1F5EE] text-primary flex items-center justify-center">
                <f.Icon className="w-5 h-5" />
              </div>
              <div className="mt-4 font-semibold">{f.title}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PerfectFor() {
  const list = [
    "General Physicians",
    "ENT & Pediatric Clinics",
    "Small Polyclinics (1–3 doctors)",
    "Diagnostic Labs",
    "Clinics without a receptionist",
    "Clinics still on paper registers",
  ];
  return (
    <section id="for" className="py-20 bg-[#F4FAFB]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-primary uppercase tracking-wide">Perfect for</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">Is ClinicOS right for your practice?</h2>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((t) => (
            <div key={t} className="card-surface p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
              <span className="text-sm font-medium">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Modules() {
  const mods = [
    { Icon: Calendar, title: "Appointments", body: "Week grid, quick booking, colour-coded status." },
    { Icon: Users, title: "Patients", body: "Full history, allergies, visits and prescriptions." },
    { Icon: Receipt, title: "Billing", body: "GST invoices, payments and outstanding dues." },
    { Icon: FlaskConical, title: "Lab Reports", body: "Upload PDFs, mark delivered, signed URLs." },
    { Icon: Package, title: "Inventory", body: "Stock levels, expiry tracking, low-stock alerts." },
    { Icon: ShieldCheck, title: "Roles & Settings", body: "Clinic profile, staff, permissions and ABDM." },
  ];
  return (
    <section id="modules" className="py-20">
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold text-primary uppercase tracking-wide">Modules</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">Six modules. One shared clinic.</h2>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mods.map((m) => (
            <div key={m.title} className="card-surface p-6 hover:border-primary transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#E1F5EE] text-primary flex items-center justify-center">
                <m.Icon className="w-5 h-5" />
              </div>
              <div className="mt-4 font-semibold">{m.title}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{m.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-5">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-[#026470] text-white p-10 md:p-14 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold">Ready when your next patient arrives.</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">
            Sign in to your ClinicOS dashboard and start managing appointments, patients and billing in minutes.
          </p>
          <div className="mt-7">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white text-primary text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              Sign in to your clinic <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-[#F4FAFB]">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid gap-10 md:gap-8 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-white bg-primary px-2.5 py-1 rounded-md">
              CLINICOS
            </span>
            <div className="mt-4 text-xl font-bold text-navy leading-snug">
              Your Clinic,<br />Beautifully Organised.
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Modern clinic management for independent Indian doctors and diagnostic labs.
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">A product of</span>
              <span className="font-semibold text-navy">Nirnay Labs</span>
            </div>
            <div className="mt-6 text-xs text-muted-foreground leading-relaxed">
              © {year} Nirnay Labs.<br />All rights reserved.
            </div>
          </div>

          {/* Navigate */}
          <div className="md:col-span-2">
            <div className="text-xs font-bold tracking-wider text-navy uppercase">Navigate</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
              <li><a href="#modules" className="text-muted-foreground hover:text-primary transition-colors">Modules</a></li>
              <li><a href="#for" className="text-muted-foreground hover:text-primary transition-colors">Who it's for</a></li>
              <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Sign in</Link></li>
              <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Get started</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-3">
            <div className="text-xs font-bold tracking-wider text-navy uppercase">Legal</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Data Processing (DPDP)</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Submit feedback</a></li>
            </ul>
          </div>

          {/* Compliance */}
          <div className="md:col-span-3">
            <div className="text-xs font-bold tracking-wider text-navy uppercase">Compliance</div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              ABDM &amp; ABHA ready.<br />
              DPDP Act 2023 aligned.<br />
              Data hosted in India.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-border bg-white text-navy">ABDM</span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-border bg-white text-navy">DPDP</span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-border bg-white text-navy">ISO 27001</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5 text-white" />
            </div>
            <span>ClinicOS · Made with <span className="text-red-500">❤</span> from Bengaluru, India for clinics across Bharat.</span>
          </div>
          <div className="md:text-right">
            Information shown is for clinic management only and does not constitute medical advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
