import React, { useState } from "react";
import {
  ArrowUpDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Download,
  Flag,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Share2,
} from "lucide-react";

interface BoardControlsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  isPlaying: boolean;
  isGameOver: boolean;
  isFocusMode: boolean;
  isAnalysisOn: boolean;
  onToggleAnalysis: () => void;
  onToggleFocusMode: () => void;
  onFirstMove: () => void;
  onPrevMove: () => void;
  onTogglePlay: () => void;
  onNextMove: () => void;
  onLastMove: () => void;
  onFlipBoard: () => void;
  onExportPgn: () => void;
  onShare: () => void;
  onResign: () => void;
}

export const BoardControls: React.FC<BoardControlsProps> = ({
  canGoBack,
  canGoForward,
  isPlaying,
  isGameOver,
  isFocusMode,
  isAnalysisOn,
  onToggleAnalysis,
  onToggleFocusMode,
  onFirstMove,
  onPrevMove,
  onTogglePlay,
  onNextMove,
  onLastMove,
  onFlipBoard,
  onExportPgn,
  onShare,
  onResign,
}) => {
  const [confirmResign, setConfirmResign] = useState(false);

  const handleResignClick = () => {
    if (confirmResign) {
      onResign();
      setConfirmResign(false);
    } else {
      setConfirmResign(true);
      setTimeout(() => setConfirmResign(false), 3000);
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-[#0c101a]/95 border border-zinc-800/80 shadow-md select-none w-full">
      {/* Left: Move Navigation Controls */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {/* First Move */}
        <button
          type="button"
          onClick={onFirstMove}
          disabled={!canGoBack}
          aria-label="First Move"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
        >
          <ChevronFirst className="h-3.5 w-3.5" />
        </button>

        {/* Previous Move */}
        <button
          type="button"
          onClick={onPrevMove}
          disabled={!canGoBack}
          aria-label="Previous Move"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Play / Pause Replay Button (Cyan button from image) */}
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="p-1.5 sm:p-2 rounded-lg bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 font-bold shadow-md shadow-cyan-500/25 active:scale-95 transition cursor-pointer flex items-center justify-center"
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5 stroke-[2.5]" />
          ) : (
            <Play className="h-3.5 w-3.5 stroke-[2.5] fill-zinc-950" />
          )}
        </button>

        {/* Next Move */}
        <button
          type="button"
          onClick={onNextMove}
          disabled={!canGoForward}
          aria-label="Next Move"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Last Move */}
        <button
          type="button"
          onClick={onLastMove}
          disabled={!canGoForward}
          aria-label="Last Move"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
        >
          <ChevronLast className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Right: Utilities (Analysis Toggle, Focus Mode, Resign, Flip, Export PGN, Share) */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Analysis Toggle Switch (Stockfish on/off) */}
        <button
          type="button"
          onClick={onToggleAnalysis}
          title={isAnalysisOn ? "Turn Stockfish Analysis OFF" : "Turn Stockfish Analysis ON"}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer border ${
            isAnalysisOn
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60"
          }`}
        >
          <Cpu className={`h-3 w-3 ${isAnalysisOn ? "text-cyan-400" : "text-zinc-500"}`} />
          <span className="hidden sm:inline">{isAnalysisOn ? "Analysis ON" : "Analysis"}</span>
          <span className="sm:hidden">{isAnalysisOn ? "ON" : "Eval"}</span>
        </button>

        {/* Focus Mode Button */}
        <button
          type="button"
          onClick={onToggleFocusMode}
          title={isFocusMode ? "Exit Focus Mode (Esc)" : "Enter Fullscreen Focus Mode"}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer border ${
            isFocusMode
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60"
          }`}
        >
          {isFocusMode ? (
            <>
              <Minimize2 className="h-3 w-3 text-cyan-400" />
              <span>Exit</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3 w-3 text-zinc-400" />
              <span className="hidden sm:inline">Focus</span>
            </>
          )}
        </button>

        {/* Resign Button */}
        {!isGameOver && (
          <button
            type="button"
            onClick={handleResignClick}
            title={confirmResign ? "Click again to confirm Resign" : "Resign Game"}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer border ${
              confirmResign
                ? "bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30"
            }`}
          >
            <Flag className="h-3 w-3" />
            <span>{confirmResign ? "Confirm?" : "Resign"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onFlipBoard}
          title="Flip Board"
          aria-label="Flip Board"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onExportPgn}
          title="Export PGN"
          aria-label="Export PGN"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onShare}
          title="Share Game"
          aria-label="Share Game"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default BoardControls;
