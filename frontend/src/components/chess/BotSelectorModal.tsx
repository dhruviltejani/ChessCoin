import React, { useState } from "react";
import { Bot, Check, Shuffle, Swords, Users, X } from "lucide-react";
import { CHESS_BOTS, type ChessBot } from "../../data/chessBots";
import BotAvatar from "./BotAvatar";

export type ColorPreference = "w" | "b" | "random";

interface BotSelectorModalProps {
  isOpen: boolean;
  currentBot: ChessBot | null;
  currentPlayerColor: "w" | "b";
  onSelectBot: (bot: ChessBot, playerColor: "w" | "b") => void;
  onSelectLocalPassAndPlay: () => void;
  onClose: () => void;
}

export const BotSelectorModal: React.FC<BotSelectorModalProps> = ({
  isOpen,
  currentBot,
  currentPlayerColor,
  onSelectBot,
  onSelectLocalPassAndPlay,
  onClose,
}) => {
  const [selectedBotId, setSelectedBotId] = useState<string>(
    currentBot?.id || CHESS_BOTS[0].id
  );
  const [colorPref, setColorPref] = useState<ColorPreference>(currentPlayerColor);

  if (!isOpen) return null;

  const chosenBot = CHESS_BOTS.find((b) => b.id === selectedBotId) || CHESS_BOTS[0];

  const handleStartBotGame = () => {
    const resolvedColor: "w" | "b" =
      colorPref === "random" ? (Math.random() < 0.5 ? "w" : "b") : colorPref;
    onSelectBot(chosenBot, resolvedColor);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-[#0c101a] border border-zinc-800/90 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-[#090d16]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                Choose Opponent
              </h2>
              <p className="text-[11px] text-zinc-400">
                Challenge a ChessCoin personality bot or play Pass &amp; Play locally
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 4 Bot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CHESS_BOTS.map((bot) => {
              const isSelected = bot.id === selectedBotId;
              return (
                <button
                  key={bot.id}
                  type="button"
                  onClick={() => setSelectedBotId(bot.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-[#131a2b] border-cyan-400/70 shadow-lg shadow-cyan-500/10"
                      : `bg-[#101522]/80 ${bot.borderClass}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <BotAvatar bot={bot} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-white truncate">
                            {bot.name}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-zinc-400">
                            ({bot.rating})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${bot.badgeBgClass} ${bot.badgeTextClass}`}
                          >
                            {bot.tierLabel}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate">
                            {bot.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-cyan-400 text-zinc-950 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="mt-2.5 text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                    {bot.tagline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Color Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#090d16] border border-zinc-800/80">
            <div>
              <span className="text-xs font-bold text-white block">Play As</span>
              <span className="text-[11px] text-zinc-400">
                Choose your piece color against {chosenBot.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setColorPref("w")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  colorPref === "w"
                    ? "bg-white text-zinc-950 border-white shadow"
                    : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-zinc-400" />
                White
              </button>

              <button
                type="button"
                onClick={() => setColorPref("random")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  colorPref === "random"
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow"
                    : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                }`}
              >
                <Shuffle className="w-3 h-3" />
                Random
              </button>

              <button
                type="button"
                onClick={() => setColorPref("b")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  colorPref === "b"
                    ? "bg-zinc-800 text-white border-zinc-400 shadow"
                    : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-zinc-400" />
                Black
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-5 py-4 border-t border-zinc-800/80 bg-[#090d16]">
          <button
            type="button"
            onClick={() => {
              onSelectLocalPassAndPlay();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-zinc-700/80 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Switch to Local Pass &amp; Play</span>
          </button>

          <button
            type="button"
            onClick={handleStartBotGame}
            className="px-5 py-2.5 rounded-xl bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition cursor-pointer"
          >
            <Swords className="w-4 h-4 stroke-[2.3]" />
            <span>Play vs {chosenBot.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BotSelectorModal;
