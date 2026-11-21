import React, { useEffect, useRef } from "react";
import { Check, FileSpreadsheet } from "lucide-react";
import type { EvaluatedMove, MoveClassificationType } from "../../services/stockfishService";

interface NotationLedgerProps {
  moves: EvaluatedMove[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
  result?: string;
}

// Render small badge icon for move classification
const RenderBadge: React.FC<{ classification: MoveClassificationType }> = ({ classification }) => {
  switch (classification) {
    case "brilliant":
      return (
        <span className="inline-flex items-center justify-center px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-[9px] font-black font-mono ml-1">
          !!
        </span>
      );
    case "great":
      return (
        <span className="inline-flex items-center justify-center px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400 text-[9px] font-black font-mono ml-1">
          !
        </span>
      );
    case "best":
      return (
        <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[8px] font-bold ml-1">
          ★
        </span>
      );
    case "excellent":
    case "good":
      return (
        <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-emerald-500/15 text-emerald-400 ml-1">
          <Check className="w-2 h-2" />
        </span>
      );
    case "book":
      return (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-1 inline-block shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
      );
    case "inaccuracy":
      return (
        <span className="inline-flex items-center justify-center px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400 text-[9px] font-bold font-mono ml-1">
          ?!
        </span>
      );
    case "mistake":
      return (
        <span className="inline-flex items-center justify-center px-1 py-0.2 rounded bg-orange-500/25 text-orange-400 border border-orange-500/50 text-[9px] font-bold font-mono ml-1">
          ?
        </span>
      );
    case "blunder":
      return (
        <span className="inline-flex items-center justify-center px-1 py-0.2 rounded bg-rose-500/25 text-rose-300 border border-rose-500/50 text-[9px] font-black font-mono ml-1">
          ??
        </span>
      );
    default:
      return null;
  }
};

export const NotationLedger: React.FC<NotationLedgerProps> = ({
  moves,
  currentMoveIndex,
  onSelectMove,
  result = "1-0",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group plies into full move turns (White + Black)
  const fullMoves: { moveNumber: number; white?: EvaluatedMove; black?: EvaluatedMove; whiteIdx?: number; blackIdx?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const white = moves[i];
    const black = moves[i + 1];
    fullMoves.push({
      moveNumber: Math.floor(i / 2) + 1,
      white,
      black,
      whiteIdx: i,
      blackIdx: i + 1 < moves.length ? i + 1 : undefined,
    });
  }

  // Auto-scroll to active move
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentMoveIndex]);

  return (
    <div className="rounded-2xl bg-[#0c101a]/95 border border-zinc-800/80 p-3 shadow-xl flex flex-col max-h-[220px] select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <FileSpreadsheet className="h-3 w-3" />
          </div>
          <h2 className="text-[11px] font-bold tracking-wider text-white uppercase">
            NOTATION LEDGER
          </h2>
        </div>
        <span className="text-[10px] font-semibold text-zinc-400 font-mono">
          {fullMoves.length} Moves {moves.length > 0 ? `(${result})` : ""}
        </span>
      </div>

      {/* Move History Table */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto mt-1.5 pr-1 space-y-0.5 text-xs">
        {fullMoves.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-zinc-500 text-[11px]">
            <span>Make a move to start ledger</span>
          </div>
        ) : (
          fullMoves.map((fm) => {
            const isWhiteActive = currentMoveIndex === fm.whiteIdx;
            const isBlackActive = currentMoveIndex === fm.blackIdx;
            const isRowActive = isWhiteActive || isBlackActive;

            return (
              <div
                key={fm.moveNumber}
                data-active={isRowActive}
                className={`flex items-center py-1 px-2 rounded-lg transition-colors ${
                  isRowActive ? "bg-cyan-950/40 border border-cyan-500/30" : "hover:bg-zinc-800/30"
                }`}
              >
                {/* Move Number */}
                <span className="w-6 text-[10px] font-mono text-zinc-500 font-semibold shrink-0">
                  {fm.moveNumber}.
                </span>

                {/* White Move */}
                <div
                  onClick={() => fm.whiteIdx !== undefined && onSelectMove(fm.whiteIdx)}
                  className={`flex-1 flex items-center cursor-pointer px-1.5 py-0.2 rounded transition ${
                    isWhiteActive
                      ? "bg-cyan-500/20 text-cyan-300 font-bold"
                      : "text-zinc-200 hover:text-white"
                  }`}
                >
                  <span className="font-mono text-[11px] font-semibold">{fm.white?.san}</span>
                  {fm.white && <RenderBadge classification={fm.white.classification} />}
                </div>

                {/* Black Move */}
                <div
                  onClick={() => fm.blackIdx !== undefined && onSelectMove(fm.blackIdx)}
                  className={`flex-1 flex items-center cursor-pointer px-1.5 py-0.2 rounded transition ${
                    isBlackActive
                      ? "bg-cyan-500/20 text-cyan-300 font-bold"
                      : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {fm.black && (
                    <>
                      <span className="font-mono text-[11px] font-semibold">{fm.black.san}</span>
                      <RenderBadge classification={fm.black.classification} />
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotationLedger;
