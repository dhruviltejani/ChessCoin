import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart2,
  Clock,
  Download,
  Eye,
  Flame,
  Hourglass,
  Menu,
  RotateCcw,
  Swords,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import Sidebar from "../components/Sidebar/Sidebar";

// --- SUB-COMPONENTS FOR DASHBOARD ---

interface QuickPlayCardProps {
  category: string;
  tagColor: string;
  time: string;
  description: string;
  rating: number;
  delta: string;
  onClick?: () => void;
}

const QuickPlayCard: React.FC<QuickPlayCardProps> = ({
  category,
  tagColor,
  time,
  description,
  rating,
  delta,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 hover:border-zinc-700/80 hover:bg-[#111726]/90 p-4 flex flex-col justify-between transition-all duration-200 group cursor-pointer shadow-lg hover:shadow-cyan-500/5 relative"
  >
    <div>
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold tracking-wider uppercase ${tagColor}`}>
          {category}
        </span>
        <div className="p-1.5 rounded-lg bg-[#141926] text-zinc-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/10 transition-colors">
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
      <div className="my-2.5">
        <div className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">
          {time}
        </div>
        <div className="text-[11px] font-semibold text-zinc-400 mt-1">min</div>
      </div>
      <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
        {description}
      </p>
    </div>
    <div className="mt-3.5 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
      <span className="text-zinc-400 font-medium">Rating: {rating}</span>
      <span className="text-emerald-400 font-semibold">{delta}</span>
    </div>
  </div>
);

interface CircularGaugeProps {
  percentage: number;
  color: string;
  label: string;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({
  percentage,
  color,
  label,
}) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center flex-1">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke="#161c2b"
            strokeWidth="5"
          />
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-extrabold text-white">
          {percentage}%
        </span>
      </div>
      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider text-center mt-2 leading-tight">
        {label}
      </span>
    </div>
  );
};

const MomentumSparkline: React.FC = () => (
  <div className="w-full pt-2">
    <svg viewBox="0 0 240 55" className="w-full h-12 overflow-visible">
      <defs>
        <linearGradient id="sparkline-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Subtle area below the line */}
      <path
        d="M 5,42 Q 35,46 65,34 T 125,28 T 175,18 T 232,10 L 232,55 L 5,55 Z"
        fill="url(#sparkline-grad)"
      />
      {/* Sparkline curve */}
      <path
        d="M 5,42 Q 35,46 65,34 T 125,28 T 175,18 T 232,10"
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* End Dot with subtle ping */}
      <circle cx="232" cy="10" r="5" fill="#10b981" fillOpacity="0.3" className="animate-ping" />
      <circle cx="232" cy="10" r="3.5" fill="#34d399" />
    </svg>
  </div>
);

// --- MAIN DASHBOARD COMPONENT ---

const DASHBOARD_TABS = new Set([
  "tournaments",
  "leagues",
  "leaderboard",
  "messages",
  "friends",
  "notifications",
  "settings",
]);

export const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Extract logged in user details if available, or fall back to default
  const state = location.state as {
    user?: { displayName?: string; handle?: string; email?: string; avatarUrl?: string };
    displayName?: string;
    registeredHandle?: string;
    message?: string;
    activeTab?: string;
  } | null;

  const pathTab = location.pathname.replace(/^\/+/, "").toLowerCase();
  const activeTab = DASHBOARD_TABS.has(pathTab)
    ? pathTab
    : state?.activeTab && DASHBOARD_TABS.has(state.activeTab.toLowerCase())
      ? state.activeTab.toLowerCase()
      : "home";

  const handleNavigateTab = (id: string) => {
    const target = id.toLowerCase();
    if (target === "play") {
      navigate("/play", { state: location.state });
      return;
    }
    if (target === "home") {
      navigate("/dashboard", { state: location.state });
      return;
    }
    if (DASHBOARD_TABS.has(target)) {
      navigate(`/${target}`, { state: location.state });
    }
  };

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

  return (
    <div className="flex h-screen w-full bg-[#07090e] text-white overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      {/* Desktop Sidebar (Fixed on the left) */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          activeItem={activeTab}
          onItemClick={handleNavigateTab}
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
            activeItem={activeTab}
            onItemClick={(id) => {
              handleNavigateTab(id);
              setMobileSidebarOpen(false);
            }}
            user={user}
          />
        </div>
      </div>

      {/* Main Content Area (Scrollable to the right of the sidebar) */}
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

        {/* Inner Container */}
        <div className="p-4 sm:p-6 lg:p-7 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Render Home Dashboard View if activeTab is 'home' */}
          {activeTab === "home" ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* ========================================================= */}
              {/* LEFT COLUMN: Quick Play, Current League, Tournaments, Game History */}
              {/* ========================================================= */}
              <div className="xl:col-span-8 space-y-6">
                {/* 1. QUICK PLAY SECTION */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
                    <h2 className="text-xs sm:text-sm font-bold tracking-wider text-cyan-400 uppercase">
                      QUICK PLAY
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <QuickPlayCard
                      category="BULLET"
                      tagColor="text-cyan-400"
                      time="1"
                      description="Fast & high-intensity reflex calculation"
                      rating={1428}
                      delta="+12"
                      onClick={() => handleNavigateTab("play")}
                    />
                    <QuickPlayCard
                      category="BLITZ"
                      tagColor="text-amber-400"
                      time="3"
                      description="Fast competitive tactical games"
                      rating={1542}
                      delta="+24"
                      onClick={() => handleNavigateTab("play")}
                    />
                    <QuickPlayCard
                      category="RAPID"
                      tagColor="text-emerald-400"
                      time="10"
                      description="Balanced strategic & positional play"
                      rating={1618}
                      delta="+8"
                      onClick={() => handleNavigateTab("play")}
                    />
                    <QuickPlayCard
                      category="CLASSICAL"
                      tagColor="text-sky-400"
                      time="30"
                      description="Deep intellectual calculation & endgames"
                      rating={1684}
                      delta="+5"
                      onClick={() => handleNavigateTab("play")}
                    />
                  </div>
                </section>

                {/* 2. CURRENT LEAGUE BANNER */}
                <section className="rounded-2xl sm:rounded-3xl bg-[#0c101a]/95 border border-zinc-800/80 p-5 sm:p-6 shadow-xl relative overflow-hidden">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-amber-500/5 blur-[60px]" />

                  {/* Top Row: Medal & League Name & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
                        <Award className="h-6 w-6 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                          CURRENT LEAGUE
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black tracking-wide text-white">
                          GOLD LEAGUE
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleNavigateTab("leagues")}
                        className="px-3.5 py-2 rounded-xl border border-zinc-700/80 bg-zinc-800/40 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        VIEW LEAGUE
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigateTab("play")}
                        className="px-4 py-2 rounded-xl bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition cursor-pointer"
                      >
                        <Swords className="h-4 w-4 stroke-[2.2]" />
                        <span>PLAY LEAGUE GAME</span>
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: 4 Metric Columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-zinc-800/70">
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block">
                        CURRENT POSITION
                      </span>
                      <div className="mt-1 text-base sm:text-lg font-bold text-white">
                        #18 <span className="text-xs text-zinc-400 font-normal">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block">
                        TOTAL POINTS
                      </span>
                      <div className="mt-1 text-base sm:text-lg font-bold text-amber-400">
                        842 pts
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block">
                        PROMOTION ZONE
                      </span>
                      <div className="mt-1 text-base sm:text-lg font-bold text-emerald-400">
                        Top 25 <span className="text-xs text-emerald-400/80 font-normal">(Safe)</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block">
                        SEASON CLOSES IN
                      </span>
                      <div className="mt-1 text-base sm:text-lg font-bold text-white">
                        4d 18h 32m
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Promotion Threshold Progress Bar */}
                  <div className="pt-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                        PROMOTION THRESHOLD PROGRESS
                      </span>
                      <span className="text-[11px] font-bold text-amber-400">
                        68% to Diamond
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-zinc-800/90 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-sm shadow-amber-500/40"
                        style={{ width: "68%" }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2">
                      <span>0 pts (Demotion Zone)</span>
                      <span className="text-zinc-300 font-medium">600 pts (Safe)</span>
                      <span className="text-amber-400 font-medium">1000 pts (Diamond Qualify)</span>
                    </div>
                  </div>
                </section>

                {/* 3. TOURNAMENTS SECTION */}
                <section>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-400" />
                        <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                          TOURNAMENTS
                        </h2>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Compete for crypto and coin pools, climb international rankings.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavigateTab("tournaments")}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition self-start sm:self-auto"
                    >
                      <span>Browse All (14)</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Tournament 1: Blitz Arena */}
                    <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 p-4 flex flex-col justify-between shadow-lg">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 border border-red-500/30 text-red-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                            LIVE NOW
                          </span>
                          <span className="text-[11px] text-zinc-400">214 Players</span>
                        </div>
                        <h3 className="text-base font-bold text-white tracking-wide mt-2.5">
                          BLITZ ARENA
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Swiss system • 9 Rounds • 3+0 Blitz
                        </p>
                        <div className="mt-3 text-xs">
                          <span className="text-zinc-400">Prize Pool </span>
                          <span className="font-bold text-amber-400">25,000 Coins</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                          <span>
                            Your Rank: <strong className="text-white">#18</strong>
                          </span>
                          <span className="font-semibold text-amber-400">842 pts (68%)</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNavigateTab("tournaments")}
                        className="mt-4 w-full bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-[0.98] transition cursor-pointer"
                      >
                        <span>ENTER ARENA</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Tournament 2: Rapid Masters */}
                    <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 p-4 flex flex-col justify-between shadow-lg">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800 text-zinc-300 uppercase tracking-wider">
                            UPCOMING
                          </span>
                          <span className="text-[11px] text-zinc-400">72 / 128 Registered</span>
                        </div>
                        <h3 className="text-base font-bold text-white tracking-wide mt-2.5">
                          RAPID MASTERS
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Knockout format • 10+5 Rapid
                        </p>
                        <div className="mt-3 text-xs">
                          <span className="text-zinc-400">Prize Pool </span>
                          <span className="font-bold text-amber-400">50,000 Coins</span>
                        </div>
                        <div className="mt-2 text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                          Starts Today, 8:00 PM UTC
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNavigateTab("tournaments")}
                        className="mt-4 w-full border border-zinc-700/80 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>VIEW DETAILS</span>
                      </button>
                    </div>

                    {/* Tournament 3: Classical Cup */}
                    <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 p-4 flex flex-col justify-between shadow-lg">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800 text-zinc-300 uppercase tracking-wider">
                            UPCOMING
                          </span>
                          <span className="text-[11px] text-zinc-400">48 / 100 Registered</span>
                        </div>
                        <h3 className="text-base font-bold text-white tracking-wide mt-2.5">
                          CLASSICAL CUP
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Round Robin • 30+0 Classical
                        </p>
                        <div className="mt-3 text-xs">
                          <span className="text-zinc-400">Prize Pool </span>
                          <span className="font-bold text-amber-400">75,000 Coins</span>
                        </div>
                        <div className="mt-2 text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                          Starts Tomorrow, 14:00 UTC
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNavigateTab("tournaments")}
                        className="mt-4 w-full border border-zinc-700/80 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>VIEW DETAILS</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* 4. GAME HISTORY SECTION */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-cyan-400" />
                      <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                        GAME HISTORY
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export PGN</span>
                    </button>
                  </div>

                  <div className="rounded-2xl bg-[#0c101a]/90 border border-zinc-800/80 overflow-x-auto shadow-xl">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-zinc-800/80 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          <th className="py-3 px-4">TYPE</th>
                          <th className="py-3 px-4">OPPONENT</th>
                          <th className="py-3 px-4">RESULT</th>
                          <th className="py-3 px-4">ACCURACY</th>
                          <th className="py-3 px-4">RATING</th>
                          <th className="py-3 px-4 text-right">TIME</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {/* Row 1 */}
                        <tr className="hover:bg-zinc-800/20 transition-colors">
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold text-[11px]">
                              <Zap className="h-3 w-3 fill-amber-400" />
                              3+0
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                                K
                              </div>
                              <span className="text-white font-semibold">KnightKing</span>
                              <span className="text-zinc-500">(1524)</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              WIN
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              91.4%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-400">+18</span>
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-400">
                            2 min ago
                          </td>
                        </tr>

                        {/* Row 2 */}
                        <tr className="hover:bg-zinc-800/20 transition-colors">
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-[11px]">
                              <Clock className="h-3 w-3" />
                              10+0
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                                C
                              </div>
                              <span className="text-white font-semibold">ChessMaster</span>
                              <span className="text-zinc-500">(1630)</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400">
                              LOSS
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 border border-zinc-700/60 text-zinc-300">
                              78.9%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-rose-400">-12</span>
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-400">
                            18 min ago
                          </td>
                        </tr>

                        {/* Row 3 */}
                        <tr className="hover:bg-zinc-800/20 transition-colors">
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 font-bold text-[11px]">
                              <Flame className="h-3 w-3" />
                              1+0
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                                Q
                              </div>
                              <span className="text-white font-semibold">QueenSlayer</span>
                              <span className="text-zinc-500">(1419)</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              WIN
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              88.2%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-400">+9</span>
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-400">
                            1 hour ago
                          </td>
                        </tr>

                        {/* Row 4 */}
                        <tr className="hover:bg-zinc-800/20 transition-colors">
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/10 border border-sky-500/25 text-sky-400 font-bold text-[11px]">
                              <Hourglass className="h-3 w-3" />
                              30+0
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                                R
                              </div>
                              <span className="text-white font-semibold">RookKing</span>
                              <span className="text-zinc-500">(1682)</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 border border-zinc-700/70 text-zinc-300">
                              DRAW
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 flex items-center gap-1 transition cursor-pointer"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Review</span>
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-400">+2</span>
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-400">
                            3 hours ago
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* ========================================================= */}
              {/* RIGHT COLUMN: Your Stats, Tournament Stats, Win Ratio */}
              {/* ========================================================= */}
              <div className="xl:col-span-4 space-y-6">
                {/* 1. YOUR STATS CARD */}
                <div className="rounded-2xl sm:rounded-3xl bg-[#0c101a]/95 border border-zinc-800/80 p-5 shadow-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                      YOUR STATS
                    </h2>
                  </div>

                  {/* Rating Stats Subsection */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-3">
                      RATING STATS
                    </span>
                    <div className="space-y-2.5">
                      {/* Bullet */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Flame className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Bullet</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">1428</span>
                          <span className="text-[11px] font-semibold text-emerald-400">+12</span>
                        </div>
                      </div>

                      {/* Blitz */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Zap className="h-3.5 w-3.5 text-amber-400" />
                          <span>Blitz</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">1542</span>
                          <span className="text-[11px] font-semibold text-emerald-400">+24</span>
                        </div>
                      </div>

                      {/* Rapid */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Clock className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Rapid</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">1618</span>
                          <span className="text-[11px] font-semibold text-emerald-400">-8</span>
                        </div>
                      </div>

                      {/* Classical */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Hourglass className="h-3.5 w-3.5 text-sky-400" />
                          <span>Classical</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">1684</span>
                          <span className="text-[11px] font-semibold text-emerald-400">+5</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* League Stats Subsection */}
                  <div className="pt-4 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        LEAGUE STATS
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        GOLD LEAGUE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Position</span>
                        <span className="text-base font-bold text-white">#18</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Points</span>
                        <span className="text-base font-bold text-amber-400">842</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                      <span className="text-zinc-400">W / L / D</span>
                      <span className="font-bold">
                        <span className="text-emerald-400">32</span>
                        <span className="text-zinc-500"> / </span>
                        <span className="text-rose-400">14</span>
                        <span className="text-zinc-500"> / </span>
                        <span className="text-zinc-400">8</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNavigateTab("leagues")}
                      className="mt-3.5 w-full py-2 px-3 rounded-xl border border-zinc-700/80 bg-zinc-800/40 hover:bg-zinc-800 text-xs font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <span>VIEW STATS</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. TOURNAMENT STATS CARD */}
                <div className="rounded-2xl sm:rounded-3xl bg-[#0c101a]/95 border border-zinc-800/80 p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                      TOURNAMENT STATS
                    </h2>
                    <Trophy className="h-4 w-4 text-amber-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <span className="text-xs text-zinc-400 block">Played</span>
                      <span className="text-base font-bold text-white mt-0.5 block">24</span>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 block">Wins</span>
                      <span className="text-base font-bold text-emerald-400 mt-0.5 block">3</span>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 block">Top 3</span>
                      <span className="text-base font-bold text-white mt-0.5 block">8</span>
                    </div>
                    <div>
                      <span className="text-xs text-zinc-400 block">Best</span>
                      <span className="text-base font-bold text-amber-400 mt-0.5 block">#1</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Win Rate</span>
                      <span className="font-bold text-emerald-400">48%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Coins Earned</span>
                      <span className="font-bold text-amber-400">42,500 CHESS</span>
                    </div>
                  </div>
                </div>

                {/* 3. WIN RATIO & MOMENTUM CARD */}
                <div className="rounded-2xl sm:rounded-3xl bg-[#0c101a]/95 border border-zinc-800/80 p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
                      WIN RATIO
                    </h2>
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                  </div>

                  {/* 3 Circular Gauges */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <CircularGauge percentage={57} color="#00bcd4" label="CHESS CAP" />
                    <CircularGauge percentage={62} color="#f59e0b" label="LEAGUE RATIO" />
                    <CircularGauge percentage={48} color="#06b6d4" label="TOURNEY DOMINANCE" />
                  </div>

                  {/* Sparkline Rating Momentum */}
                  <div className="pt-4 border-t border-zinc-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                      RATING MOMENTUM (LAST 10 MATCHES)
                    </span>
                    <MomentumSparkline />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Alternate view when other sidebar navigation tabs are clicked */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage and view details for the {activeTab} section.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigateTab("home")}
                  className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <span>← Back to Home Dashboard</span>
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-800/80 bg-[#0c101a]/90 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
                  <Swords className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white capitalize">{activeTab} Area</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  You are viewing the {activeTab} panel. Click "Home" in the sidebar anytime to return to your main dashboard overview.
                </p>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleNavigateTab("play")}
                    className="px-5 py-2.5 rounded-xl bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition"
                  >
                    <span>Go to Play</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateTab("home")}
                    className="px-5 py-2.5 rounded-xl border border-zinc-700/80 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-200 text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition"
                  >
                    <span>Return to Home</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
