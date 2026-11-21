import React from "react";
import { Award } from "lucide-react";

interface PlayerAccuracyCardProps {
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteName?: string;
  blackName?: string;
}

export const PlayerAccuracyCard: React.FC<PlayerAccuracyCardProps> = ({
  whiteAccuracy = 91.4,
  blackAccuracy = 76.9,
  whiteName = "Dhruvil",
  blackName = "KnightKing",
}) => {
  const advantageDelta = Math.round((whiteAccuracy - blackAccuracy) * 10) / 10;
  const isWhiteLeading = advantageDelta >= 0;

  return (
    <div className="rounded-2xl bg-[#0c101a]/95 border border-zinc-800/80 p-2.5 sm:p-3 shadow-xl select-none space-y-2">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 text-[11px]">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-white">
          <Award className="h-3.5 w-3.5 text-cyan-400" />
          <span>Game Accuracy</span>
        </div>
        <span
          className={`font-semibold text-[10px] font-mono ${
            isWhiteLeading ? "text-cyan-400" : "text-rose-400"
          }`}
        >
          {isWhiteLeading ? `+${advantageDelta.toFixed(1)}% Lead` : `${advantageDelta.toFixed(1)}% Lead`}
        </span>
      </div>

      {/* Accuracy Badges for Both Players */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* White Player */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#121724] border border-cyan-500/25">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-zinc-400 truncate leading-tight">
              {whiteName} (W)
            </span>
            <span className="text-sm font-bold text-white mt-0.5">
              {whiteAccuracy.toFixed(1)}%
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
        </div>

        {/* Black Player */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#121724] border border-zinc-800/80">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-zinc-400 truncate leading-tight">
              {blackName} (B)
            </span>
            <span className="text-sm font-bold text-zinc-300 mt-0.5">
              {blackAccuracy.toFixed(1)}%
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-zinc-500" />
        </div>
      </div>
    </div>
  );
};

export default PlayerAccuracyCard;
