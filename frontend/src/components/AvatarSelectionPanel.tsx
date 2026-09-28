import React from "react";
import { AlertCircle, Check, Sparkles, Trophy } from "lucide-react";
import { CHESS_PIECES, getChessPiece, type ChessPieceId } from "./chessPieces";

export interface AvatarSelectionPanelProps {
  selectedPieceId: ChessPieceId;
  onSelectPiece: (pieceId: ChessPieceId) => void;
  displayName?: string;
  handle?: string;
  error?: string;
  className?: string;
}

export const AvatarSelectionPanel: React.FC<AvatarSelectionPanelProps> = ({
  selectedPieceId,
  onSelectPiece,
  displayName = "",
  handle = "",
  error,
  className = "",
}) => {
  const selectedPiece = getChessPiece(selectedPieceId);
  const SelectedIcon = selectedPiece.icon;

  return (
    <div
      className={`w-full lg:w-80 xl:w-96 bg-zinc-950/60 p-5 sm:p-6 lg:p-6 flex flex-col justify-between border-t lg:border-t-0 border-zinc-800/80 ${className}`}
    >
      <div>
        {/* Right Panel Header */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-cyan-400 uppercase">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Profile Identity</span>
          </div>
          <h2 className="mt-0.5 text-base sm:text-lg font-semibold text-zinc-100">
            Select Chess Piece
          </h2>
          <p className="text-xs text-zinc-400">
            Pick your signature piece as your profile avatar.
          </p>
        </div>

        {/* Selected Piece Showcase Preview Card */}
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-linear-to-br from-cyan-950/40 via-zinc-900 to-zinc-950 p-3.5 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center gap-3">
            {/* Single Avatar Icon Container with neon glow */}
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border border-cyan-400/50 bg-zinc-900 shadow-md shadow-cyan-500/25">
              <SelectedIcon className="h-7 w-7 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
            </div>

            {/* Player Preview Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-100">
                {displayName.trim() || "Player Name"}
              </p>

              <p className="truncate text-xs text-zinc-400">
                @{handle.trim() || "handle"}
              </p>

              <p className="mt-0.5 text-[11px] text-cyan-400 font-medium truncate">
                {selectedPiece.name} • {selectedPiece.role}
              </p>
            </div>
          </div>

          {/* Subtitle / Piece motto */}
          <p
            title={`"${selectedPiece.tagline}"`}
            className="mt-2 text-[11px] text-zinc-400 leading-snug border-t border-zinc-800/80 pt-2 italic truncate"
          >
            "{selectedPiece.tagline}"
          </p>
        </div>

        {/* Chess Pieces Selection Grid (3 columns x 2 rows) */}
        <div className="mt-3">
          <label className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
            Choose Piece Avatar
          </label>
          {error && (
            <div className="mt-1 space-y-0.5">
              <p className="flex items-center gap-1 text-[11px] text-rose-400">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{error}</span>
              </p>
            </div>
          )}
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {CHESS_PIECES.map((piece) => {
              const isSelected = selectedPieceId === piece.id;
              const PieceIcon = piece.icon;

              return (
                <button
                  key={piece.id}
                  type="button"
                  onClick={() => onSelectPiece(piece.id)}
                  className={`group relative flex flex-col items-center justify-center rounded-xl py-3 px-2 transition-all duration-150 ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-md shadow-cyan-500/15 ring-1 ring-cyan-400/40"
                      : "border border-zinc-800/80 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }`}
                  title={`${piece.name} - ${piece.role}`}
                >
                  {/* Selected Indicator Pill */}
                  {isSelected && (
                    <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-zinc-950">
                      <Check className="h-2.5 w-2.5 stroke-3" />
                    </div>
                  )}

                  {/* SINGLE Piece Icon */}
                  <div className="flex items-center justify-center">
                    <PieceIcon
                      className={`h-6 w-6 transition-transform duration-200 group-hover:scale-110 ${
                        isSelected
                          ? "text-cyan-400"
                          : "text-zinc-400 group-hover:text-zinc-200"
                      }`}
                    />
                  </div>

                  {/* Piece Name */}
                  <span
                    className={`mt-1.5 text-xs font-semibold tracking-tight ${
                      isSelected ? "text-cyan-200" : "text-zinc-300"
                    }`}
                  >
                    {piece.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Insight Badge */}
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/50 px-2.5 py-2 text-[11px] text-zinc-400">
        <Trophy className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
        <span className="leading-tight">
          Your piece appears on matchboards, leaderboards, rating stats and tournament standings.
        </span>
      </div>
    </div>
  );
};

export default AvatarSelectionPanel;
