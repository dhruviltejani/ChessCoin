import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess, type Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { ChessPieces } from "./ChessPieces";
import EvalBar from "./EvalBar";
import PlayerCard from "./PlayerCard";
import BoardControls from "./BoardControls";
import PlayerAccuracyCard from "./PlayerAccuracyCard";
import NotationLedger from "./NotationLedger";
import MoveClassificationCard from "./MoveClassificationCard";
import {
  stockfish,
  classifyMove,
  type StockfishEvaluation,
  type EvaluatedMove,
} from "../../services/stockfishService";
import { chessSound } from "../../services/chessSoundService";

interface ChessGameViewProps {
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const ChessGameView: React.FC<ChessGameViewProps> = ({
  isFocusMode: externalFocusMode,
  onToggleFocusMode: externalToggleFocusMode,
}) => {
  // 1. Core chess.js game state instance
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");

  // Focus Mode state
  const [internalFocusMode, setInternalFocusMode] = useState(false);
  const isFocusMode = externalFocusMode !== undefined ? externalFocusMode : internalFocusMode;
  const toggleFocusMode = externalToggleFocusMode || (() => setInternalFocusMode((prev) => !prev));

  // Analysis Toggle (Stockfish functions: EvalBar, Accuracy, Move Classification)
  const [isAnalysisOn, setIsAnalysisOn] = useState<boolean>(false);

  // 2. Move history and review navigation state
  const [moveHistory, setMoveHistory] = useState<EvaluatedMove[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1); // -1 = initial starting board
  const [historyFens, setHistoryFens] = useState<string[]>([new Chess().fen()]);

  // 3. Stockfish Engine Evaluations (0 = equal 50%)
  const [currentEval, setCurrentEval] = useState<StockfishEvaluation>({ cp: 0 });
  const [whiteAccuracy, setWhiteAccuracy] = useState<number>(100);
  const [blackAccuracy, setBlackAccuracy] = useState<number>(100);

  // 4. Square selections and legal move dots
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // 5. Game Over state
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<string>("In Progress");

  // 6. Captured pieces
  const [capturedByWhite, setCapturedByWhite] = useState<string[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<string[]>([]);

  // 7. Auto replay state
  const [isPlayingReplay, setIsPlayingReplay] = useState<boolean>(false);
  const replayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine current active turn
  const isViewingCurrent = currentMoveIndex === moveHistory.length - 1;
  const currentTurn = game.turn(); // 'w' | 'b'

  // Escape key exits focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode) {
        toggleFocusMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode, toggleFocusMode]);

  // Handle Resign
  const handleResign = () => {
    if (isGameOver) return;
    const currentSide = game.turn();
    setIsGameOver(true);
    if (currentSide === "w") {
      setGameResult("0-1 (White resigned)");
    } else {
      setGameResult("1-0 (Black resigned)");
    }
  };

  // Reset Game / Play Again
  const handlePlayAgain = () => {
    const newG = new Chess();
    setGame(newG);
    setMoveHistory([]);
    setHistoryFens([newG.fen()]);
    setCurrentMoveIndex(-1);
    setIsGameOver(false);
    setGameResult("In Progress");
    setCurrentEval({ cp: 0 }); // Cleanly reset eval bar to 50%
    setWhiteAccuracy(100);
    setBlackAccuracy(100);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
  };

  // Helper to show legal moves when piece is clicked or dragged
  const showLegalMovesForSquare = useCallback(
    (sq: Square) => {
      if (isGameOver) return;
      const piece = game.get(sq);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(sq);
        const moves = game.moves({ square: sq, verbose: true });
        setLegalMoves(moves.map((m) => m.to as Square));
      }
    },
    [game, isGameOver]
  );

  // Execute a chess move (INSTANT 0ms RESPONSIVENESS like Chess.com, with background Stockfish eval)
  const makeMove = useCallback(
    (moveObj: { from: Square; to: Square; promotion?: string }) => {
      // Don't allow moves if reviewing historical moves
      if (currentMoveIndex < moveHistory.length - 1 || isGameOver) {
        return false;
      }

      const prevFen = game.fen();
      const prevEval = { ...currentEval };

      // Clone game instance to make move
      const newGame = new Chess(prevFen);
      try {
        const result = newGame.move(moveObj);
        if (!result) return false;

        const newFen = newGame.fen();
        const color = result.color; // 'w' | 'b'
        const isCapture = Boolean(result.captured);
        const isCheck = newGame.inCheck();
        const isCheckmate = newGame.isCheckmate();

        // 1. Play sound immediately
        if (isCheck) {
          chessSound.playCheck();
        } else if (isCapture) {
          chessSound.playCapture();
        } else {
          chessSound.playMove();
        }

        // 2. Track captured pieces
        if (result.captured) {
          const pieceSymbol = result.captured.toUpperCase();
          if (color === "w") {
            setCapturedByWhite((prev) => [...prev, pieceSymbol]);
          } else {
            setCapturedByBlack((prev) => [...prev, pieceSymbol]);
          }
        }

        // 3. Update active board state SYNCHRONOUSLY (0ms latency!)
        setGame(newGame);
        setLastMove({ from: moveObj.from, to: moveObj.to });
        setSelectedSquare(null);
        setLegalMoves([]);

        // Temporary initial classification before engine evaluation resolves
        const initialClassification = classifyMove(
          moveHistory.length + 1,
          result.san,
          color,
          prevEval,
          prevEval,
          isCapture,
          isCheck,
          isCheckmate
        );

        const newEvaluatedMove: EvaluatedMove = {
          moveNumber: Math.floor(moveHistory.length / 2) + 1,
          ply: moveHistory.length + 1,
          san: result.san,
          from: moveObj.from,
          to: moveObj.to,
          color,
          fen: newFen,
          evalBefore: prevEval,
          evalAfter: prevEval,
          classification: initialClassification.classification,
          accuracy: initialClassification.accuracy,
        };

        const updatedHistory = [...moveHistory, newEvaluatedMove];
        const moveIdx = updatedHistory.length - 1;
        setMoveHistory(updatedHistory);
        setCurrentMoveIndex(moveIdx);
        setHistoryFens((prev) => [...prev, newFen]);

        // 4. Check game over immediately
        if (isCheckmate) {
          setIsGameOver(true);
          setGameResult(color === "w" ? "1-0 (Checkmate)" : "0-1 (Checkmate)");
        } else if (newGame.isDraw()) {
          setIsGameOver(true);
          setGameResult("1/2-1/2 (Draw)");
        }

        // 5. Evaluate with Stockfish IN THE BACKGROUND ONLY when Analysis is ON!
        // Defer evaluation by 240ms so the 60fps/120fps piece move animation completes with 100% butter smoothness!
        if (isAnalysisOn) {
          setTimeout(() => {
            stockfish.evaluatePosition(newFen, 8).then((nextEval) => {
              setCurrentEval(nextEval);

              const accurateClassification = classifyMove(
                newEvaluatedMove.ply,
                newEvaluatedMove.san,
                color,
                prevEval,
                nextEval,
                isCapture,
                isCheck,
                isCheckmate
              );

              setMoveHistory((prevHistory) => {
                if (!prevHistory[moveIdx]) return prevHistory;
                const updated = [...prevHistory];
                updated[moveIdx] = {
                  ...updated[moveIdx],
                  evalAfter: nextEval,
                  classification: accurateClassification.classification,
                  accuracy: accurateClassification.accuracy,
                };

                // Recalculate average accuracy
                const whiteMoves = updated.filter((m) => m.color === "w");
                const blackMoves = updated.filter((m) => m.color === "b");
                if (whiteMoves.length > 0) {
                  const avgW = whiteMoves.reduce((acc, m) => acc + m.accuracy, 0) / whiteMoves.length;
                  setWhiteAccuracy(Math.round(avgW * 10) / 10);
                }
                if (blackMoves.length > 0) {
                  const avgB = blackMoves.reduce((acc, m) => acc + m.accuracy, 0) / blackMoves.length;
                  setBlackAccuracy(Math.round(avgB * 10) / 10);
                }

                return updated;
              });
            });
          }, 240);
        }

        return true;
      } catch (err) {
        console.error("Illegal move attempt:", err);
        return false;
      }
    },
    [currentEval, currentMoveIndex, game, isGameOver, isAnalysisOn, moveHistory]
  );

  // Handle Drag & Drop move
  // KEY REQUIREMENT: If dropped on an illegal square, piece snaps back BUT legal moves REMAIN shown on board!
  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: { pieceType: string };
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      if (!targetSquare) {
        // Dragged off board or cancelled: keep piece selected & legal moves visible
        showLegalMovesForSquare(sourceSquare as Square);
        return false;
      }

      const moveSuccessful = makeMove({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: "q", // Auto-queen on pawn promotion
      });

      if (!moveSuccessful) {
        // ILLEGAL SQUARE DROPPED:
        // Keep piece selected and keep legal moves visible so player sees where it CAN move!
        showLegalMovesForSquare(sourceSquare as Square);
        return false;
      }

      return true;
    },
    [makeMove, showLegalMovesForSquare]
  );

  // Handle Square Clicks (Instant Click-to-move)
  const onSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (isGameOver) return;
      const sq = square as Square;
      const piece = game.get(sq);

      // If a piece is already selected:
      if (selectedSquare) {
        if (selectedSquare === sq) {
          // Clicking same square deselects it
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }

        const moves = game.moves({ square: selectedSquare, verbose: true });
        const isValid = moves.some((m) => m.to === sq);

        if (isValid) {
          makeMove({
            from: selectedSquare,
            to: sq,
            promotion: "q",
          });
          return;
        } else {
          // If clicking another friendly piece, switch selection to that piece
          if (piece && piece.color === game.turn()) {
            showLegalMovesForSquare(sq);
            return;
          }
          // Clicked an illegal empty square: KEEP the piece selected and KEEP legal moves visible!
          return;
        }
      }

      // Otherwise, select the piece and show legal move dots immediately
      if (piece && piece.color === game.turn()) {
        showLegalMovesForSquare(sq);
      }
    },
    [game, isGameOver, makeMove, selectedSquare, showLegalMovesForSquare]
  );

  // History Navigation
  const navigateToMove = (idx: number) => {
    setCurrentMoveIndex(idx);
    const targetFen = idx === -1 ? historyFens[0] : historyFens[idx + 1];
    if (targetFen) {
      setGame(new Chess(targetFen));
      if (idx >= 0 && moveHistory[idx]) {
        setLastMove({
          from: moveHistory[idx].from as Square,
          to: moveHistory[idx].to as Square,
        });
        setCurrentEval(moveHistory[idx].evalAfter);
      } else {
        setLastMove(null);
        setCurrentEval({ cp: 0 });
      }
    }
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const handleFirstMove = () => navigateToMove(-1);
  const handlePrevMove = () => {
    if (currentMoveIndex > -1) {
      navigateToMove(currentMoveIndex - 1);
    }
  };
  const handleNextMove = () => {
    if (currentMoveIndex < moveHistory.length - 1) {
      navigateToMove(currentMoveIndex + 1);
    }
  };
  const handleLastMove = () => navigateToMove(moveHistory.length - 1);

  // Auto Replay feature
  const handleTogglePlay = () => {
    if (isPlayingReplay) {
      setIsPlayingReplay(false);
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    } else {
      setIsPlayingReplay(true);
      if (currentMoveIndex >= moveHistory.length - 1) {
        navigateToMove(-1);
      }
    }
  };

  useEffect(() => {
    if (!isPlayingReplay) return;

    replayTimerRef.current = setInterval(() => {
      setCurrentMoveIndex((prev) => {
        if (prev >= moveHistory.length - 1) {
          setIsPlayingReplay(false);
          if (replayTimerRef.current) clearInterval(replayTimerRef.current);
          return prev;
        }
        const next = prev + 1;
        const targetFen = historyFens[next + 1];
        if (targetFen) {
          setGame(new Chess(targetFen));
          if (moveHistory[next]) {
            setLastMove({
              from: moveHistory[next].from as Square,
              to: moveHistory[next].to as Square,
            });
            setCurrentEval(moveHistory[next].evalAfter);
          }
        }
        return next;
      });
    }, 1000);

    return () => {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, [isPlayingReplay, historyFens, moveHistory]);

  // Flip board orientation
  const handleFlipBoard = () => {
    setBoardOrientation((prev) => (prev === "white" ? "black" : "white"));
  };

  // Export PGN
  const handleExportPgn = () => {
    const pgn = game.pgn();
    const blob = new Blob([pgn || "1. e4 e5"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chess_game_${Date.now()}.pgn`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Share Game link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Game link copied to clipboard!");
    }
  };

  // Custom square styles (highlights & legal move dots) - MEMOIZED to eliminate re-render jank
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Selected square highlight
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: "rgba(6, 182, 212, 0.45)",
        boxShadow: "inset 0 0 0 2px #00bcd4",
      };
    }

    // Last move from/to squares highlight
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: "rgba(6, 182, 212, 0.22)",
      };
      styles[lastMove.to] = {
        backgroundColor: "rgba(6, 182, 212, 0.32)",
      };
    }

    // Legal move hint indicators: crisp dots on empty squares, target rings on enemy pieces
    legalMoves.forEach((sq) => {
      const hasPiece = game.get(sq);
      styles[sq] = {
        background: hasPiece
          ? "radial-gradient(circle, transparent 62%, rgba(6, 182, 212, 0.9) 64%, rgba(6, 182, 212, 0.9) 76%, transparent 78%)"
          : "radial-gradient(circle, rgba(6, 182, 212, 0.8) 25%, transparent 27%)",
        cursor: "pointer",
      };
    });

    return styles;
  }, [selectedSquare, lastMove, legalMoves, game]);

  // Dynamic Board Sizing: measures container and sets exact 1:1 square dimensions
  // guaranteeing Rank 1 and Rank 8 are 100% visible on ANY monitor or laptop without vertical scroll
  const viewContainerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const h = window.innerHeight;
      const w = window.innerWidth;
      return Math.max(280, Math.min(h - 160, w - 300, 560));
    }
    return 480;
  });

  useEffect(() => {
    const calculateSize = () => {
      if (!viewContainerRef.current) return;
      const rect = viewContainerRef.current.getBoundingClientRect();
      const availableHeight = rect.height || window.innerHeight;
      const availableWidth = rect.width || (window.innerWidth - 240);

      // Non-board vertical elements:
      // Black PlayerCard (~30px) + White PlayerCard (~30px) + BoardControls (~38px)
      // Spacing gaps and board wrapper padding (~28px)
      // Safe buffer margin (~16px)
      const verticalOverhead = 142;
      const maxH = Math.max(260, availableHeight - verticalOverhead);

      // Horizontal elements:
      let horizontalOverhead = 24;
      if (isAnalysisOn && !isFocusMode) {
        // Right Analysis Panel: ~310px + gap 16px = 326px
        // EvalBar on left: ~28px + gap 10px = 38px
        // Outer wrapper padding & safe buffer: ~28px
        horizontalOverhead = 392;
      } else if (isAnalysisOn && isFocusMode) {
        horizontalOverhead = 66; // EvalBar + padding
      }

      const maxW = Math.max(260, availableWidth - horizontalOverhead);

      // Board must be square: strictly min of maxH and maxW
      let size = Math.floor(Math.min(maxH, maxW));

      // Maximum ceilings for optimal proportion
      const maxCap = isAnalysisOn
        ? isFocusMode ? 620 : 520
        : isFocusMode ? 740 : 640;

      size = Math.min(size, maxCap);
      setBoardSize((prev) => (prev !== size ? size : prev));
    };

    calculateSize();

    const observer = new ResizeObserver(() => {
      calculateSize();
    });

    if (viewContainerRef.current) {
      observer.observe(viewContainerRef.current);
    }
    window.addEventListener("resize", calculateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", calculateSize);
    };
  }, [isAnalysisOn, isFocusMode]);

  const totalBoardColumnWidth = isAnalysisOn ? boardSize + 56 : boardSize + 16;

  // Memoized options passed to react-chessboard to prevent unnecessary context & drag re-instantiations
  const chessboardOptions = useMemo(
    () => ({
      position: game.fen(),
      boardOrientation,
      onPieceDrop,
      onSquareClick,
      onPieceClick: ({ square }: { square?: string | null }) => {
        if (square) onSquareClick({ square });
      },
      onPieceDrag: ({ square }: { square?: string | null }) => {
        if (square) showLegalMovesForSquare(square as Square);
      },
      onPieceDragCancel: () => {},
      canDragPiece: ({ piece }: { piece: { pieceType: string } }) => {
        if (isGameOver) return false;
        return piece.pieceType.startsWith(game.turn());
      },
      pieces: ChessPieces,
      boardStyle: {
        width: "100%",
        height: "100%",
        borderRadius: "0.75rem",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
      },
      draggingPieceStyle: {
        transform: "scale(1.15)",
        cursor: "grabbing",
        transition: "none",
        willChange: "transform",
        zIndex: 100,
      },
      draggingPieceGhostStyle: {
        opacity: 0.35,
      },
      // Exact slate-blue theme matching reference image
      lightSquareStyle: { backgroundColor: "#cdd9e5" },
      darkSquareStyle: { backgroundColor: "#476685" },
      squareStyles: customSquareStyles,
      animationDurationInMs: 220, // Buttery smooth 220ms Chess.com gliding animation
      showNotation: true,
      darkSquareNotationStyle: { color: "#cdd9e5", fontWeight: 700, fontSize: "10px" },
      lightSquareNotationStyle: { color: "#476685", fontWeight: 700, fontSize: "10px" },
    }),
    [
      game,
      boardOrientation,
      onPieceDrop,
      onSquareClick,
      showLegalMovesForSquare,
      isGameOver,
      customSquareStyles,
    ]
  );

  return (
    <div
      ref={viewContainerRef}
      className={`flex flex-col lg:flex-row items-center justify-center w-full h-full max-h-screen overflow-hidden select-none transition-all duration-300 ${
        isAnalysisOn && !isFocusMode ? "gap-4 xl:gap-6" : "gap-0"
      }`}
    >
      {/* ========================================================= */}
      {/* MAIN CHESSBOARD COLUMN: Black Card, Board (+ optional EvalBar with left space), White Card, Controls */}
      {/* ========================================================= */}
      <div
        className="flex flex-col justify-center items-center space-y-1 shrink-0 transition-all duration-200"
        style={{ width: totalBoardColumnWidth }}
      >
        {/* 1. Black Player Card (Clean "Black") */}
        <div className="w-full">
          <PlayerCard
            side="Black"
            capturedPieces={capturedByBlack}
            isActiveTurn={currentTurn === "b" && isViewingCurrent && !isGameOver}
          />
        </div>

        {/* 2. Chessboard Container with optional Vertical Evaluation Bar */}
        <div className="w-full rounded-2xl bg-[#0c101a]/95 border border-zinc-800/80 p-2 shadow-2xl flex items-center justify-center gap-2 sm:gap-2.5 relative">
          {/* Subtle Ambient Backlight Glow */}
          <div className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 blur-[80px]" />

          {/* Vertical Stockfish Evaluation Bar (ONLY shown when Analysis toggle is ON) */}
          {/* Has dedicated left margin / space (pl-1 sm:pl-1.5) so it doesn't touch the outer edge */}
          {isAnalysisOn && (
            <div
              style={{ height: boardSize }}
              className="shrink-0 flex items-stretch pl-1 sm:pl-1.5 animate-in fade-in duration-200"
            >
              <EvalBar
                scoreCp={currentEval.cp}
                mate={currentEval.mate}
                gameResult={gameResult}
                isGameOver={isGameOver}
              />
            </div>
          )}

          {/* Main Chessboard Frame */}
          <div
            style={{ width: boardSize, height: boardSize }}
            className="rounded-xl overflow-hidden shadow-2xl border border-zinc-700/60 relative shrink-0"
          >
            <Chessboard options={chessboardOptions} />

            {/* Game Over Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-xl mb-2 shadow-lg shadow-cyan-500/20">
                  ♚
                </div>
                <h3 className="text-lg font-extrabold text-white tracking-wide">
                  Game Over
                </h3>
                <p className="text-cyan-300 text-xs font-semibold mt-0.5">
                  Result: {gameResult}
                </p>
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 text-xs font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. White Player Card (Clean "White") */}
        <div className="w-full">
          <PlayerCard
            side="White"
            capturedPieces={capturedByWhite}
            isActiveTurn={currentTurn === "w" && isViewingCurrent && !isGameOver}
          />
        </div>

        {/* 4. Controls Toolbar (|<, <, Play, >, >|, Analysis Toggle, Focus Mode, Resign, Flip, PGN, Share) */}
        <div className="w-full">
          <BoardControls
            canGoBack={currentMoveIndex > -1}
            canGoForward={currentMoveIndex < moveHistory.length - 1}
            isPlaying={isPlayingReplay}
            isGameOver={isGameOver}
            isFocusMode={isFocusMode}
            isAnalysisOn={isAnalysisOn}
            onToggleAnalysis={() => setIsAnalysisOn((prev) => !prev)}
            onToggleFocusMode={toggleFocusMode}
            onFirstMove={handleFirstMove}
            onPrevMove={handlePrevMove}
            onTogglePlay={handleTogglePlay}
            onNextMove={handleNextMove}
            onLastMove={handleLastMove}
            onFlipBoard={handleFlipBoard}
            onExportPgn={handleExportPgn}
            onShare={handleShare}
            onResign={handleResign}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: Accuracy Card + Notation Ledger + Move Classification */}
      {/* (ONLY displayed when Analysis toggle is ON and Focus Mode is OFF) */}
      {/* ========================================================= */}
      {isAnalysisOn && !isFocusMode && (
        <div className="flex flex-col space-y-2 w-full lg:w-[300px] xl:w-[330px] shrink-0 animate-in fade-in duration-200">
          {/* 1. Accuracy Card on Right Side */}
          <PlayerAccuracyCard
            whiteAccuracy={whiteAccuracy}
            blackAccuracy={blackAccuracy}
            whiteName="White"
            blackName="Black"
          />

          {/* 2. Notation Ledger */}
          <NotationLedger
            moves={moveHistory}
            currentMoveIndex={currentMoveIndex}
            onSelectMove={navigateToMove}
            result={gameResult === "In Progress" ? "1-0" : gameResult}
          />

          {/* 3. Move Classification Breakdown */}
          <MoveClassificationCard
            moves={moveHistory}
            whiteName="White"
            blackName="Black"
          />
        </div>
      )}
    </div>
  );
};

export default ChessGameView;
