import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Briefcase, 
  Presentation, 
  GraduationCap, 
  Rocket, 
  Award, 
  Trophy,
  Compass,
  Cpu,
  Zap,
  Play
} from "lucide-react";

export default function LandingPage() {
  const useCases = [
    {
      category: "Job Interview",
      text: "System design at Google in 4 days",
      icon: <Briefcase className="w-5 h-5 text-indigo-400" />
    },
    {
      category: "Business Presentation",
      text: "Board meeting pitch in 2 days",
      icon: <Presentation className="w-5 h-5 text-purple-400" />
    },
    {
      category: "Academic Exam",
      text: "ML final exam in 5 days",
      icon: <GraduationCap className="w-5 h-5 text-teal-400" />
    },
    {
      category: "Product Launch",
      text: "App demo to investors Fri",
      icon: <Rocket className="w-5 h-5 text-pink-400" />
    },
    {
      category: "Certification",
      text: "AWS Solutions Architect next Mon",
      icon: <Award className="w-5 h-5 text-yellow-400" />
    },
    {
      category: "Hackathon / Competition",
      text: "Hackathon submission in 3 days",
      icon: <Trophy className="w-5 h-5 text-orange-400" />
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Describe",
      subtitle: "Your Deadline",
      description: "Input your target timeline and goals in natural language."
    },
    {
      number: "2",
      title: "AI Agents",
      subtitle: "Analyze & Build Plan",
      description: "Our pipeline reverse-engineers a strategic milestone roadmap."
    },
    {
      number: "3",
      title: "Smart Actions",
      subtitle: "Generated",
      description: "Receive focused checklists and action guides tailored to each day."
    },
    {
      number: "4",
      title: "Act",
      subtitle: "Execute w/ Google",
      description: "Seamlessly push tasks and events to Gmail, Calendar, and Docs."
    }
  ];

  const googleProducts = [
    {
      name: "Gmail",
      color: "from-red-500 to-rose-600",
      svg: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" fill="#EA4335" />
          <path d="M22 6V18C22 19.1 21.1 20 20 20H18V8L12 12L6 8V20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4H4.5L12 9.5L19.5 4H20C21.1 4 22 4.9 22 6Z" fill="#EA4335" />
          <path d="M12 13L20 7V6L12 12L4 6V7L12 13Z" fill="#F4B400" />
          <path d="M20 4H18V8L12 12L6 8V4H4C2.9 4 2 4.9 2 6V7.5L12 14L22 7.5V6C22 4.9 21.1 4 20 4Z" fill="#4285F4" />
          <path d="M2 18V6C2 4.9 2.9 4 4 4H6V16.5L12 12.5L18 16.5V4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18Z" fill="#34A853" />
        </svg>
      )
    },
    {
      name: "Calendar",
      color: "from-blue-500 to-indigo-600",
      svg: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM19 7H5V6H19V7Z" fill="#4285F4" />
          <rect x="7" y="11" width="2" height="2" fill="#4285F4" />
          <rect x="11" y="11" width="2" height="2" fill="#4285F4" />
          <rect x="15" y="11" width="2" height="2" fill="#4285F4" />
          <rect x="7" y="15" width="2" height="2" fill="#4285F4" />
          <rect x="11" y="15" width="2" height="2" fill="#4285F4" />
          <rect x="15" y="15" width="2" height="2" fill="#4285F4" />
        </svg>
      )
    },
    {
      name: "Meet",
      color: "from-emerald-500 to-green-600",
      svg: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H16C17.1 20 18 19.1 18 18V14L22 18V6L18 10V6C18 4.9 17.1 4 16 4Z" fill="#0F9D58" />
          <path d="M15 11H9V13H15V11Z" fill="white" />
        </svg>
      )
    },
    {
      name: "Docs",
      color: "from-blue-400 to-sky-600",
      svg: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="#4285F4" />
        </svg>
      )
    },
    {
      name: "Slides",
      color: "from-amber-400 to-yellow-500",
      svg: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM17 12H7V10H17V12ZM14 16H7V14H14V16ZM17 8H7V6H17V8Z" fill="#F4B400" />
        </svg>
      )
    }
  ];

  const handleSeeHowItWorksClick = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="landing-page-root" className="w-full max-w-5xl mx-auto px-6 py-12 flex flex-col gap-24 relative z-10">
      
      {/* HERO SECTION */}
      <section id="hero-section" className="text-center flex flex-col items-center justify-center pt-8 pb-4">
        <h1 
          id="hero-heading"
          className="text-white tracking-tight leading-tight mb-6 text-center max-w-3xl"
          style={{
            fontSize: "44px",
            fontWeight: 700,
            letterSpacing: "-0.02em"
          }}
        >
          Plan anything. Prepare for everything.
        </h1>
        <p 
          id="hero-subtitle"
          className="text-center mx-auto mb-10 leading-relaxed"
          style={{
            fontSize: "16px",
            color: "#a1a1aa",
            maxWidth: "560px"
          }}
        >
          AI-powered execution engine that builds, adapts, and executes your strategy across Gmail, Calendar, Docs & more.
        </p>

        <div id="hero-ctas" className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            id="hero-get-started-btn"
            to="/signup"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm tracking-wide shadow-lg shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center gap-2 hover:translate-y-[-1px]"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            id="hero-scroll-btn"
            onClick={handleSeeHowItWorksClick}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-300 text-sm font-semibold flex items-center justify-center gap-2"
          >
            See How It Works
            <Play className="w-3.5 h-3.5 rotate-90" />
          </button>
        </div>
      </section>

      {/* USE CASES GRID */}
      <section id="use-cases-section" className="flex flex-col gap-10">
        <div id="use-cases-header" className="text-center max-w-xl mx-auto">
          <h2 id="use-cases-title" className="text-2xl font-bold text-white mb-2">Engineered for Any Deadline</h2>
          <p id="use-cases-desc" className="text-slate-400 text-sm">Whether you have weeks or just days, PrepPilot structures your journey to success.</p>
        </div>

        <div id="use-cases-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              id={`use-case-card-${index}`}
              className="group rounded-xl p-6 transition-all duration-300 hover:translate-y-[-2px]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(124,106,239,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              <div id={`use-case-header-${index}`} className="flex items-center gap-3 mb-4">
                <div id={`use-case-icon-wrapper-${index}`} className="p-2 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.08] transition-all">
                  {useCase.icon}
                </div>
                <span id={`use-case-category-${index}`} className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
                  {useCase.category}
                </span>
              </div>
              <p id={`use-case-text-${index}`} className="text-slate-200 text-[15px] font-medium leading-relaxed">
                &ldquo;{useCase.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="flex flex-col gap-12 pt-6">
        <div id="how-it-works-header" className="text-center max-w-xl mx-auto">
          <h2 id="how-it-works-title" className="text-2xl font-bold text-white mb-2">How It Works</h2>
          <p id="how-it-works-desc" className="text-slate-400 text-sm">From simple description to direct workspace action in seconds.</p>
        </div>

        <div id="how-it-works-container" className="relative">
          {/* Horizontal connecting line (hidden on mobile) */}
          <div id="how-it-works-line" className="hidden md:block absolute top-[28px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/30 to-teal-500/20 z-0" />

          <div id="how-it-works-steps-grid" className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} id={`how-it-works-step-${index}`} className="flex flex-col items-center text-center">
                <div 
                  id={`how-it-works-circle-${index}`}
                  className="w-14 h-14 rounded-full bg-slate-900 border border-slate-700 flex flex-col items-center justify-center mb-5 shadow-lg shadow-indigo-500/5 relative group-hover:border-indigo-400 transition-colors"
                >
                  <span id={`how-it-works-step-num-${index}`} className="text-slate-400 text-xs font-mono font-bold">STEP</span>
                  <span id={`how-it-works-step-val-${index}`} className="text-white text-base font-bold leading-tight font-mono">{step.number}</span>
                </div>

                <h3 id={`how-it-works-step-title-wrapper-${index}`} className="text-white font-bold text-base leading-snug">
                  {step.title}
                </h3>
                <span id={`how-it-works-step-subtitle-${index}`} className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2 block">
                  {step.subtitle}
                </span>
                <p id={`how-it-works-step-desc-${index}`} className="text-slate-400 text-xs px-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GOOGLE INTEGRATIONS BAR */}
      <section id="google-integrations" className="rounded-2xl p-8 bg-white/[0.02] border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div id="google-gradient-overlay" className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
        
        <div id="google-text-col" className="flex flex-col gap-1.5 max-w-sm text-center md:text-left">
          <div id="google-badge" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold tracking-wider uppercase justify-center md:justify-start">
            <Cpu className="w-3.5 h-3.5" />
            Workspace Connect
          </div>
          <h3 id="google-title" className="text-lg font-bold text-white">Works with your Google Workspace</h3>
          <p id="google-desc" className="text-slate-400 text-xs">Authorize once to coordinate tasks directly with your primary productivity stack.</p>
        </div>

        <div id="google-products-row" className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          {googleProducts.map((product, index) => (
            <div key={index} id={`google-prod-${product.name.toLowerCase()}`} className="flex flex-col items-center gap-2">
              <div id={`google-icon-${product.name.toLowerCase()}`} className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300">
                {product.svg}
              </div>
              <span id={`google-label-${product.name.toLowerCase()}`} className="text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono">
                {product.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="cta-section" className="text-center py-6 border-t border-white/5">
        <h2 id="cta-title" className="text-white text-3xl font-bold tracking-tight mb-3">Ready to execute smarter?</h2>
        <p id="cta-desc" className="text-slate-400 text-sm max-w-md mx-auto mb-8">
          Take control of your timeline with automated strategies, targeted actions, and deep workspace sync.
        </p>
        <Link
          id="cta-signup-btn"
          to="/signup"
          className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 hover:translate-y-[-1px] gap-2"
        >
          Sign Up Free
          <ArrowRight className="w-4.5 h-4.5" />
        </Link>
      </section>

    </div>
  );
}
