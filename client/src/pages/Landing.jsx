import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  BookHeart,
  ShieldCheck,
  ScrollText,
  ArrowRight,
  Lock,
  Users,
  KeyRound,
  Quote,
  ChevronDown,
} from "lucide-react";
import { Button, Card, Badge } from "../components/ui.jsx";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const FEATURES = [
  { icon: BookHeart, title: "Memory Vault", desc: "Preserve stories, photos, audio, video and documents in one organized, searchable vault." },
  { icon: Sparkles, title: "EchoMind AI", desc: "Authorized people can ask questions and get answers reconstructed only from what you preserved." },
  { icon: ShieldCheck, title: "Legacy Access", desc: "Decide exactly who can see what, and when — with view-only, chat, or full access levels." },
  { icon: ScrollText, title: "Transparent Audit Log", desc: "Every view, question, and access change is logged, so nothing happens without a trace." },
];

const STEPS = [
  { title: "Capture", desc: "Add memories, lessons, and stories in whatever form fits — text, photo, audio, video, or document." },
  { title: "Preserve", desc: "Organize everything by category, tag, and date inside your private legacy vault." },
  { title: "Connect", desc: "Grant trusted people carefully scoped access, on your terms and your timeline." },
  { title: "Remember", desc: "Let EchoMind AI help the people you trust rediscover what you preserved." },
];

const TESTIMONIALS = [
  { name: "Meera K.", role: "Preserving family history", quote: "I started this to save my grandfather's stories. Now it's become a running journal my whole family adds to." },
  { name: "Devraj S.", role: "Documenting career lessons", quote: "The AI assistant surfaced advice I'd written years ago and forgotten. It felt like talking to my own notes, but useful." },
  { name: "Ishita P.", role: "Family legacy vault", quote: "Being able to set exactly who sees what, and when, is what finally got the rest of my family on board." },
];

const FAQS = [
  { q: "Who can see my memories?", a: "Only you, by default. You decide exactly who gets access, to which categories, and under what conditions in Legacy Access." },
  { q: "Is EchoMind AI actually 'me'?", a: "No. EchoMind AI clearly labels every answer as an AI-generated reconstruction built only from what you've preserved — never a claim to be you." },
  { q: "What does 'event-based release' mean?", a: "It's a scoped release condition you can set for a trusted person. In this prototype, event verification is simulated — it is not a real legal or death-verification service." },
  { q: "Can I remove access later?", a: "Yes. Every access grant can be revoked at any time from the Legacy Access page, and the change is recorded in your audit log." },
];

function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame;
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

export default function Landing() {
  const [stats, setStats] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/public/stats")
      .then((res) => setStats(res.data.stats))
      .catch(() => setStats(null));
  }, []);

  function goToApp() {
    navigate(user ? "/dashboard" : "/login?demo=1");
  }

  return (
    <div className="bg-canvas text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-accent font-bold text-sm">E</div>
            <span className="font-bold text-primary">EchoMind</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button as={Link} to="/dashboard" size="sm">Go to Dashboard</Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" size="sm">Log in</Button>
                <Button as={Link} to="/signup" size="sm">Start Your Legacy</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-24 pb-16">
        <div className="max-w-2xl">
          <Badge tone="gold">Preserve memories. Share wisdom. Keep your story alive.</Badge>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-primary leading-[1.1]">
            Your memories deserve a future.
          </h1>
          <p className="mt-5 text-lg text-muted leading-relaxed">
            EchoMind is a secure digital legacy vault. Preserve your stories, skills, and life lessons, organize them
            intelligently, and control exactly who can access them — and how.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button as={Link} to="/signup" size="lg">
              Start Your Legacy <ArrowRight size={18} />
            </Button>
            <Button onClick={goToApp} variant="outline" size="lg">
              Explore Demo
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted flex items-center gap-1.5">
            <Lock size={13} /> Memory content is private and only visible after you log in.
          </p>
        </div>
      </section>

      {/* Public stats — aggregate, non-identifying counters only */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Memories preserved", value: stats?.memoriesPreserved ?? 0 },
            { label: "Legacies started", value: stats?.legaciesStarted ?? 0 },
            { label: "Trusted connections", value: stats?.trustedConnections ?? 0 },
            { label: "Families using EchoMind", value: stats?.familiesUsingEchoMind ?? 0 },
          ].map((s) => (
            <Card key={s.label} className="p-5 text-center">
              <p className="text-3xl font-extrabold text-primary">
                <AnimatedCounter value={s.value} />
              </p>
              <p className="text-xs text-muted mt-1 font-medium">{s.label}</p>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted text-center mt-3">
          Aggregate, anonymized figures shown publicly. Individual memories and profiles are private and require login.
        </p>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-10">Everything you need to build a legacy</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-6">
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-ink mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-3">How EchoMind works</h2>
        <p className="text-center text-muted mb-10">Capture → Preserve → Connect → Remember</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="flex items-center gap-3 mb-2">
                <span className="h-8 w-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-ink">{s.title}</h3>
              </div>
              <p className="text-sm text-muted leading-relaxed pl-11">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI preview */}
      <section className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Badge tone="gold">EchoMind AI</Badge>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold leading-tight">Ask questions. Discover memories. Continue the story.</h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Authorized people can ask EchoMind AI about what you preserved. Every answer is clearly labeled as a
              reconstruction, built only from your memories — never a claim to be you — with the source memories shown alongside it.
            </p>
          </div>
          <Card className="p-5 bg-white/5 border-white/10 backdrop-blur">
            <div className="space-y-3">
              <div className="bg-white/10 rounded-2xl rounded-br-sm px-4 py-3 text-sm ml-auto w-fit max-w-[85%]">
                What advice did I preserve about learning?
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-ink w-fit max-w-[90%]">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-accent mb-1">AI Reconstruction</p>
                <p>Based on memories preserved in this vault, learning was treated as a lifelong habit, not a phase...</p>
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  <span className="text-[11px] bg-accent/15 text-accent rounded-full px-2 py-0.5">First Coding Project</span>
                  <span className="text-[11px] bg-accent/15 text-accent rounded-full px-2 py-0.5">Career Advice</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Privacy */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="p-6">
            <Lock className="text-primary mb-3" size={22} />
            <h3 className="font-semibold text-ink mb-1.5">Your legacy.</h3>
            <p className="text-sm text-muted">Memories belong to you and stay private until you decide otherwise.</p>
          </Card>
          <Card className="p-6">
            <KeyRound className="text-primary mb-3" size={22} />
            <h3 className="font-semibold text-ink mb-1.5">Your permissions.</h3>
            <p className="text-sm text-muted">Grant view-only, chat, or full access — scoped by category, and revocable anytime.</p>
          </Card>
          <Card className="p-6">
            <Users className="text-primary mb-3" size={22} />
            <h3 className="font-semibold text-ink mb-1.5">Your control.</h3>
            <p className="text-sm text-muted">Every access, view, and AI question is logged in a transparent audit trail.</p>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-10">People building their legacy</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-6">
                <Quote className="text-accent mb-3" size={20} />
                <p className="text-sm text-ink leading-relaxed mb-4">{t.quote}</p>
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted mt-6">Illustrative demo testimonials.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-10">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <Card key={f.q} className="overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left focus-ring"
              >
                <span className="font-medium text-ink text-sm">{f.q}</span>
                <ChevronDown size={18} className={`text-muted transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && <p className="px-5 pb-4 text-sm text-muted leading-relaxed">{f.a}</p>}
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pb-20">
        <Card className="p-10 sm:p-14 text-center bg-primary text-white border-0">
          <h2 className="text-2xl sm:text-3xl font-bold">Start building your legacy.</h2>
          <p className="mt-3 text-white/70 max-w-lg mx-auto">
            Create your vault in minutes, or explore a pre-populated demo legacy first.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/signup" variant="accent" size="lg">Start Your Legacy</Button>
            <Button onClick={goToApp} variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              Explore Demo
            </Button>
          </div>
        </Card>
      </section>

      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-accent font-bold text-xs">E</div>
            <span className="text-sm font-semibold text-primary">EchoMind</span>
          </div>
          <p className="text-xs text-muted text-center">
            Prototype build. Event-based release verification is simulated, not a real legal or death-verification service.
          </p>
        </div>
      </footer>
    </div>
  );
}
