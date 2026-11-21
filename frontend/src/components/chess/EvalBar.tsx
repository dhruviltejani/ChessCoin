import React from "react";

interface EvalBarProps {
  scoreCp?: number; // Centipawns (+ = White advantage, - = Black advantage)
  mate?: number; // Moves to checkmate (+ = White mates, - = Black mates)
  gameResult?: string | null; // e.g. "1-0", "0-1", "1/2-1/2"
  isGameOver?: boolean;
}

export const EvalBar: React.FC<EvalBarProps> = ({ scoreCp = 0, mate, gameResult, isGameOver = false }) => {
  let whitePercent = 50;
  let label = "0.0";

  if (isGameOver && gameResult) {
    if (gameResult.startsWith("1-0")) {
      whitePercent = 100;
      label = "1-0";
    } else if (gameResult.startsWith("0-1")) {
      whitePercent = 0;
      label = "0-1";
    } else if (gameResult.includes("1/2")) {
      whitePercent = 50;
      label = "½-½";
    }
  } else if (mate !== undefined && mate !== null) {
    if (mate > 0) {
      whitePercent = 100;
      label = `M${mate}`;
    } else {
      whitePercent = 0;
      label = `-M${Math.abs(mate)}`;
    }
  } else {
    // Sigmoid curve mapping centipawns to percentage: 0 cp = 50%
    const clampedCp = Math.max(-1500, Math.min(1500, scoreCp));
    whitePercent = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clampedCp)) - 1);
    whitePercent = Math.min(98, Math.max(2, whitePercent));

    const evalPawn = Math.round((clampedCp / 100) * 10) / 10;
    label = evalPawn > 0 ? `+${evalPawn.toFixed(1)}` : evalPawn === 0 ? "0.0" : evalPawn.toFixed(1);
  }

  const isWhiteAdvantage = whitePercent >= 50;

  return (
    <div className="w-6 sm:w-7 h-full flex flex-col items-center justify-between py-1 px-0.5 rounded-lg bg-[#141b2a] border border-zinc-800/80 overflow-hidden shadow-inner relative select-none">
      {/* Top score badge for Black advantage */}
      <div className="z-10 text-[9px] font-bold font-mono">
        {!isWhiteAdvantage && (
          <span className="px-1 py-0.2 rounded bg-zinc-900/90 text-rose-300 border border-zinc-700/60 shadow-sm text-[9px]">
            {label}
          </span>
        )}
      </div>

      {/* Vertical Eval bar track */}
      <div className="w-full flex-1 relative flex flex-col justify-end rounded-md overflow-hidden my-0.5 bg-[#161c28]">
        {/* Cyan advantage fill from bottom up */}
        <div
          className="w-full bg-gradient-to-t from-cyan-500 to-[#22d3ee] transition-all duration-300 ease-out shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          style={{ height: `${whitePercent}%` }}
        />
      </div>

      {/* Bottom score badge for White advantage */}
      <div className="z-10 text-[9px] font-bold font-mono">
        {isWhiteAdvantage && (
          <span className="px-1 py-0.2 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 shadow-sm text-[9px]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default EvalBar;
