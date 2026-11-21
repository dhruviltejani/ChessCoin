import React from "react";
import { BookOpen, Check } from "lucide-react";
import type { EvaluatedMove } from "../../services/stockfishService";

interface MoveClassificationCardProps {
  moves: EvaluatedMove[];
  whiteName?: string;
  blackName?: string;
}

export const MoveClassificationCard: React.FC<MoveClassificationCardProps> = ({
  moves,
  whiteName = "Dhruvil",
  blackName = "KnightKing",
}) => {
  // Aggregate move classifications for White and Black
  const counts = {
    brilliant: { w: 0, b: 0 },
    great: { w: 0, b: 0 },
    best: { w: 0, b: 0 },
    excellentGood: { w: 0, b: 0 },
    book: { w: 0, b: 0 },
    inaccuracy: { w: 0, b: 0 },
    mistake: { w: 0, b: 0 },
    blunder: { w: 0, b: 0 },
  };

  moves.forEach((m) => {
    const side = m.color;
    switch (m.classification) {
      case "brilliant":
        counts.brilliant[side]++;
        break;
      case "great":
        counts.great[side]++;
        break;
      case "best":
        counts.best[side]++;
        break;
      case "excellent":
      case "good":
        counts.excellentGood[side]++;
        break;
      case "book":
        counts.book[side]++;
        break;
      case "inaccuracy":
        counts.inaccuracy[side]++;
        break;
      case "mistake":
        counts.mistake[side]++;
        break;
      case "blunder":
        counts.blunder[side]++;
        break;
    }
  });

  const rows = [
    {
      label: "Brilliant",
      icon: (
        <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 flex items-center justify-center font-bold text-[9px] font-mono">
          !!
        </span>
      ),
      w: counts.brilliant.w,
      b: counts.brilliant.b,
    },
    {
      label: "Great",
      icon: (
        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400 flex items-center justify-center font-bold text-[9px] font-mono">
          !
        </span>
      ),
      w: counts.great.w,
      b: counts.great.b,
    },
    {
      label: "Best Moves",
      icon: (
        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-[10px]">
          ★
        </span>
      ),
      w: counts.best.w,
      b: counts.best.b,
    },
    {
      label: "Excellent & Good",
      icon: (
        <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-400 border border-green-500/40 flex items-center justify-center text-[9px]">
          <Check className="w-2.5 h-2.5 stroke-[2.5]" />
        </span>
      ),
      w: counts.excellentGood.w,
      b: counts.excellentGood.b,
    },
    {
      label: "Book Openings",
      icon: (
        <span className="w-4 h-4 rounded-md bg-amber-600/25 text-amber-300 border border-amber-500/40 flex items-center justify-center text-[9px]">
          <BookOpen className="w-2 h-2" />
        </span>
      ),
      w: counts.book.w,
      b: counts.book.b,
    },
    {
      label: "Inaccuracies",
      icon: (
        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400 flex items-center justify-center font-bold text-[8px] font-mono">
          ?!
        </span>
      ),
      w: counts.inaccuracy.w,
      b: counts.inaccuracy.b,
    },
    {
      label: "Mistakes",
      icon: (
        <span className="w-4 h-4 rounded-full bg-orange-500/25 text-orange-400 border border-orange-500/50 flex items-center justify-center font-bold text-[9px] font-mono">
          ?
        </span>
      ),
      w: counts.mistake.w,
      b: counts.mistake.b,
    },
    {
      label: "Blunders",
      icon: (
        <span className="w-4 h-4 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/60 flex items-center justify-center font-bold text-[8px] font-mono">
          ??
        </span>
      ),
      w: counts.blunder.w,
      b: counts.blunder.b,
    },
  ];

  return (
    <div className="rounded-2xl bg-[#0c101a]/95 border border-zinc-800/80 p-3 shadow-xl space-y-1.5 select-none">
      {/* Table Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/80 text-[11px]">
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
          Move Classification
        </span>
        <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-400 font-semibold">
          <span className="w-10 text-right">W ({whiteName.slice(0, 5)})</span>
          <span className="w-10 text-right">B ({blackName.slice(0, 5)})</span>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-1 text-xs">
        {rows.map((r, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-0.5 px-1 rounded-md hover:bg-zinc-800/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              {r.icon}
              <span className="text-zinc-300 font-medium text-[11px]">{r.label}</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px] font-bold">
              <span className="w-10 text-right text-white">{r.w}</span>
              <span className="w-10 text-right text-zinc-300">{r.b}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoveClassificationCard;
