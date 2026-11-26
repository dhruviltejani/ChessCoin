import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  Cpu,
  Menu,
  Shuffle,
  Sparkles,
  Swords,
  Target,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar/Sidebar";
import BotAvatar from "../components/chess/BotAvatar";
import { CHESS_BOTS, type ChessBot } from "../data/chessBots";

type ColorChoice = "w" | "b" | "random";

export const BotsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<ChessBot>(CHESS_BOTS[0]);
  const [colorChoice, setColorChoice] = useState<ColorChoice>("w");

  const state = location.state as {
    user?: { displayName?: string; handle?: string; email?: string; avatarUrl?: string };
    displayName?: string;
    registeredHandle?: string;
  } | null;

  const displayName = state?.user?.displayName || state?.displayName || "Dhruvil";
  const rawHandle = state?.user?.handle || state?.registeredHandle || "dhruvil";
  const handle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
  const avatarUrl = state?.user?.avatarUrl;

  const user = {
    name: displayName,
    handle,
    avatarUrl,
  };

  const handleSidebarItemClick = (id: string) => {
    const target = id.toLowerCase();
    if (target === "bots") return;
    if (target === "home") {
      navigate("/dashboard", { state: location.state });
      return;
    }
    navigate(`/${target}`, { state: location.state });
  };

  const handleChallengeBot = (bot: ChessBot) => {
    const resolvedColor: "w" | "b" =
      colorChoice === "random" ? (Math.random() < 0.5 ? "w" : "b") : colorChoice;

    navigate("/play", {
      state: {
        ...(state || {}),
        botId: bot.id,
        playerColor: resolvedColor,
      },
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#07090e] text-white overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          activeItem="bots"
          onItemClick={handleSidebarItemClick}
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
            activeItem="bots"
            onItemClick={(id) => {
              handleSidebarItemClick(id);
              setMobileSidebarOpen(false);
            }}
            user={user}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Header */}
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

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1360px] w-full mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Bot className="w-3.5 h-3.5" />
                <span>ChessCoin Bot Arena</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Play Against Chess Bots
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                Test your skills across four personality tiers — from chaotic beginner aggression to World Champion calculation powered by Stockfish.
              </p>
            </div>

            {/* Color Selection Pill */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0c101a] border border-zinc-800/80 self-start lg:self-auto">
              <span className="text-[11px] font-bold text-zinc-400 px-2 uppercase tracking-wider">
                Play As:
              </span>
              <button
                type="button"
                onClick={() => setColorChoice("w")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  colorChoice === "w"
                    ? "bg-white text-zinc-950 shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-zinc-400" />
                White
              </button>
              <button
                type="button"
                onClick={() => setColorChoice("random")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  colorChoice === "random"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Shuffle className="w-3 h-3" />
                Random
              </button>
              <button
                type="button"
                onClick={() => setColorChoice("b")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  colorChoice === "b"
                    ? "bg-zinc-800 text-white border border-zinc-600 shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-400" />
                Black
              </button>
            </div>
          </div>

          {/* Main Grid: 4 Bots + Selected Bot Spotlight */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Bot Cards Grid */}
            <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHESS_BOTS.map((bot, index) => {
                const isSelected = selectedBot.id === bot.id;
                return (
                  <div
                    key={bot.id}
                    onClick={() => setSelectedBot(bot)}
                    className={`rounded-3xl bg-[#0c101a]/95 border p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xl relative overflow-hidden ${
                      isSelected
                        ? "border-cyan-400/70 ring-1 ring-cyan-400/30 bg-[#101626]"
                        : `${bot.borderClass} hover:bg-[#101522]`
                    }`}
                  >
                    {/* Subtle tier glow */}
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full blur-[65px] opacity-20"
                      style={{ backgroundColor: bot.accentColor }}
                    />

                    <div>
                      {/* Top Row: Tier + Level */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${bot.badgeBgClass} ${bot.badgeTextClass}`}
                        >
                          Tier {index + 1} • {bot.tierLabel}
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-900/90 border border-zinc-800 px-2.5 py-0.5 rounded-lg">
                          ELO {bot.rating}
                        </span>
                      </div>

                      {/* Identity */}
                      <div className="flex items-center gap-3.5">
                        <BotAvatar bot={bot} size="lg" />
                        <div className="min-w-0">
                          <h2 className="text-lg font-extrabold text-white truncate">
                            {bot.name}
                          </h2>
                          <p className="text-xs font-semibold text-zinc-400 truncate">
                            {bot.title} • {bot.handle}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3.5 text-xs text-zinc-300 leading-relaxed">
                        {bot.bio}
                      </p>

                      {/* Style Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3.5">
                        {bot.styleTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                      <div className="text-[11px] text-zinc-400">
                        Accuracy:{" "}
                        <span className="font-bold text-zinc-200">
                          {bot.expectedAccuracy}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChallengeBot(bot);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition cursor-pointer"
                      >
                        <Swords className="w-3.5 h-3.5 stroke-[2.3]" />
                        <span>Challenge</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Spotlight Panel */}
            <div className="xl:col-span-4 rounded-3xl bg-[#0c101a]/95 border border-zinc-800/80 p-5 shadow-2xl space-y-5 sticky top-6">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <BotAvatar bot={selectedBot} size="md" />
                  <div>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider ${selectedBot.badgeTextClass}`}
                    >
                      {selectedBot.tierLabel} Opponent
                    </span>
                    <h3 className="text-lg font-black text-white leading-tight">
                      {selectedBot.name}
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs font-bold text-cyan-300">
                  {selectedBot.rating}
                </span>
              </div>

              {/* Quote Bubble */}
              <div className="p-3.5 rounded-2xl bg-[#111726] border border-zinc-800/90 relative">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Pre-Match Banter</span>
                </div>
                <p className="text-xs text-zinc-200 italic leading-relaxed">
                  &ldquo;{selectedBot.dialogue.onStart[0]}&rdquo;
                </p>
              </div>

              {/* Engine Specs */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Bot Engine Profile</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#090d16] border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 block">Stockfish Skill</span>
                    <span className="font-bold text-white font-mono">
                      Level {selectedBot.engine.skillLevel} / 20
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#090d16] border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 block">Search Depth</span>
                    <span className="font-bold text-white font-mono">
                      Depth {selectedBot.engine.depth}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signature Openings */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Signature Repertoire</span>
                </div>
                <ul className="space-y-1.5">
                  {selectedBot.signatureOpenings.map((op) => (
                    <li
                      key={op}
                      className="px-3 py-2 rounded-xl bg-[#090d16] border border-zinc-800/80 text-xs text-zinc-300 font-medium flex items-center justify-between"
                    >
                      <span>{op}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => handleChallengeBot(selectedBot)}
                className="w-full py-3 px-4 rounded-2xl bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-[0.98] transition cursor-pointer"
              >
                <Swords className="w-4 h-4 stroke-[2.5]" />
                <span>
                  Play vs {selectedBot.name} (
                  {colorChoice === "random"
                    ? "Random"
                    : colorChoice === "w"
                    ? "White"
                    : "Black"}
                  )
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotsPage;
