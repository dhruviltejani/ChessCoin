import React from "react";

interface AdvantageBarProps {
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteName?: string;
  blackName?: string;
  whitePerf?: number;
  blackPerf?: number;
}

export const AdvantageBar: React.FC<AdvantageBarProps> = ({
  whiteAccuracy = 91.4,
  blackAccuracy = 76.9,
  whiteName = "Dhruvil",
  blackName = "KnightKing",
  whitePerf = 1780,
  blackPerf = 1410,
}) => {
  // Calculate relative advantage percentage
  const advantageDelta = Math.round((whiteAccuracy - blackAccuracy) * 10) / 10;
  const isWhiteLeading = advantageDelta >= 0;

  // Split percentage for visual bar
  const totalAcc = whiteAccuracy + blackAccuracy || 100;
  const whiteBarWidth = Math.min(90, Math.max(10, Math.round((whiteAccuracy / totalAcc) * 100)));

  return (
    <div className="rounded-xl bg-[#0c101a]/95 border border-zinc-800/80 p-2 sm:p-2.5 shadow-lg space-y-1.5 select-none">
      {/* Top Row: Player Labels & Accuracy Badges */}
      <div className="flex items-center justify-between text-xs">
        {/* White Player */}
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="font-bold text-white text-[11px] tracking-wide">
            {whiteName} (White)
          </span>
          <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-extrabold font-mono">
            {whiteAccuracy.toFixed(1)}% Acc
          </span>
        </div>

        {/* Black Player */}
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.2 rounded bg-zinc-800/90 border border-zinc-700/60 text-zinc-300 text-[10px] font-extrabold font-mono">
            {blackAccuracy.toFixed(1)}% Acc
          </span>
          <span className="font-bold text-zinc-300 text-[11px] tracking-wide">
            {blackName} (Black)
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
        </div>
      </div>

      {/* Middle Row: Dual Progress Bar */}
      <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden flex">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-[#22d3ee] rounded-l-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(6,182,212,0.5)]"
          style={{ width: `${whiteBarWidth}%` }}
        />
        <div
          className="h-full bg-zinc-700/70 rounded-r-full transition-all duration-500 ease-out flex-1"
        />
      </div>

      {/* Bottom Row: Advantage Metric & Performance Ratings */}
      <div className="flex items-center justify-between text-[10px]">
        <span
          className={`font-semibold tracking-wide ${
            isWhiteLeading ? "text-cyan-400" : "text-rose-400"
          }`}
        >
          {isWhiteLeading ? `+${advantageDelta.toFixed(1)}% Advantage` : `${advantageDelta.toFixed(1)}% Advantage`}
        </span>
        <span className="text-zinc-500 font-mono text-[10px]">
          Perf. {whitePerf} vs {blackPerf}
        </span>
      </div>
    </div>
  );
};

export default AdvantageBar;
