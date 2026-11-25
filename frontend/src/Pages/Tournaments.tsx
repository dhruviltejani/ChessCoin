import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BarChart2,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Lock,
  Menu,
  Shield,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import Sidebar from "../components/Sidebar/Sidebar";

// --- SUB-COMPONENTS & SPARKLINE ---

const EarningsSparkline: React.FC = () => (
  <div className="w-full pt-3">
    <svg viewBox="0 0 280 65" className="w-full h-14 overflow-visible">
      <defs>
        <linearGradient id="tourney-earnings-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
        </linearGradient>
        <filter id="tourney-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Subtle area below curve */}
      <path
        d="M 5,52 C 55,50 95,46 135,38 C 175,30 215,20 275,12 L 275,65 L 5,65 Z"
        fill="url(#tourney-earnings-grad)"
      />
      {/* Sparkline curve */}
      <path
        d="M 5,52 C 55,50 95,46 135,38 C 175,30 215,20 275,12"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#tourney-glow)"
      />
      {/* End animated pulsing dot */}
      <circle cx="275" cy="12" r="5" fill="#f59e0b" fillOpacity="0.4" className="animate-ping" />
      <circle cx="275" cy="12" r="3.5" fill="#fbbf24" />
    </svg>
  </div>
);

// --- MAIN TOURNAMENTS PAGE COMPONENT ---

export const Tournaments: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "live" | "upcoming" | "high-stakes">("all");
  const [sortBy, setSortBy] = useState<"start-time" | "prize" | "entry">("start-time");
  const [sortDropdownOpen, setSortDropdownOpen] = useState<boolean>(false);

  // Modal and toast states for full interactivity
  const [notification, setNotification] = useState<string | null>(null);
  const [registeredTournaments, setRegisteredTournaments] = useState<string[]>([
    "Rapid Masters Open",
  ]);
  const [activeModal, setActiveModal] = useState<{
    type: "register" | "lobby" | "spectate" | null;
    title?: string;
    details?: string;
    fee?: string;
    matchup?: { white: string; black: string; board: number };
  }>({ type: null });

  // Countdown timer for Featured Arena (starts at 01h 42m 18s)
  const [countdown, setCountdown] = useState({ hours: 1, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Clear toast after 4s
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // Extract user details from location state or default
  const state = location.state as {
    user?: { displayName?: string; handle?: string; email?: string; avatarUrl?: string };
    displayName?: string;
    registeredHandle?: string;
  } | null;

  const displayName =
    state?.user?.displayName || state?.displayName || "Dhruvil";
  const rawHandle =
    state?.user?.handle || state?.registeredHandle || "dhruvil";
  const handle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
  const avatarUrl = state?.user?.avatarUrl;

  const user = {
    name: displayName,
    handle,
    avatarUrl,
  };

  const handleRegister = (tourneyName: string, feeStr: string) => {
    if (registeredTournaments.includes(tourneyName)) {
      setNotification(`You are already registered for ${tourneyName}!`);
      return;
    }
    setActiveModal({
      type: "register",
      title: tourneyName,
      fee: feeStr,
      details: "Official FairPlay & Escrow prize pool guaranteed.",
    });
  };

  const confirmRegistration = () => {
    if (activeModal.title) {
      setRegisteredTournaments((prev) => [...prev, activeModal.title!]);
      setNotification(`🎉 Successfully registered for ${activeModal.title}! Board seat reserved.`);
    }
    setActiveModal({ type: null });
  };

  const handleSidebarClick = (id: string) => {
    const target = id.toLowerCase();
    if (target === "tournaments") return;
    if (target === "home") {
      navigate("/dashboard", { state: location.state });
      return;
    }
    navigate(`/${target}`, { state: location.state });
  };

  return (
    <div className="flex h-screen w-full bg-[#07090e] text-white overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      {/* Desktop Sidebar (Fixed on left) */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          activeItem="tournaments"
          onItemClick={handleSidebarClick}
          user={user}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform md:hidden transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close Sidebar"
            className="absolute top-4 right-3 text-zinc-400 hover:text-white z-50 p-1.5 rounded-lg bg-zinc-800/80 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar
            activeItem="tournaments"
            onItemClick={(id) => {
              handleSidebarClick(id);
              setMobileSidebarOpen(false);
            }}
            user={user}
          />
        </div>
      </div>

      {/* Main Content Area (Scrollable to the right of sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Top Navbar */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-[#080b11] sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open Sidebar"
            className="p-2 rounded-xl border border-zinc-800 bg-[#121622] text-zinc-300 hover:text-white cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-white tracking-wider text-base">
            CHESS<span className="text-cyan-400">COIN</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-[#00bcd4] flex items-center justify-center text-zinc-950 font-bold text-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Inner Page Container */}
        <div className="p-4 sm:p-6 lg:p-7 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Notification Toast */}
          {notification && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3.5 text-xs sm:text-sm text-cyan-300 shadow-lg shadow-cyan-500/10 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan-400" />
                <span className="font-medium">{notification}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. HEADER SECTION */}
          {/* ========================================================= */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              <span className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase">
                COMPETITIVE ESPORTS ARENA
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              TOURNAMENTS
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Compete in scheduled arenas, Swiss brackets, and knockout cups to earn cash prizes in Rupees (₹), build your tournament passport, and climb the competitive rankings.
            </p>
          </div>

          {/* ========================================================= */}
          {/* 2. FEATURED TOURNAMENT BANNER (HERO CARD) */}
          {/* ========================================================= */}
          <section className="rounded-2xl sm:rounded-3xl bg-[#0c101a]/95 border border-zinc-800/80 p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-zinc-700/90">
            {/* Background Ambient Glows */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-amber-500/10 blur-[80px]" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-60 w-60 rounded-full bg-cyan-500/10 blur-[80px]" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Column: Badges, Title, Format, Capacity */}
              <div className="space-y-3.5 flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/35 text-amber-400 uppercase tracking-wider shadow-sm shadow-amber-500/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    FEATURED GRANDMASTER ARENA
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 shadow-sm shadow-emerald-500/10">
                    <Shield className="h-3 w-3 stroke-[2.2]" />
                    FairPlay Shield
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-zinc-800/90 border border-zinc-700/70 text-zinc-300">
                    <Lock className="h-3 w-3 text-zinc-400" />
                    Escrow
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wide">
                  Weekend Grandmaster Blitz Invitational IV
                </h2>

                {/* Format & Entry Fee */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141a29] border border-cyan-500/30 text-cyan-300 font-semibold shadow-inner">
                    <Zap className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400/20" />
                    Blitz 3+2
                  </span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-300 font-medium">
                    Entry: <strong className="text-white">₹100</strong>
                  </span>
                </div>

                {/* Capacity Progress */}
                <div className="pt-2 max-w-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Capacity: 184/256</span>
                    <span className="font-bold text-amber-400">72%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800/90 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-sm shadow-amber-500/40 transition-all duration-500"
                      style={{ width: "72%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Prize Pool, Countdown & Register Button */}
              <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center lg:items-center gap-6 shrink-0 lg:pl-6 lg:border-l lg:border-zinc-800/80">
                {/* Prize Pool */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    PRIZE POOL
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight mt-0.5">
                    ₹50,000
                  </div>
                </div>

                {/* Starts In Countdown */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    STARTS IN
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                    <div className="px-2 py-1 rounded-lg bg-[#141824] border border-zinc-700/80 text-white min-w-[34px] text-center shadow-inner">
                      {String(countdown.hours).padStart(2, "0")}h
                    </div>
                    <span className="text-zinc-500 font-bold">:</span>
                    <div className="px-2 py-1 rounded-lg bg-[#141824] border border-zinc-700/80 text-white min-w-[34px] text-center shadow-inner">
                      {String(countdown.minutes).padStart(2, "0")}m
                    </div>
                    <span className="text-zinc-500 font-bold">:</span>
                    <div className="px-2 py-1 rounded-lg bg-[#141824] border border-zinc-700/80 text-cyan-400 min-w-[34px] text-center shadow-inner">
                      {String(countdown.seconds).padStart(2, "0")}s
                    </div>
                  </div>
                </div>

                {/* Register CTA Button */}
                <button
                  type="button"
                  onClick={() =>
                    handleRegister(
                      "Weekend Grandmaster Blitz Invitational IV",
                      "₹100"
                    )
                  }
                  className="px-6 py-3 rounded-xl bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition cursor-pointer self-stretch sm:self-auto justify-center"
                >
                  <Trophy className="h-4 w-4 stroke-[2.2]" />
                  <span>
                    {registeredTournaments.includes("Weekend Grandmaster Blitz Invitational IV")
                      ? "Registered ✓"
                      : "Register"}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 3. MY ENROLLED TOURNAMENTS SECTION */}
          {/* ========================================================= */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bookmark className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
                <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                  MY ENROLLED TOURNAMENTS
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  {registeredTournaments.length} ACTIVE
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setNotification("Viewing all currently enrolled tournaments.")
                }
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition"
              >
                <span>VIEW ALL ENROLLED</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Enrolled Card */}
            <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 hover:border-zinc-700/80 p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-lg transition-all duration-200">
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                {/* Trophy Inset Icon */}
                <div className="w-12 h-12 rounded-2xl bg-[#111624] border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/10">
                  <Trophy className="h-6 w-6 text-cyan-400" />
                </div>

                <div className="space-y-1.5 min-w-0">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      REGISTERED
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                      <Clock className="h-3 w-3" />
                      Check-In in 3h 45m
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800/80 border border-zinc-700/60 text-zinc-400">
                      <Lock className="h-3 w-3" />
                      Escrow Locked
                    </span>
                  </div>

                  {/* Title & Board details */}
                  <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-bold text-white">
                    <span>Rapid Masters Open</span>
                    <span className="text-zinc-500 text-xs font-normal">•</span>
                    <span className="text-zinc-400 text-xs font-medium">10+0 Rapid</span>
                    <span className="text-zinc-500 text-xs font-normal">•</span>
                    <span className="text-amber-400 text-xs font-bold">Seat #41</span>
                    <span className="text-zinc-500 text-xs font-normal">•</span>
                    <span className="text-zinc-400 text-xs font-medium">Board #14</span>
                  </div>

                  {/* Pricing & Timing */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span>
                      Prize Pool: <strong className="text-zinc-200">₹12,000</strong>
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span>
                      Entry Fee: <strong className="text-emerald-400">₹25 Paid</strong>
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-cyan-400 font-medium inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Starts Today 18:00 UTC (in 4h 15m)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal({
                      type: "lobby",
                      title: "Rapid Masters Open",
                      details: "Tournament Lobby • Seat #41 • Board #14",
                    })
                  }
                  className="px-4 py-2 rounded-xl border border-zinc-700/80 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                >
                  Lobby Details
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveModal({
                      type: "lobby",
                      title: "Rapid Masters Open",
                      details: "Opening official tournament room lobby...",
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 hover:bg-[#00bcd4] hover:text-zinc-950 text-cyan-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Open Lobby</span>
                </button>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 4. FILTER TABS BAR */}
          {/* ========================================================= */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[#00bcd4] text-zinc-950 shadow-md shadow-cyan-500/20"
                  : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>All Tournaments</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("live")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                activeFilter === "live"
                  ? "bg-[#00bcd4] text-zinc-950 font-bold shadow-md shadow-cyan-500/20"
                  : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              <span>Live Now</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeFilter === "live"
                    ? "bg-zinc-950 text-cyan-300"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                4
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("upcoming")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                activeFilter === "upcoming"
                  ? "bg-[#00bcd4] text-zinc-950 font-bold shadow-md shadow-cyan-500/20"
                  : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Upcoming</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeFilter === "upcoming"
                    ? "bg-zinc-950 text-cyan-300"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                12
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("high-stakes")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                activeFilter === "high-stakes"
                  ? "bg-[#00bcd4] text-zinc-950 font-bold shadow-md shadow-cyan-500/20"
                  : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>High Stakes</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeFilter === "high-stakes"
                    ? "bg-zinc-950 text-amber-300"
                    : "bg-zinc-800 text-amber-400"
                }`}
              >
                5
              </span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* 5. MAIN TWO-COLUMN SECTION */}
          {/* Left Column: Live + Upcoming | Right Column: Tournament Stats */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* LEFT / CENTER COLUMN (8 of 12 cols on desktop) */}
            <div className="xl:col-span-8 space-y-6">
              {/* --- SECTION A: LIVE TOURNAMENTS --- */}
              {(activeFilter === "all" || activeFilter === "live") && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                    <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                      LIVE TOURNAMENTS
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Live Card 1: Flash Bullet Blitz #841 */}
                    <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 hover:border-zinc-700/80 p-4.5 flex flex-col justify-between shadow-lg transition-all duration-200 group">
                      <div>
                        {/* Top row */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            ROUND 4/7
                          </span>
                          <span className="text-xs font-bold text-amber-400">
                            ₹5,000 Pool
                          </span>
                        </div>

                        {/* Title & Format */}
                        <h3 className="text-base font-bold text-white tracking-wide mt-2.5">
                          Flash Bullet Blitz #841
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          1+0 Bullet • Single Elimination • 64 players left
                        </p>

                        {/* Live Matchup Box */}
                        <div className="rounded-xl bg-[#080b11] border border-zinc-800/80 p-3 my-3.5 flex items-center justify-between text-xs font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-zinc-200">GM Alexov (2610)</span>
                          </div>
                          <span className="text-zinc-500 font-bold text-[11px]">vs</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-200">IM Chen (2490)</span>
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          </div>
                        </div>
                      </div>

                      {/* Footer: Viewers & Spectate */}
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-zinc-500" />
                          342 watching
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveModal({
                              type: "spectate",
                              title: "Flash Bullet Blitz #841",
                              matchup: {
                                white: "GM Alexov (2610)",
                                black: "IM Chen (2490)",
                                board: 1,
                              },
                            })
                          }
                          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition"
                        >
                          <span>Spectate Board 1</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Live Card 2: Midnight Blitz Knockout */}
                    <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 hover:border-zinc-700/80 p-4.5 flex flex-col justify-between shadow-lg transition-all duration-200 group">
                      <div>
                        {/* Top row */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            QUARTERFINALS
                          </span>
                          <span className="text-xs font-bold text-amber-400">
                            ₹8,500 Pool
                          </span>
                        </div>

                        {/* Title & Format */}
                        <h3 className="text-base font-bold text-white tracking-wide mt-2.5">
                          Midnight Blitz Knockout
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          3+0 Blitz • Bracket Arena • 8/128 Active
                        </p>

                        {/* Live Matchup Box */}
                        <div className="rounded-xl bg-[#080b11] border border-zinc-800/80 p-3 my-3.5 flex items-center justify-between text-xs font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-zinc-200">WGM Larsson (2340)</span>
                          </div>
                          <span className="text-zinc-500 font-bold text-[11px]">vs</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-200">T. Nakamura Jr (2415)</span>
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          </div>
                        </div>
                      </div>

                      {/* Footer: Viewers & Spectate */}
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-zinc-500" />
                          142 watching
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveModal({
                              type: "spectate",
                              title: "Midnight Blitz Knockout",
                              matchup: {
                                white: "WGM Larsson (2340)",
                                black: "T. Nakamura Jr (2415)",
                                board: 3,
                              },
                            })
                          }
                          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition"
                        >
                          <span>Spectate Board 3</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* --- SECTION B: UPCOMING TOURNAMENTS --- */}
              {(activeFilter === "all" ||
                activeFilter === "upcoming" ||
                activeFilter === "high-stakes") && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                      UPCOMING TOURNAMENTS
                    </h2>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                        className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 px-2.5 py-1.5 rounded-lg cursor-pointer transition"
                      >
                        <span>
                          Sort by:{" "}
                          <strong className="text-zinc-200 font-medium capitalize">
                            {sortBy.replace("-", " ")}
                          </strong>
                        </span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>

                      {sortDropdownOpen && (
                        <div className="absolute right-0 mt-1 w-36 rounded-xl bg-[#111520] border border-zinc-700/80 shadow-xl py-1 z-20 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setSortBy("start-time");
                              setSortDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-200"
                          >
                            Start Time
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSortBy("prize");
                              setSortDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-200"
                          >
                            Prize Pool
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSortBy("entry");
                              setSortDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 text-zinc-200"
                          >
                            Entry Fee
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1: Rapid Masters Open */}
                    <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 hover:border-zinc-700/80 p-4.5 flex flex-col justify-between shadow-lg transition-all duration-200">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            REGISTERED
                          </span>
                          <span className="text-xs font-bold text-amber-400">
                            ₹12,000
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white tracking-wide mt-2">
                          Rapid Masters Open
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">10+0 Rapid</p>

                        <div className="flex items-center justify-between text-xs text-zinc-400 py-3 my-2 border-y border-zinc-800/60">
                          <span>
                            Entry: <strong className="text-zinc-200 font-medium">₹25</strong>
                          </span>
                          <span>92 / 128 Enrolled</span>
                          <span className="text-cyan-400 font-semibold">in 4h 15m</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Seat #41 Confirmed
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveModal({
                              type: "lobby",
                              title: "Rapid Masters Open",
                              details: "Seat #41 • Board #14 • Starting at 18:00 UTC",
                            })
                          }
                          className="px-3 py-1.5 rounded-xl border border-zinc-700/80 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                        >
                          Lobby Details
                        </button>
                      </div>
                    </div>

                    {/* Card 2: Speed Demon Bullet Marathon */}
                    <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 hover:border-zinc-700/80 p-4.5 flex flex-col justify-between shadow-lg transition-all duration-200">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                            COMMUNITY SPONSORED
                          </span>
                          <span className="text-xs font-bold text-amber-400">
                            ₹2,500
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white tracking-wide mt-2">
                          Speed Demon Bullet Marathon
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          1+1 Bullet • Free Entry Arena
                        </p>

                        <div className="flex items-center justify-between text-xs text-zinc-400 py-3 my-2 border-y border-zinc-800/60">
                          <span className="text-emerald-400 font-bold">Free Entry</span>
                          <span>412 / 500 Enrolled</span>
                          <span className="text-zinc-300">Tomorrow 18:00</span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleRegister("Speed Demon Bullet Marathon", "Free Entry")
                          }
                          className="w-full py-2 px-3 rounded-xl bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 text-xs font-bold transition shadow-md shadow-cyan-500/15 cursor-pointer"
                        >
                          {registeredTournaments.includes("Speed Demon Bullet Marathon")
                            ? "Registered ✓"
                            : "Register Free"}
                        </button>
                      </div>
                    </div>

                    {/* Card 3: High Roller Classical Cup */}
                    <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 hover:border-zinc-700/80 p-4.5 flex flex-col justify-between shadow-lg transition-all duration-200">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            ⭐ HIGH ROLLER
                          </span>
                          <span className="text-xs font-bold text-amber-400">
                            ₹75,000
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white tracking-wide mt-2">
                          High Roller Classical Cup
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">15+10 Classical</p>

                        <div className="flex items-center justify-between text-xs text-zinc-400 py-3 my-2 border-y border-zinc-800/60">
                          <span className="font-bold text-white">₹250</span>
                          <span>38 / 64 Enrolled</span>
                          <span className="text-zinc-300">in 2d 11h</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-zinc-400">
                          Escrow Lock Active
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleRegister("High Roller Classical Cup", "₹250")
                          }
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition shadow-md shadow-amber-500/20 cursor-pointer"
                        >
                          {registeredTournaments.includes("High Roller Classical Cup")
                            ? "Registered ✓"
                            : "Register (₹250)"}
                        </button>
                      </div>
                    </div>

                    {/* Card 4: Novice to Candidate Blitz */}
                    <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 hover:border-zinc-700/80 p-4.5 flex flex-col justify-between shadow-lg transition-all duration-200">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                            RATED BRACKET &lt;1600
                          </span>
                          <span className="text-xs font-bold text-amber-400">
                            ₹2,000
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white tracking-wide mt-2">
                          Novice to Candidate Blitz
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">3+2 Blitz</p>

                        <div className="flex items-center justify-between text-xs text-zinc-400 py-3 my-2 border-y border-zinc-800/60">
                          <span>
                            Entry: <strong className="text-zinc-200 font-medium">₹10</strong>
                          </span>
                          <span>54 / 64 Enrolled</span>
                          <span className="text-zinc-300">in 1d 04h</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-zinc-400">
                          FairPlay ID Enforced
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleRegister("Novice to Candidate Blitz", "₹10")
                          }
                          className="px-4 py-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition cursor-pointer"
                        >
                          {registeredTournaments.includes("Novice to Candidate Blitz")
                            ? "Registered ✓"
                            : "Register (₹10)"}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: TOURNAMENT STATS CARD (4 of 12 cols on desktop) */}
            <div className="xl:col-span-4">
              <div className="rounded-2xl sm:rounded-3xl bg-[#0c101a]/95 border border-zinc-800/80 p-5 shadow-xl space-y-5">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                    TOURNAMENT STATS
                  </h2>
                </div>

                {/* 2x2 Stats Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Box 1: Played */}
                  <div className="p-3.5 rounded-2xl bg-[#080b11] border border-zinc-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      PLAYED
                    </span>
                    <div className="text-2xl font-black text-white mt-1">18</div>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Tournaments
                    </span>
                  </div>

                  {/* Box 2: Podiums */}
                  <div className="p-3.5 rounded-2xl bg-[#080b11] border border-zinc-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      PODIUMS
                    </span>
                    <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
                      4 <Trophy className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      3 Gold, 1 Bronze
                    </span>
                  </div>

                  {/* Box 3: Win Rate */}
                  <div className="p-3.5 rounded-2xl bg-[#080b11] border border-zinc-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      WIN RATE
                    </span>
                    <div className="text-2xl font-black text-emerald-400 mt-1">
                      48%
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      52W - 14D - 42L
                    </span>
                  </div>

                  {/* Box 4: Avg Placement */}
                  <div className="p-3.5 rounded-2xl bg-[#080b11] border border-zinc-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      AVG PLACEMENT
                    </span>
                    <div className="text-2xl font-black text-white mt-1">#6</div>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Top 12% bracket
                    </span>
                  </div>
                </div>

                {/* Lifetime Tournament Earnings Section */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      LIFETIME TOURNAMENT EARNED
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +12.4% this mo
                    </span>
                  </div>

                  <div className="text-3xl font-black text-amber-400 tracking-tight mt-1">
                    ₹42,500
                  </div>

                  {/* Amber/Gold Curved Sparkline */}
                  <EarningsSparkline />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 6. MY TOURNAMENT HISTORY SECTION */}
          {/* ========================================================= */}
          <section className="space-y-3.5 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                    MY TOURNAMENT HISTORY
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Review your recent tournament placements, performance ratings, and rupee earnings
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setNotification("Displaying entire verified tournament passport.")
                }
                className="px-3.5 py-1.5 rounded-xl border border-zinc-700/80 bg-zinc-800/40 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>View Full History</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Row 1: Sunday Blitz Grandmaster Open */}
              <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 hover:border-zinc-700/80 p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <Trophy className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        Sunday Blitz Grandmaster Open
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                        • #3 / 128 (Bronze)
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Yesterday, 20:30 • Blitz 3+2 • 7 Rounds • Score: 5.5 / 7.0
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-auto text-right">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      RATING CHANGE
                    </span>
                    <span className="text-xs font-bold text-emerald-400 inline-flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +18 ELO
                    </span>
                  </div>
                  <div className="min-w-[70px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      PRIZE WON
                    </span>
                    <span className="text-base font-black text-amber-400">
                      ₹3,500
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Rapid Masters Weekly Cup */}
              <div className="rounded-2xl bg-[#0c101a]/90 border border-amber-500/30 hover:border-amber-500/50 p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
                    <Award className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        Rapid Masters Weekly Cup
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300">
                        #1 / 64 (Champion 🏆)
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Oct 24, 2024 • Rapid 10+0 • 5 Rounds • Score: 5.0 / 5.0
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-auto text-right">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      RATING CHANGE
                    </span>
                    <span className="text-xs font-bold text-emerald-400 inline-flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +24 ELO
                    </span>
                  </div>
                  <div className="min-w-[70px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      PRIZE WON
                    </span>
                    <span className="text-base font-black text-amber-400">
                      ₹8,000
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Midnight Bullet Arena #402 */}
              <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 hover:border-zinc-700/80 p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#141a29] border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        Midnight Bullet Arena #402
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                        #12 / 210
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Oct 21, 2024 • Bullet 1+0 • Arena • Score: 38 pts
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-auto text-right">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      RATING CHANGE
                    </span>
                    <span className="text-xs font-bold text-rose-400 inline-flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      -4 ELO
                    </span>
                  </div>
                  <div className="min-w-[70px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      PRIZE WON
                    </span>
                    <span className="text-base font-black text-amber-400">
                      ₹500
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 4: Autumn Classical Championship */}
              <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 hover:border-zinc-700/80 p-4 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center shrink-0">
                    <Trophy className="h-5 w-5 text-zinc-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        Autumn Classical Championship
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                        #5 / 48 (Top 10)
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Oct 15, 2024 • Classical 30+0 • 6 Rounds • Score: 4.0 / 6.0
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end sm:self-auto text-right">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      RATING CHANGE
                    </span>
                    <span className="text-xs font-bold text-emerald-400 inline-flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +12 ELO
                    </span>
                  </div>
                  <div className="min-w-[70px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      PRIZE WON
                    </span>
                    <span className="text-base font-black text-amber-400">
                      ₹1,200
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 7. INTERACTIVE MODALS */}
      {/* ========================================================= */}

      {/* Register Confirmation Modal */}
      {activeModal.type === "register" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0e1320] border border-zinc-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Trophy className="h-5 w-5" />
                <h3 className="font-bold text-base text-white">Confirm Tournament Entry</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal({ type: null })}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-[#080b11] border border-zinc-800 p-4 space-y-2">
              <div className="text-sm font-bold text-white">{activeModal.title}</div>
              <div className="text-xs text-zinc-400">{activeModal.details}</div>
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Entry Fee:</span>
                <span className="font-bold text-amber-400 text-sm">{activeModal.fee}</span>
              </div>
            </div>

            <div className="text-xs text-zinc-400 leading-relaxed">
              By confirming, your entry fee will be escrowed safely into the smart tournament contract. Board pairing begins 5 minutes prior to the start time.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal({ type: null })}
                className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-800/40 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRegistration}
                className="px-5 py-2 rounded-xl bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 text-xs font-bold shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Confirm &amp; Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lobby Details Modal */}
      {activeModal.type === "lobby" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0e1320] border border-zinc-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Eye className="h-5 w-5" />
                <h3 className="font-bold text-base text-white">{activeModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal({ type: null })}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#080b11] border border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Your Seat</span>
                <span className="text-base font-bold text-amber-400 mt-1 block">#41</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080b11] border border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Assigned Board</span>
                <span className="text-base font-bold text-cyan-400 mt-1 block">Board 14</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080b11] border border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Status</span>
                <span className="text-base font-bold text-emerald-400 mt-1 block">Confirmed</span>
              </div>
            </div>

            <div className="rounded-xl bg-[#080b11] border border-zinc-800 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">FairPlay Verification:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" /> Active &amp; Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Check-In Window:</span>
                <span className="text-zinc-200">Opens at 17:30 UTC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Pairing Algorithm:</span>
                <span className="text-zinc-200">FIDE Swiss-Dutch (FIDE Handbook)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveModal({ type: null });
                setNotification("You are in the waiting room. Stand by for Round 1 pairings.");
              }}
              className="w-full py-2.5 rounded-xl bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Enter Tournament Room
            </button>
          </div>
        </div>
      )}

      {/* Spectate Board Modal */}
      {activeModal.type === "spectate" && activeModal.matchup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-[#0e1320] border border-zinc-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                <h3 className="font-bold text-base text-white">
                  Board {activeModal.matchup.board} • {activeModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal({ type: null })}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Players Header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080b11] border border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white border border-zinc-400" />
                <span className="font-bold text-white">{activeModal.matchup.white}</span>
                <span className="text-[11px] font-mono text-zinc-400">(02:14)</span>
              </div>
              <span className="text-zinc-500 font-bold">vs</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-400">(01:58)</span>
                <span className="font-bold text-white">{activeModal.matchup.black}</span>
                <div className="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-600" />
              </div>
            </div>

            {/* Chessboard Preview Representation */}
            <div className="relative aspect-square max-w-[320px] mx-auto rounded-xl overflow-hidden border border-zinc-700 shadow-2xl grid grid-cols-8 grid-rows-8">
              {Array.from({ length: 64 }).map((_, idx) => {
                const row = Math.floor(idx / 8);
                const col = idx % 8;
                const isLight = (row + col) % 2 === 0;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-center text-xs font-bold ${
                      isLight ? "bg-[#b0c4de]" : "bg-[#46627f]"
                    }`}
                  >
                    {/* Sample pieces to give authentic live feel */}
                    {idx === 4 && <span className="text-zinc-950 text-base">♚</span>}
                    {idx === 60 && <span className="text-white text-base">♔</span>}
                    {idx === 28 && <span className="text-zinc-950 text-base">♞</span>}
                    {idx === 35 && <span className="text-white text-base">♗</span>}
                    {idx === 21 && <span className="text-zinc-950 text-base">♟</span>}
                    {idx === 42 && <span className="text-white text-base">♙</span>}
                  </div>
                );
              })}
            </div>

            <div className="text-center text-xs text-zinc-400">
              Live Evaluation: <span className="text-emerald-400 font-bold">+0.42 (Slight White Advantage)</span> • Move 24: Nf3
            </div>

            <button
              type="button"
              onClick={() => setActiveModal({ type: null })}
              className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition cursor-pointer"
            >
              Close Spectator Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournaments;
