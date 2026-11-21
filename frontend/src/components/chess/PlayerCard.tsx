import React from "react";

interface PlayerCardProps {
  side: "White" | "Black";
  capturedPieces?: string[];
  isActiveTurn?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  side,
  capturedPieces = [],
  isActiveTurn = false,
}) => {
  const isWhite = side === "White";

  return (
    <div
      className={`flex items-center justify-between py-1 px-3 rounded-xl bg-[#0c101a]/95 border transition-all duration-200 select-none ${
        isActiveTurn
          ? "border-cyan-500/50 shadow-md shadow-cyan-500/10 bg-[#101626]/90"
          : "border-zinc-800/80"
      }`}
    >
      {/* Left: Side indicator badge & "White" / "Black" */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center font-bold text-xs shadow-md border ${
              isWhite
                ? "bg-white text-zinc-950 border-zinc-300"
                : "bg-[#181f30] text-zinc-200 border-zinc-700/60"
            }`}
          >
            <span className="text-[10px] sm:text-[11px] font-black">{isWhite ? "W" : "B"}</span>
          </div>
          {/* Active Turn Dot */}
          {isActiveTurn && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0c101a] animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
            {side}
          </span>
          {isActiveTurn && (
            <span className="text-[10px] font-semibold text-cyan-400 font-mono">
              • Turn
            </span>
          )}
        </div>
      </div>

      {/* Right: Captured Pieces */}
      <div className="flex items-center gap-1.5 min-h-[20px]">
        {capturedPieces.length > 0 ? (
          <div className="flex items-center gap-0.5 text-xs text-zinc-400 max-w-[140px] overflow-hidden">
            {capturedPieces.map((p, idx) => (
              <span key={idx} className="opacity-80">
                {p}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[10px] text-zinc-600 font-mono">Ready</span>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
