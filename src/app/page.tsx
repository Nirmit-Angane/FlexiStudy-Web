"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ArrowRight, CheckCircle2, Star, Users, Brain, Zap, Globe, ChevronDown, Gamepad2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   SPLASH SCREEN COMPONENT
───────────────────────────────────────────────────────────── */
function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const content = (
    <div style={{ textAlign: "center" }}>
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(3.5rem, 12vw, 8rem)",
        fontWeight: 900,
        color: "#1C1F27",
        letterSpacing: "-0.05em",
        margin: 0,
        lineHeight: 1,
      }}>
        FlexiStudy
      </h1>
      <p style={{
        fontSize: "13px",
        color: "#3D8B71",
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        marginTop: "28px",
        fontWeight: 800,
      }}>
        AI-powered adaptive learning lessons
      </p>
    </div>
  );

  return (
    <motion.div
      key="splash-screen-root"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: "none" }}
      transition={{ duration: 1.2, ease: [0.45, 0, 0.55, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        cursor: "pointer",
        pointerEvents: "auto",
      }}
      onClick={onEnter}
    >
      {/* Top Half */}
      <motion.div
        initial={{ y: 0 }}
        exit={{ y: "-100%" }}
        transition={{ duration: 1.2, ease: [0.85, 0, 0.15, 1] }}
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, height: "50%",
          background: "#FAF8F4",
          zIndex: 5,
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          borderBottom: "1px solid rgba(61, 139, 113, 0.15)",
        }}
      >
        <div style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
        }}>
          {content}
        </div>
        {/* Grid for top */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(61, 139, 113, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(61, 139, 113, 0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
          zIndex: -1,
        }} />
      </motion.div>

      {/* Bottom Half */}
      <motion.div
        initial={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 1.2, ease: [0.85, 0, 0.15, 1] }}
        style={{
          position: "absolute",
          top: "50%", left: 0, right: 0, height: "50%",
          background: "#FAF8F4",
          zIndex: 5,
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          borderTop: "1px solid rgba(61, 139, 113, 0.15)",
        }}
      >
        <div style={{
          position: "absolute",
          top: "0%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
        }}>
          {content}
        </div>
        {/* Grid for bottom */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(61, 139, 113, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(61, 139, 113, 0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
          zIndex: -1,
        }} />
      </motion.div>

      {/* Horizontal Glow Line */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "100%", opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "circOut" }}
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, #3D8B71, #56C99A, #3D8B71, transparent)",
          boxShadow: "0 0 15px rgba(61, 139, 113, 0.3)",
          zIndex: 10,
          transform: "translateY(-50%)",
        }}
      />

      {/* Scroll Hint */}
      <motion.div
        exit={{ opacity: 0 }}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        style={{
          position: "absolute",
          bottom: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          color: "rgba(28, 31, 39, 0.4)",
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.15em" }}>SCROLL TO REVEAL</span>
        <ChevronDown size={18} />
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    // If we're already entered, we don't need these listeners
    if (isEntered) {
      document.body.style.overflow = "unset";
      return;
    }

    // Lock scroll to prevent background movement while splash is active
    document.body.style.overflow = "hidden";

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 10) {
        setIsEntered(true);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      if (touchStartY - touchY > 30) {
        setIsEntered(true);
      }
    };

    window.addEventListener("wheel", handleWheel);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      document.body.style.overflow = "unset";
    };
  }, [isEntered]);

  return (
    <div className="flex flex-col min-h-screen">
      <AnimatePresence mode="wait">
        {!isEntered && <SplashScreen key="splash-screen" onEnter={() => setIsEntered(true)} />}
      </AnimatePresence>

      {/* --- Navigation --- */}
      <header className="ds-header justify-between">
        <div className="ds-logo">
          <div className="ds-logo-icon">
            <BookOpen size={18} />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight">FlexiStudy</span>
        </div>

        <nav className="ds-nav hidden md:flex">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#testimonials">Testimonials</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className="btn btn-ghost btn-sm font-semibold hidden sm:inline-flex">
            Log In
          </Link>
          <Link href="/login" className="btn btn-primary btn-sm px-3 sm:px-5">
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* --- Hero Section --- */}
        <section className="ds-hero overflow-hidden">
          <div className="ds-container grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left duration-1000">
              <div className="ds-hero-eyebrow">
                <span className="ds-hero-dot" />
                Empowering the future of learning
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight mb-4 sm:mb-6">
                Master any skill with <span>Adaptive Learning.</span>
              </h1>
              <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8 leading-relaxed">
                FlexiStudy uses AI-driven technology to personalize your education.
                Whether it&apos;s complex science or creative arts, we adapt to YOUR pace,
                style, and goals.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link href="/login" className="btn btn-primary btn-xl group">
                  Start Learning Free
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
                <Link href="/login" className="btn btn-secondary btn-xl">
                  Watch Demo
                </Link>
              </div>

              <div className="mt-8 sm:mt-10 flex items-center gap-4 sm:gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-bg-elevated flex items-center justify-center overflow-hidden">
                      <Image
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        alt="User"
                        width={40}
                        height={40}
                      />
                    </div>
                  ))}
                </div>
                <div className="text-xs sm:text-sm">
                  <div className="flex items-center text-yellow-500 mb-0.5">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-text-muted font-medium">Trusted by 2,500+ students</p>
                </div>
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-right duration-1000">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white/20">
                <Image
                  src="/hero.png"
                  alt="FlexiStudy Dashboard"
                  width={600}
                  height={500}
                  className="w-full h-auto cover"
                  priority
                />
              </div>
              {/* Decorative Blobs */}
              <div className="absolute -top-10 -right-10 sm:-top-20 sm:-right-20 w-40 sm:w-64 h-40 sm:h-64 bg-brand-primary/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 sm:-bottom-20 sm:-left-20 w-52 sm:w-80 h-52 sm:h-80 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </section>

        {/* --- Stats Section --- */}
        <section id="how-it-works" className="py-8 sm:py-12 bg-white border-y border-border-default">
          <div className="ds-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {[
                { label: "Active Learners", value: "48K+", icon: Users, color: "text-brand-primary" },
                { label: "Courses Available", value: "200+", icon: BookOpen, color: "text-blue-500" },
                { label: "Success Rate", value: "94%", icon: Zap, color: "text-amber-500" },
                { label: "AI Interactions", value: "1.2M", icon: Brain, color: "text-purple-500" }
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center text-center p-3 sm:p-6 rounded-xl hover:bg-bg-page transition-colors">
                  <div className={`p-2 sm:p-3 rounded-lg mb-2 sm:mb-4 bg-bg-elevated ${stat.color}`}>
                    <stat.icon size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-text-muted font-semibold uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Features --- */}
        <section id="features" className="ds-section py-12 sm:py-16 md:py-24 bg-bg-page">
          <div className="ds-container text-center mb-8 sm:mb-12 md:mb-16">
            <div className="ds-section-label justify-center">Tailored for you</div>
            <h2 className="ds-section-title text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">Why choose FlexiStudy?</h2>
            <p className="ds-section-desc mx-auto">
              Traditional education is one-size-fits-all. We believe learning should be active, engaging, and personal.
            </p>
          </div>

          <div className="ds-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                title: "Personalized Roadmap",
                desc: "Our AI analyzes your strength and weaknesses to create a custom curriculum that evolves with you.",
                icon: Brain,
                color: "bg-purple-100 text-purple-600"
              },
              {
                title: "Smart Flashcards",
                desc: "Retain 90% of what you learn using space-repetition algorithms designed for long-term memory.",
                icon: Zap,
                color: "bg-amber-100 text-amber-600"
              },
              {
                title: "Global Community",
                desc: "Connect with peers worldwide, share resources, and participate in collaborative study sessions.",
                icon: Globe,
                color: "bg-blue-100 text-blue-600"
              },
              {
                title: "FlexiQuest RPG",
                desc: "Play an immersive isometric RPG where you complete missions by solving educational challenges in Kenney City.",
                icon: Gamepad2,
                color: "bg-emerald-100 text-emerald-600"
              }
            ].map((feature, idx) => (
              <Link href="/login" key={idx} className="card p-5 sm:p-6 md:p-8 hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-sm ${feature.color}`}>
                  <feature.icon size={24} className="sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>
                <div className="mt-4 sm:mt-6 flex items-center text-brand-primary font-bold text-sm group">
                  Learn more <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section id="testimonials" className="ds-container py-12 sm:py-16 md:py-24">
          <div className="bg-brand-primary rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-20 text-center relative overflow-hidden shadow-2xl">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full blur-3xl -mr-20 sm:-mr-32 -mt-20 sm:-mt-32" />
            <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-black/5 rounded-full blur-2xl -ml-16 sm:-ml-24 -mb-16 sm:-mb-24" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-white text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight">
                Ready to transform your learning experience?
              </h2>
              <p className="text-white/80 text-base sm:text-lg mb-6 sm:mb-10">
                Join thousands of students who are already mastering new skills with FlexiStudy.
                Start your 14-day free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/login" className="bg-white text-brand-primary btn btn-xl font-bold hover:bg-bg-elevated transition-colors">
                  Get Started for Free
                </Link>
                <Link href="/login" className="btn btn-xl border-2 border-white/30 text-white hover:bg-white/10 transition-colors">
                  Contact Sales
                </Link>
              </div>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-white/60 text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} /> No credit card required</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} /> Cancel anytime</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-bg-dark text-white py-10 sm:py-16">
        <div className="ds-container grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="ds-logo-icon">
                <BookOpen size={16} />
              </div>
              <span className="font-bold text-lg sm:text-xl tracking-tight">FlexiStudy</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed mb-4 sm:mb-6">
              Making high-quality education accessible and personalized for everyone, everywhere.
            </p>
            <div className="flex gap-4">
              {/* Social icons placeholders */}
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors" />
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors" />
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 sm:mb-6 text-sm sm:text-base">Product</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm text-text-muted">
              <li><Link href="/login" className="hover:text-white transition-colors">Explore Courses</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Adaptive AI</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Flashcards</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 sm:mb-6 text-sm sm:text-base">Company</h4>
            <ul className="space-y-3 sm:space-y-4 text-sm text-text-muted">
              <li><Link href="/login" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Privacy</Link></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h4 className="font-bold mb-4 sm:mb-6 text-sm sm:text-base">Newsletter</h4>
            <p className="text-sm text-text-muted mb-4">Stay updated with the latest in EdTech.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                suppressHydrationWarning
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm flex-1 min-w-0 focus:outline-none focus:border-brand-primary"
              />
              <button className="bg-brand-primary p-2 rounded-lg hover:bg-brand-primary-dark transition-colors shrink-0">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="ds-container mt-10 sm:mt-16 pt-6 sm:pt-8 border-top border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs text-text-muted font-medium">
          <p>© 2024 FlexiStudy Inc. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-8 flex-wrap justify-center">
            <Link href="/login" className="hover:text-white">Terms of Service</Link>
            <Link href="/login" className="hover:text-white">Privacy Policy</Link>
            <Link href="/login" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
