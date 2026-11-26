import React from "react";
import type { ChessBot } from "../../data/chessBots";
import BotAvatar from "./BotAvatar";

interface PlayerCardProps {
  side: "White" | "Black";
  playerName?: string;
  rating?: number;
  badgeLabel?: string;
  bot?: ChessBot | null;
  isThinking?: boolean;
  dialogue?: string | null;
  capturedPieces?: string[];
  isActiveTurn?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  side,
  playerName,
  rating,
  badgeLabel,
  bot = null,
  isThinking = false,
  dialogue = null,
  capturedPieces = [],
  isActiveTurn = false,
}) => {
  const isWhite = side === "White";
  const displayTitle = bot ? bot.name : playerName || side;

  return (
    <div
      className={`flex items-center justify-between gap-2 py-1 px-3 rounded-xl bg-[#0c101a]/95 border transition-all duration-200 select-none ${
        isActiveTurn
          ? "border-cyan-500/50 shadow-md shadow-cyan-500/10 bg-[#101626]/90"
          : "border-zinc-800/80"
      }`}
    >
      {/* Left: Avatar / Side indicator badge & Name */}
      <div className="flex items-center gap-2 min-w-0">
        {bot ? (
          <BotAvatar bot={bot} size="xs" isThinking={isThinking} />
        ) : (
          <div className="relative shrink-0">
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center font-bold text-xs shadow-md border ${
                isWhite
                  ? "bg-white text-zinc-950 border-zinc-300"
                  : "bg-[#181f30] text-zinc-200 border-zinc-700/60"
              }`}
            >
              <span className="text-[10px] sm:text-[11px] font-black">
                {isWhite ? "W" : "B"}
              </span>
            </div>
            {isActiveTurn && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0c101a] animate-pulse" />
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
            {displayTitle}
          </span>

          {rating !== undefined && (
            <span className="text-[10px] font-mono font-semibold text-zinc-400 shrink-0">
              ({rating})
            </span>
          )}

          {bot && (
            <span
              className={`hidden sm:inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border shrink-0 ${bot.badgeBgClass} ${bot.badgeTextClass}`}
            >
              {bot.tierLabel}
            </span>
          )}

          {!bot && badgeLabel && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shrink-0">
              {badgeLabel}
            </span>
          )}

          {isThinking ? (
            <span className="text-[10px] font-semibold text-cyan-400 font-mono animate-pulse shrink-0">
              • Thinking...
            </span>
          ) : (
            isActiveTurn && (
              <span className="text-[10px] font-semibold text-cyan-400 font-mono shrink-0">
                • Turn
              </span>
            )
          )}
        </div>
      </div>

      {/* Right: Bot Banter Pill (if active) + Captured Pieces */}
      <div className="flex items-center gap-2 min-h-[20px] shrink-0 max-w-[48%]">
        {bot && dialogue && (
          <span
            title={dialogue}
            className="hidden sm:inline-block truncate max-w-[210px] px-2 py-0.5 rounded-lg bg-[#141b2b] border border-zinc-700/70 text-[10px] text-zinc-300 italic"
          >
            &ldquo;{dialogue}&rdquo;
          </span>
        )}

        {capturedPieces.length > 0 ? (
          <div className="flex items-center gap-0.5 text-xs text-zinc-400 max-w-[110px] overflow-hidden">
            {capturedPieces.map((p, idx) => (
              <span key={idx} className="opacity-80">
                {p}
              </span>
            ))}
          </div>
        ) : (
          !dialogue && (
            <span className="text-[10px] text-zinc-600 font-mono">Ready</span>
          )
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
