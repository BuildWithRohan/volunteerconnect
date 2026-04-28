import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { NGO_NEWS } from "../services/newsService";
import Chatbot from "../components/common/Chatbot";

/* ── SVG Illustrations ─────────────────────────────────── */
function HeroIllustration() {
  return (
    <svg viewBox="0 0 400 360" fill="none" style={{ width: "100%", maxWidth: 420 }}>
      {/* Ground */}
      <ellipse cx="200" cy="330" rx="160" ry="20" fill="#EDE9FF" />
      {/* Map pin */}
      <path d="M200 80C175 80 155 100 155 125C155 160 200 220 200 220C200 220 245 160 245 125C245 100 225 80 200 80Z" fill="#6B4EFF" stroke="#1A1A2E" strokeWidth="2"/>
      <circle cx="200" cy="120" r="16" fill="white" stroke="#1A1A2E" strokeWidth="2"/>
      <circle cx="200" cy="120" r="6" fill="#FF6B35"/>
      {/* Person 1 - left */}
      <circle cx="130" cy="250" r="18" fill="#FDBCB4" stroke="#1A1A2E" strokeWidth="2"/>
      <rect x="115" y="268" width="30" height="40" rx="8" fill="#6B4EFF" stroke="#1A1A2E" strokeWidth="2"/>
      <rect x="120" y="308" width="10" height="18" rx="4" fill="#1A1A2E"/>
      <rect x="135" y="308" width="10" height="18" rx="4" fill="#1A1A2E"/>
      <circle cx="125" cy="247" r="3" fill="#1A1A2E"/>
      <circle cx="135" cy="247" r="3" fill="#1A1A2E"/>
      <path d="M126 255C126 255 130 259 134 255" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Person 2 - right */}
      <circle cx="270" cy="255" r="18" fill="#C68642" stroke="#1A1A2E" strokeWidth="2"/>
      <rect x="255" y="273" width="30" height="40" rx="8" fill="#FF6B35" stroke="#1A1A2E" strokeWidth="2"/>
      <rect x="260" y="313" width="10" height="14" rx="4" fill="#1A1A2E"/>
      <rect x="275" y="313" width="10" height="14" rx="4" fill="#1A1A2E"/>
      <circle cx="265" cy="252" r="3" fill="#1A1A2E"/>
      <circle cx="275" cy="252" r="3" fill="#1A1A2E"/>
      <path d="M266 260C266 260 270 264 274 260" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Person 3 - center back */}
      <circle cx="200" cy="210" r="16" fill="#8D5524" stroke="#1A1A2E" strokeWidth="2"/>
      <rect x="187" y="226" width="26" height="36" rx="7" fill="#2DCB73" stroke="#1A1A2E" strokeWidth="2"/>
      <rect x="191" y="262" width="9" height="14" rx="4" fill="#1A1A2E"/>
      <rect x="204" y="262" width="9" height="14" rx="4" fill="#1A1A2E"/>
      {/* Sparkles / accessories */}
      <path d="M100 220L103 226L110 228L103 230L100 236L97 230L90 228L97 226Z" fill="#FFD046" stroke="#1A1A2E" strokeWidth="1"/>
      <path d="M300 210L302 215L308 216L302 218L300 223L298 218L292 216L298 215Z" fill="#FF4D8D" stroke="#1A1A2E" strokeWidth="1"/>
      <circle cx="160" cy="200" r="4" fill="#FFD046" stroke="#1A1A2E" strokeWidth="1"/>
      <circle cx="245" cy="195" r="3" fill="#6B4EFF" stroke="#1A1A2E" strokeWidth="1"/>
      {/* Hands waving */}
      <rect x="145" y="278" width="22" height="6" rx="3" fill="#FDBCB4" stroke="#1A1A2E" strokeWidth="1.5" transform="rotate(-20 145 278)"/>
      <rect x="233" y="282" width="22" height="6" rx="3" fill="#C68642" stroke="#1A1A2E" strokeWidth="1.5" transform="rotate(20 233 282)"/>
    </svg>
  );
}

function DoodleBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <svg style={{ position: "absolute", top: "8%", left: "5%", opacity: 0.2 }} width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="4" fill="#6B4EFF"/>
      </svg>
      <svg style={{ position: "absolute", top: "15%", right: "10%", opacity: 0.15 }} width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 2L14.5 8.5L22 10L14.5 12L12 18L9.5 12L2 10L9.5 8.5Z" fill="#FFD046"/>
      </svg>
      <svg style={{ position: "absolute", top: "40%", left: "8%", opacity: 0.12 }} width="22" height="22" viewBox="0 0 22 22">
        <path d="M11 3C11 3 4 8 4 13C4 17 7 19 11 19C15 19 18 17 18 13C18 8 11 3 11 3Z" fill="#FF4D8D"/>
      </svg>
      <svg style={{ position: "absolute", bottom: "20%", right: "6%", opacity: 0.15 }} width="16" height="16" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="#2DCB73"/>
      </svg>
      <svg style={{ position: "absolute", top: "65%", left: "45%", opacity: 0.1 }} width="18" height="18" viewBox="0 0 18 18">
        <path d="M9 1L11 6L17 7L11 9L9 14L7 9L1 7L7 6Z" fill="#FF6B35"/>
      </svg>
      <svg style={{ position: "absolute", bottom: "35%", left: "25%", opacity: 0.12 }} width="12" height="12" viewBox="0 0 12 12">
        <circle cx="6" cy="6" r="5" fill="#FFD046"/>
      </svg>
    </div>
  );
}

/* ── Demo Modal ───────────────────────────────────────── */
const DEMO_STEPS = [
  { emoji: "🏢", title: "NGOs Post Needs", desc: "Organizations submit community needs with location, category, and urgency level.", color: "#6B4EFF" },
  { emoji: "🤖", title: "AI Matches Volunteers", desc: "Our algorithm scores and matches volunteers based on skills, proximity, and urgency.", color: "#FF6B35" },
  { emoji: "📍", title: "Interactive Map View", desc: "See all nearby needs and volunteers on a real-time map with a 50km radius.", color: "#2DCB73" },
  { emoji: "✅", title: "Accept & Complete Tasks", desc: "Volunteers accept tasks with one tap, track progress, and mark them as done.", color: "#FF4D8D" },
  { emoji: "📊", title: "Track Your Impact", desc: "Both NGOs and volunteers can see stats, completed tasks, and community impact.", color: "#FFD046" },
];

function DemoModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open) { setStep(0); setProgress(0); return; }
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setStep((s) => (s + 1) % DEMO_STEPS.length);
          return 0;
        }
        return p + 2;
      });
    }, 80);
    return () => clearInterval(timerRef.current);
  }, [open]);

  if (!open) return null;
  const s = DEMO_STEPS[step];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(26,26,46,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 28, width: "90%", maxWidth: 520, overflow: "hidden", boxShadow: "0 32px 80px rgba(107,78,255,0.25)", animation: "fadeUp 0.35s ease-out" }}>
        {/* Header */}
        <div style={{ background: s.color, padding: "32px 32px 48px", textAlign: "center", position: "relative", transition: "background 0.4s ease" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 99, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} color="white" />
          </button>
          <div style={{ fontSize: 64, marginBottom: 8, animation: "float 2s ease-in-out infinite" }}>{s.emoji}</div>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Step {step + 1} of {DEMO_STEPS.length}</p>
        </div>
        {/* Body */}
        <div style={{ padding: "28px 32px 32px" }}>
          <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 22, color: "#1A1A2E", marginBottom: 8 }}>{s.title}</h3>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, color: "#6B7280", lineHeight: 1.6, marginBottom: 24 }}>{s.desc}</p>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
            {DEMO_STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 32 : 8, height: 8, borderRadius: 4, background: i === step ? s.color : "#E5E7EB", transition: "all 0.3s ease", overflow: "hidden", position: "relative" }}>
                {i === step && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.4)", width: `${progress}%`, transition: "width 0.08s linear" }} />}
              </div>
            ))}
          </div>
          {/* Controls */}
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => { setStep((step - 1 + DEMO_STEPS.length) % DEMO_STEPS.length); setProgress(0); }} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "1.5px solid #E5E7EB", background: "white", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, color: "#6B7280" }}>← Prev</button>
            <button onClick={() => { setStep((step + 1) % DEMO_STEPS.length); setProgress(0); }} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", background: s.color, color: "white", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, transition: "background 0.3s ease" }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Counter Hook ─────────────────────────────────────── */
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

/* ── Feature Card ─────────────────────────────────────── */
function FeatureCard({ emoji, title, description, bg, delay }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: bg,
        borderRadius: 24,
        padding: 36,
        flex: 1,
        minWidth: 260,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.5s ease ${delay}s`,
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 12px 36px rgba(107,78,255,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = visible ? "translateY(0)" : "translateY(30px)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>{emoji}</div>
      <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 20, color: "#1A1A2E", marginBottom: 8 }}>
        {title}
      </h3>
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 15, color: "#6B7280", lineHeight: 1.6 }}>
        {description}
      </p>
    </div>
  );
}

/* ── Stats Section ────────────────────────────────────── */
function StatsSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const vol = useCountUp(2400, 2000, visible);
  const ngo = useCountUp(180, 1800, visible);
  const cities = useCountUp(12, 1200, visible);

  return (
    <section ref={ref} style={{ background: "#6B4EFF", padding: "64px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "center", textAlign: "center" }}>
        {[
          { num: `${vol.toLocaleString()}+`, label: "Volunteers" },
          { num: `${ngo}+`, label: "NGOs served" },
          { num: `${cities}`, label: "Cities covered" },
        ].map((s) => (
          <div key={s.label} style={{ minWidth: 140 }}>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 48, color: "white" }}>{s.num}</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── News Card ───────────────────────────────────────── */
function NewsCard({ item, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: "white", borderRadius: 24, overflow: "hidden", flex: "1 1 280px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.5s ease ${delay}s`,
      }}
    >
      <div style={{ height: 180, overflow: "hidden" }}>
        <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }} />
      </div>
      <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ background: "#EDE9FF", color: "#6B4EFF", padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{item.category}</span>
          <span style={{ color: "#9CA3AF", fontSize: 12, fontWeight: 500 }}>{item.date}</span>
        </div>
        <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 18, color: "#1A1A2E", marginBottom: 10, lineHeight: 1.3 }}>{item.title}</h3>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, color: "#6B7280", lineHeight: 1.6, marginBottom: 20 }}>{item.summary}</p>
        <a href={item.link} style={{ marginTop: "auto", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, color: "#6B4EFF", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          Read More →
        </a>
      </div>
    </div>
  );
}

/* ── Landing Page ─────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#E8F4FD" }} id="landing-page">
      <DemoModal open={showDemo} onClose={() => setShowDemo(false)} />
      {/* ── Navbar ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "white",
          borderBottom: "2px solid #F0F0F0",
          boxShadow: scrolled ? "0 2px 16px rgba(107,78,255,0.08)" : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#6B4EFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 21S4 15 4 9C4 5.5 6.5 3 10 3C11.5 3 12 4 12 4C12 4 12.5 3 14 3C17.5 3 20 5.5 20 9C20 15 12 21 12 21Z" fill="#FF6B35" stroke="#1A1A2E" strokeWidth="1.5"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 20, color: "#1A1A2E" }}>
              VolunteerBridge
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14,
                padding: "8px 22px", borderRadius: 999, border: "2px solid #6B4EFF",
                background: "transparent", color: "#6B4EFF", cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.target.style.background = "#EDE9FF"; }}
              onMouseLeave={(e) => { e.target.style.background = "transparent"; }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14,
                padding: "8px 22px", borderRadius: 999, border: "2px solid #6B4EFF",
                background: "#6B4EFF", color: "white", cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.target.style.background = "#5538E0"; }}
              onMouseLeave={(e) => { e.target.style.background = "#6B4EFF"; }}
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate("/signup/volunteer")}
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14,
                background: "none", border: "none", color: "#FF6B35", cursor: "pointer",
                padding: "8px 4px",
              }}
            >
              Join as Volunteer →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section style={{ position: "relative", padding: "80px 24px 60px", overflow: "hidden" }}>
        <DoodleBackground />
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 40, position: "relative", zIndex: 1 }}>
          {/* Left */}
          <div style={{ flex: "1 1 55%", minWidth: 320 }}>

            {/* Headline */}
            <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
              <span style={{ display: "block", fontSize: "clamp(36px, 5vw, 58px)", color: "#1A1A2E", animation: "fadeUp 0.5s ease-out 0.2s both" }}>
                Volunteer for
              </span>
              <span style={{ display: "block", fontSize: "clamp(36px, 5vw, 58px)", color: "#6B4EFF", position: "relative", animation: "fadeUp 0.5s ease-out 0.4s both" }}>
                What Matters
                <svg
                  style={{ position: "absolute", bottom: -6, left: 0, width: "100%", height: 14, zIndex: -1 }}
                  viewBox="0 0 300 14" preserveAspectRatio="none"
                >
                  <path d="M0 10Q75 0 150 8Q225 16 300 6" stroke="#FFD046" strokeWidth="6" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
              <span style={{ display: "block", fontSize: "clamp(36px, 5vw, 58px)", color: "#1A1A2E", animation: "fadeUp 0.5s ease-out 0.6s both" }}>
                Most. 💛
              </span>
            </h1>

            {/* Sub */}
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 18,
                color: "#6B7280", maxWidth: 480, lineHeight: 1.7, marginBottom: 32,
                animation: "fadeUp 0.5s ease-out 0.7s both",
              }}
            >
              Connect NGOs with skilled volunteers using AI. Prioritize real community needs. Create impact near you.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 32, animation: "fadeUp 0.5s ease-out 0.8s both" }}>
              <button
                onClick={() => navigate("/signup/volunteer")}
                style={{
                  fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 16,
                  padding: "14px 36px", borderRadius: 999, border: "none",
                  background: "#6B4EFF", color: "white", cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.04)";
                  e.target.style.boxShadow = "0 8px 24px rgba(107,78,255,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "none";
                }}
              >
                Get Started Free
              </button>
              <button
                onClick={() => setShowDemo(true)}
                style={{
                  fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 16,
                  padding: "14px 36px", borderRadius: 999, border: "2px solid #1A1A2E",
                  background: "white", color: "#1A1A2E", cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { e.target.style.background = "#EDE9FF"; }}
                onMouseLeave={(e) => { e.target.style.background = "white"; }}
              >
                Watch Demo ▶️
              </button>
            </div>

            {/* Social proof */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, animation: "fadeUp 0.5s ease-out 0.9s both" }}>
              <div style={{ display: "flex" }}>
                {["#6B4EFF", "#FF6B35", "#2DCB73"].map((bg, i) => (
                  <div
                    key={i}
                    style={{
                      width: 36, height: 36, borderRadius: "50%", background: bg,
                      border: "3px solid white", marginLeft: i > 0 ? -10 : 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: "white",
                    }}
                  >
                    {["A", "K", "R"][i]}
                  </div>
                ))}
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 14, color: "#6B7280" }}>
                Join 2,400+ volunteers already helping
              </span>
            </div>
          </div>

          {/* Right - Illustration */}
          <div style={{ flex: "1 1 40%", minWidth: 280, animation: "float 4s ease-in-out infinite" }}>
            <HeroIllustration />
          </div>
        </div>
      </section>


      {/* ── Stats ── */}
      <StatsSection />

      {/* ── News Section ── */}
      <section style={{ padding: "80px 24px", background: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: "clamp(28px, 4vw, 40px)", color: "#1A1A2E", textAlign: "center", marginBottom: 12 }}>
            Community Impact News 🗞️
          </h2>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, color: "#6B7280", textAlign: "center", marginBottom: 48 }}>
            Stay updated with the latest trends and stories in the global NGO sector
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            {NGO_NEWS.map((news, i) => (
              <NewsCard key={news.id} item={news} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial / CTA ── */}
      <section style={{ background: "#FFFBEA", padding: "64px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "clamp(20px, 3vw, 28px)", color: "#1A1A2E", fontStyle: "italic", lineHeight: 1.5, marginBottom: 16 }}>
            "We matched 40 volunteers in one day. VolunteerBridge changed how we operate."
          </p>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 14, color: "#6B7280", marginBottom: 32 }}>
            — Priya S., NGO Coordinator, Bangalore
          </p>
          <button
            onClick={() => navigate("/signup/volunteer")}
            style={{
              fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 16,
              padding: "14px 36px", borderRadius: 999, border: "none",
              background: "#FF6B35", color: "white", cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.04)";
              e.target.style.boxShadow = "0 8px 24px rgba(255,107,53,0.35)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
          >
            Start for Free →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#1A1A2E", padding: "32px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
          © 2026 VolunteerBridge. Made with 💛 for communities everywhere.
        </p>
      </footer>

      {/* ── Chatbot ── */}
      <Chatbot />
    </div>
  );
}
