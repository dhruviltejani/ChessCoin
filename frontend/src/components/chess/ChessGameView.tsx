import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Chess, type Square } from "chess.js";
import { Chessboard, defaultPieces } from "react-chessboard";
import { Bot, X } from "lucide-react";
import EvalBar from "./EvalBar";
import PlayerCard from "./PlayerCard";
import BoardControls from "./BoardControls";
import PlayerAccuracyCard from "./PlayerAccuracyCard";
import NotationLedger from "./NotationLedger";
import MoveClassificationCard from "./MoveClassificationCard";
import BotSelectorModal from "./BotSelectorModal";
import {
  stockfish,
  classifyMove,
  type StockfishEvaluation,
  type EvaluatedMove,
} from "../../services/stockfishService";
import { chessSound } from "../../services/chessSoundService";
import {
  getChessBotById,
  pickRandomDialogue,
  type ChessBot,
} from "../../data/chessBots";
import { chessBotEngine } from "../../services/chessBotEngine";

interface ChessGameViewProps {
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  initialBotId?: string | null;
  initialPlayerColor?: "w" | "b";
  playerName?: string;
}

export const ChessGameView: React.FC<ChessGameViewProps> = ({
  isFocusMode: externalFocusMode,
  onToggleFocusMode: externalToggleFocusMode,
  initialBotId = null,
  initialPlayerColor = "w",
  playerName = "Dhruvil",
}) => {
  // 0. Bot & Player Color State
  const [selectedBot, setSelectedBot] = useState<ChessBot | null>(() =>
    getChessBotById(initialBotId)
  );
  const [playerColor, setPlayerColor] = useState<"w" | "b">(initialPlayerColor);
  const [botDialogue, setBotDialogue] = useState<string | null>(() => {
    const bot = getChessBotById(initialBotId);
    return bot ? pickRandomDialogue(bot.dialogue.onStart) : null;
  });
  const [isBotModalOpen, setIsBotModalOpen] = useState<boolean>(false);
  const gameGenerationRef = useRef<number>(0);

  // 1. Core chess.js game state instance
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(
    initialBotId && initialPlayerColor === "b" ? "black" : "white"
  );

  // Focus Mode state
  const [internalFocusMode, setInternalFocusMode] = useState(false);
  const isFocusMode = externalFocusMode !== undefined ? externalFocusMode : internalFocusMode;
  const toggleFocusMode = useCallback(() => {
    if (externalToggleFocusMode) {
      externalToggleFocusMode();
    } else {
      setInternalFocusMode((prev) => !prev);
    }
  }, [externalToggleFocusMode]);

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

  // 4. Square selections, legal move dots, and pending pawn promotion
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
    color: "w" | "b";
  } | null>(null);

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
  const botColor: "w" | "b" = playerColor === "w" ? "b" : "w";
  const isBotThinking = Boolean(selectedBot) && !isGameOver && isViewingCurrent && currentTurn === botColor;

  // Reset helper
  const resetBoardForMatch = useCallback(
    (nextBot: ChessBot | null, nextPlayerColor: "w" | "b") => {
      gameGenerationRef.current += 1;
      const newG = new Chess();
      setGame(newG);
      setMoveHistory([]);
      setHistoryFens([newG.fen()]);
      setCurrentMoveIndex(-1);
      setIsGameOver(false);
      setGameResult("In Progress");
      setCurrentEval({ cp: 0 });
      setWhiteAccuracy(100);
      setBlackAccuracy(100);
      setCapturedByWhite([]);
      setCapturedByBlack([]);
      setSelectedSquare(null);
      setLegalMoves([]);
      setLastMove(null);
      setPendingPromotion(null);
      setIsPlayingReplay(false);
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);

      setSelectedBot(nextBot);
      setPlayerColor(nextPlayerColor);
      setBoardOrientation(nextBot && nextPlayerColor === "b" ? "black" : "white");
      setBotDialogue(nextBot ? pickRandomDialogue(nextBot.dialogue.onStart) : null);
    },
    []
  );

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
    gameGenerationRef.current += 1;
    setPendingPromotion(null);
    setIsGameOver(true);

    if (selectedBot) {
      if (playerColor === "w") {
        setGameResult(`0-1 (${playerName} resigned)`);
      } else {
        setGameResult(`1-0 (${playerName} resigned)`);
      }
      setBotDialogue(pickRandomDialogue(selectedBot.dialogue.onWin));
      return;
    }

    const currentSide = game.turn();
    if (currentSide === "w") {
      setGameResult("0-1 (White resigned)");
    } else {
      setGameResult("1-0 (Black resigned)");
    }
  };

  // Reset Game / Play Again
  const handlePlayAgain = () => {
    resetBoardForMatch(selectedBot, playerColor);
  };

  // Helper to show legal moves when piece is clicked or dragged
  const showLegalMovesForSquare = useCallback(
    (sq: Square) => {
      if (isGameOver) return;
      if (selectedBot && (game.turn() !== playerColor || isBotThinking)) return;
      const piece = game.get(sq);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(sq);
        const moves = game.moves({ square: sq, verbose: true });
        setLegalMoves(moves.map((m) => m.to as Square));
      }
    },
    [game, isGameOver, selectedBot, playerColor, isBotThinking]
  );

  // Helper to rebuild a Chess instance preserving full move history & repetition counts
  const rebuildGameFromHistory = useCallback(
    (moves: EvaluatedMove[], upToIndex: number): Chess => {
      const rebuilt = new Chess();
      for (let i = 0; i <= upToIndex; i++) {
        const mv = moves[i];
        if (mv) {
          rebuilt.move(mv.san);
        }
      }
      return rebuilt;
    },
    []
  );

  // Count how many times the currently viewed board position has appeared (FIDE 4-field key)
  const currentRepetitionCount = useMemo(() => {
    const activeFenIndex = currentMoveIndex + 1;
    const currentFen = historyFens[activeFenIndex];
    if (!currentFen) return 1;
    const targetKey = currentFen.split(" ").slice(0, 4).join(" ");
    let count = 0;
    for (let i = 0; i <= activeFenIndex && i < historyFens.length; i++) {
      if (historyFens[i].split(" ").slice(0, 4).join(" ") === targetKey) {
        count++;
      }
    }
    return count;
  }, [historyFens, currentMoveIndex]);

  // Execute a chess move (INSTANT 0ms RESPONSIVENESS like Chess.com, with background Stockfish eval)
  const makeMove = useCallback(
    (moveObj: { from: Square; to: Square; promotion?: string }) => {
      // Don't allow moves if reviewing historical moves
      if (currentMoveIndex < moveHistory.length - 1 || isGameOver) {
        return false;
      }

      const prevEval = { ...currentEval };

      // Clone full game history so threefold repetition, 50-move rule, and PGN remain intact
      const newGame = rebuildGameFromHistory(moveHistory, moveHistory.length - 1);
      try {
        const result = newGame.move(moveObj);
        if (!result) return false;

        const newFen = newGame.fen();
        const color = result.color; // 'w' | 'b'
        const isCapture = Boolean(result.captured);
        const isCheck = newGame.inCheck();
        const isCheckmate = newGame.isCheckmate();
        const isThreefoldRepetition = newGame.isThreefoldRepetition();
        const isDraw = newGame.isDraw();

        // 1. Play sound immediately
        if (isDraw && !isCheckmate) {
          chessSound.playDraw();
        } else if (isCheck) {
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

        // 4. Contextual Bot Banter & Game Over check
        if (isCheckmate) {
          setIsGameOver(true);
          setGameResult(color === "w" ? "1-0 (Checkmate)" : "0-1 (Checkmate)");
          if (selectedBot) {
            const botWon = color === botColor;
            setBotDialogue(
              pickRandomDialogue(
                botWon ? selectedBot.dialogue.onWin : selectedBot.dialogue.onLose
              )
            );
          }
        } else if (isDraw) {
          setIsGameOver(true);
          const drawReason = isThreefoldRepetition
            ? "Draw by Repetition"
            : newGame.isStalemate()
            ? "Stalemate"
            : newGame.isInsufficientMaterial()
            ? "Insufficient Material"
            : newGame.isDrawByFiftyMoves()
            ? "50-Move Rule"
            : "Draw";
          setGameResult(`1/2-1/2 (${drawReason})`);
          if (selectedBot) {
            setBotDialogue(pickRandomDialogue(selectedBot.dialogue.onDraw));
          }
        } else if (selectedBot) {
          const isBotMove = color === botColor;
          if (isBotMove) {
            if (isCheck) {
              setBotDialogue(pickRandomDialogue(selectedBot.dialogue.onCheck));
            } else if (isCapture) {
              setBotDialogue(pickRandomDialogue(selectedBot.dialogue.onCapture));
            }
          } else if (Math.random() < 0.35) {
            setBotDialogue(pickRandomDialogue(selectedBot.dialogue.onPlayerMove));
          }
        }

        // 5. Evaluate with Stockfish IN THE BACKGROUND ONLY when Analysis is ON!
        if (isAnalysisOn) {
          const activeGen = gameGenerationRef.current;
          setTimeout(() => {
            if (gameGenerationRef.current !== activeGen) return;
            stockfish.evaluatePosition(newFen, 8).then((nextEval) => {
              if (gameGenerationRef.current !== activeGen) return;
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

              if (selectedBot && accurateClassification.classification === "blunder") {
                if (color === playerColor) {
                  setBotDialogue(pickRandomDialogue(selectedBot.dialogue.onBlunderByPlayer));
                } else {
                  setBotDialogue(pickRandomDialogue(selectedBot.dialogue.onBotBlunder));
                }
              }

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
                  const avgW =
                    whiteMoves.reduce((acc, m) => acc + m.accuracy, 0) / whiteMoves.length;
                  setWhiteAccuracy(Math.round(avgW * 10) / 10);
                }
                if (blackMoves.length > 0) {
                  const avgB =
                    blackMoves.reduce((acc, m) => acc + m.accuracy, 0) / blackMoves.length;
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
    [
      currentEval,
      currentMoveIndex,
      isGameOver,
      isAnalysisOn,
      moveHistory,
      rebuildGameFromHistory,
      selectedBot,
      botColor,
      playerColor,
    ]
  );

  // Trigger Bot Move automatically when it's the bot's turn
  useEffect(() => {
    if (!selectedBot || isGameOver || !isViewingCurrent) return;
    if (game.turn() !== botColor) return;

    let cancelled = false;
    const activeGen = gameGenerationRef.current;
    const fen = game.fen();
    const sanHistory = moveHistory.map((m) => m.san);
    const [minDelay, maxDelay] = selectedBot.engine.thinkTimeMs;
    const delayMs = minDelay + Math.random() * (maxDelay - minDelay);

    const delayPromise = new Promise<void>((resolve) => {
      setTimeout(resolve, delayMs);
    });

    Promise.all([chessBotEngine.chooseMove(fen, selectedBot, sanHistory), delayPromise])
      .then(([botMove]) => {
        if (cancelled || gameGenerationRef.current !== activeGen) return;
        if (botMove) {
          makeMove(botMove);
        }
      })
      .catch(() => {
        // Ignore cancelled bot errors
      });

    return () => {
      cancelled = true;
    };
  }, [selectedBot, isGameOver, isViewingCurrent, game, botColor, moveHistory, makeMove]);

  // Check if moving from -> to is a legal pawn promotion
  const isPromotionMove = useCallback(
    (from: Square, to: Square): boolean => {
      const moves = game.moves({ square: from, verbose: true });
      return moves.some((m) => m.to === to && Boolean(m.promotion));
    },
    [game]
  );

  // Handle Drag & Drop move
  const onPieceDrop = useCallback(
    ({
      sourceSquare,
      targetSquare,
    }: {
      piece: { pieceType: string };
      sourceSquare: string;
      targetSquare: string | null;
    }): boolean => {
      if (pendingPromotion) return false;
      if (selectedBot && (game.turn() !== playerColor || isBotThinking)) {
        return false;
      }

      if (!targetSquare) {
        showLegalMovesForSquare(sourceSquare as Square);
        return false;
      }

      const fromSq = sourceSquare as Square;
      const toSq = targetSquare as Square;

      if (isPromotionMove(fromSq, toSq)) {
        setPendingPromotion({ from: fromSq, to: toSq, color: game.turn() });
        setSelectedSquare(null);
        setLegalMoves([]);
        return false;
      }

      const moveSuccessful = makeMove({
        from: fromSq,
        to: toSq,
      });

      if (!moveSuccessful) {
        showLegalMovesForSquare(fromSq);
        return false;
      }

      return true;
    },
    [
      pendingPromotion,
      makeMove,
      showLegalMovesForSquare,
      isPromotionMove,
      selectedBot,
      game,
      playerColor,
      isBotThinking,
    ]
  );

  // Handle Square Clicks (Instant Click-to-move)
  const onSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (isGameOver || pendingPromotion) return;
      if (selectedBot && (game.turn() !== playerColor || isBotThinking)) return;

      const sq = square as Square;
      const piece = game.get(sq);

      if (selectedSquare) {
        if (selectedSquare === sq) {
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }

        const moves = game.moves({ square: selectedSquare, verbose: true });
        const isValid = moves.some((m) => m.to === sq);

        if (isValid) {
          if (isPromotionMove(selectedSquare, sq)) {
            setPendingPromotion({ from: selectedSquare, to: sq, color: game.turn() });
            setSelectedSquare(null);
            setLegalMoves([]);
            return;
          }

          makeMove({
            from: selectedSquare,
            to: sq,
          });
          return;
        } else {
          if (piece && piece.color === game.turn()) {
            showLegalMovesForSquare(sq);
            return;
          }
          return;
        }
      }

      if (piece && piece.color === game.turn()) {
        showLegalMovesForSquare(sq);
      }
    },
    [
      game,
      isGameOver,
      pendingPromotion,
      makeMove,
      isPromotionMove,
      selectedSquare,
      showLegalMovesForSquare,
      selectedBot,
      playerColor,
      isBotThinking,
    ]
  );

  // Complete a pending pawn promotion choice
  const handleSelectPromotion = useCallback(
    (piece: "q" | "n" | "r" | "b") => {
      if (!pendingPromotion) return;
      const { from, to } = pendingPromotion;
      setPendingPromotion(null);
      makeMove({ from, to, promotion: piece });
    },
    [pendingPromotion, makeMove]
  );

  // Keyboard shortcuts while promotion picker is open (Q/N/R/B or Escape to cancel)
  useEffect(() => {
    if (!pendingPromotion) return;
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape") {
        setPendingPromotion(null);
      } else if (k === "q" || k === "n" || k === "r" || k === "b") {
        handleSelectPromotion(k);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pendingPromotion, handleSelectPromotion]);

  // History Navigation
  const navigateToMove = (idx: number) => {
    setPendingPromotion(null);
    setCurrentMoveIndex(idx);
    if (idx === -1 || (idx >= 0 && moveHistory[idx])) {
      setGame(rebuildGameFromHistory(moveHistory, idx));
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
        if (moveHistory[next]) {
          setGame(rebuildGameFromHistory(moveHistory, next));
          setLastMove({
            from: moveHistory[next].from as Square,
            to: moveHistory[next].to as Square,
          });
          setCurrentEval(moveHistory[next].evalAfter);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, [isPlayingReplay, moveHistory, rebuildGameFromHistory]);

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

  // Custom square styles (highlights & legal move dots)
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: "rgba(6, 182, 212, 0.45)",
        boxShadow: "inset 0 0 0 2px #00bcd4",
      };
    }

    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: "rgba(6, 182, 212, 0.22)",
      };
      styles[lastMove.to] = {
        backgroundColor: "rgba(6, 182, 212, 0.32)",
      };
    }

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

  // Dynamic Board Sizing
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
      const availableWidth = rect.width || window.innerWidth - 240;

      const verticalOverhead = 148;
      const maxH = Math.max(260, availableHeight - verticalOverhead);

      let horizontalOverhead = 24;
      if (isAnalysisOn && !isFocusMode) {
        horizontalOverhead = 392;
      } else if (isAnalysisOn && isFocusMode) {
        horizontalOverhead = 66;
      }

      const maxW = Math.max(260, availableWidth - horizontalOverhead);
      let size = Math.floor(Math.min(maxH, maxW));

      const maxCap = isAnalysisOn
        ? isFocusMode
          ? 620
          : 520
        : isFocusMode
        ? 740
        : 640;

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

  // Memoized options passed to react-chessboard
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
        if (isGameOver || !isViewingCurrent || Boolean(pendingPromotion)) return false;
        if (selectedBot && (game.turn() !== playerColor || isBotThinking)) return false;
        return piece.pieceType.startsWith(game.turn());
      },
      pieces: defaultPieces,
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
      lightSquareStyle: { backgroundColor: "#cdd9e5" },
      darkSquareStyle: { backgroundColor: "#476685" },
      squareStyles: customSquareStyles,
      animationDurationInMs: 220,
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
      isViewingCurrent,
      pendingPromotion,
      selectedBot,
      playerColor,
      isBotThinking,
      customSquareStyles,
    ]
  );

  // Determine top & bottom player cards dynamically based on board orientation
  const topColor: "w" | "b" = boardOrientation === "white" ? "b" : "w";
  const bottomColor: "w" | "b" = boardOrientation === "white" ? "w" : "b";

  const renderPlayerCardProps = (color: "w" | "b") => {
    const side: "White" | "Black" = color === "w" ? "White" : "Black";
    const capturedPieces = color === "w" ? capturedByWhite : capturedByBlack;
    const isActiveTurn = currentTurn === color && isViewingCurrent && !isGameOver;

    if (!selectedBot) {
      return {
        side,
        capturedPieces,
        isActiveTurn,
      };
    }

    const isBotSide = color === botColor;
    if (isBotSide) {
      return {
        side,
        bot: selectedBot,
        rating: selectedBot.rating,
        isThinking: isBotThinking && isActiveTurn,
        dialogue: botDialogue,
        capturedPieces,
        isActiveTurn,
      };
    }

    return {
      side,
      playerName,
      badgeLabel: "You",
      capturedPieces,
      isActiveTurn,
    };
  };

  const whiteDisplayName = selectedBot
    ? playerColor === "w"
      ? playerName
      : selectedBot.name
    : "White";
  const blackDisplayName = selectedBot
    ? playerColor === "b"
      ? playerName
      : selectedBot.name
    : "Black";

  return (
    <div
      ref={viewContainerRef}
      className={`flex flex-col lg:flex-row items-center justify-center w-full h-full max-h-screen overflow-hidden select-none transition-all duration-300 ${
        isAnalysisOn && !isFocusMode ? "gap-4 xl:gap-6" : "gap-0"
      }`}
    >
      {/* MAIN CHESSBOARD COLUMN */}
      <div
        className="flex flex-col justify-center items-center space-y-1 shrink-0 transition-all duration-200"
        style={{ width: totalBoardColumnWidth }}
      >
        {/* 1. Top Player Card */}
        <div className="w-full">
          <PlayerCard {...renderPlayerCardProps(topColor)} />
        </div>

        {/* 2. Chessboard Container with optional Vertical Evaluation Bar */}
        <div className="w-full rounded-2xl bg-[#0c101a]/95 border border-zinc-800/80 p-2 shadow-2xl flex items-center justify-center gap-2 sm:gap-2.5 relative">
          <div className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 blur-[80px]" />

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

            {/* Pawn Promotion Selector Overlay */}
            {pendingPromotion && (() => {
              const fileIdx = "abcdefgh".indexOf(pendingPromotion.to[0]);
              const colIdx = boardOrientation === "white" ? fileIdx : 7 - fileIdx;
              const isAtTop =
                (boardOrientation === "white" && pendingPromotion.color === "w") ||
                (boardOrientation === "black" && pendingPromotion.color === "b");
              const options: { key: "q" | "n" | "r" | "b"; label: string; pieceKey: keyof typeof defaultPieces }[] = [
                { key: "q", label: "Queen", pieceKey: `${pendingPromotion.color}Q` as keyof typeof defaultPieces },
                { key: "n", label: "Knight", pieceKey: `${pendingPromotion.color}N` as keyof typeof defaultPieces },
                { key: "r", label: "Rook", pieceKey: `${pendingPromotion.color}R` as keyof typeof defaultPieces },
                { key: "b", label: "Bishop", pieceKey: `${pendingPromotion.color}B` as keyof typeof defaultPieces },
              ];
              const orderedOptions = isAtTop ? options : [...options].reverse();

              return (
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-[1px] z-30 animate-in fade-in duration-150"
                  onClick={() => setPendingPromotion(null)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      left: `${colIdx * 12.5}%`,
                      width: "12.5%",
                      top: isAtTop ? 0 : undefined,
                      bottom: !isAtTop ? 0 : undefined,
                    }}
                    className="absolute flex flex-col bg-[#0c101a]/95 border border-cyan-400/70 rounded-xl shadow-2xl shadow-cyan-500/20 overflow-hidden"
                  >
                    {!isAtTop && (
                      <button
                        type="button"
                        onClick={() => setPendingPromotion(null)}
                        title="Cancel promotion (Esc)"
                        aria-label="Cancel promotion"
                        className="w-full py-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border-b border-zinc-800 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {orderedOptions.map(({ key, label, pieceKey }) => {
                      const PieceSvg = defaultPieces[pieceKey];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectPromotion(key)}
                          title={`Promote to ${label} (${key.toUpperCase()})`}
                          aria-label={`Promote to ${label}`}
                          className="aspect-square w-full p-1.5 flex items-center justify-center hover:bg-cyan-500/25 active:scale-95 transition cursor-pointer relative group"
                        >
                          <PieceSvg />
                        </button>
                      );
                    })}

                    {isAtTop && (
                      <button
                        type="button"
                        onClick={() => setPendingPromotion(null)}
                        title="Cancel promotion (Esc)"
                        aria-label="Cancel promotion"
                        className="w-full py-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border-t border-zinc-800 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Game Over Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-xl font-bold mb-2 shadow-lg shadow-cyan-500/20">
                  {gameResult.startsWith("1/2-1/2") ? "½" : "♚"}
                </div>
                <h3 className="text-lg font-extrabold text-white tracking-wide">
                  {gameResult.startsWith("1/2-1/2") ? "Draw" : "Game Over"}
                </h3>
                <p className="text-cyan-300 text-xs font-semibold mt-0.5">
                  Result: {gameResult}
                </p>
                {selectedBot && botDialogue && (
                  <p className="mt-2 max-w-xs text-[11px] text-zinc-300 italic bg-zinc-900/80 border border-zinc-700/70 rounded-xl px-3 py-1.5">
                    {selectedBot.name}: &ldquo;{botDialogue}&rdquo;
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePlayAgain}
                    className="px-4 py-2 rounded-xl bg-[#00bcd4] hover:bg-[#22d3ee] text-zinc-950 text-xs font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition cursor-pointer"
                  >
                    Play Again
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBotModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Switch Bot</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Bottom Player Card */}
        <div className="w-full">
          <PlayerCard {...renderPlayerCardProps(bottomColor)} />
        </div>

        {/* 4. Controls Toolbar */}
        <div className="w-full">
          <BoardControls
            canGoBack={currentMoveIndex > -1}
            canGoForward={currentMoveIndex < moveHistory.length - 1}
            isPlaying={isPlayingReplay}
            isGameOver={isGameOver}
            isFocusMode={isFocusMode}
            isAnalysisOn={isAnalysisOn}
            repetitionCount={currentRepetitionCount}
            activeBotName={selectedBot ? selectedBot.name : null}
            onOpenBotSelector={() => setIsBotModalOpen(true)}
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

      {/* RIGHT COLUMN: Accuracy Card + Notation Ledger + Move Classification */}
      {isAnalysisOn && !isFocusMode && (
        <div className="flex flex-col space-y-2 w-full lg:w-[300px] xl:w-[330px] shrink-0 animate-in fade-in duration-200">
          <PlayerAccuracyCard
            whiteAccuracy={whiteAccuracy}
            blackAccuracy={blackAccuracy}
            whiteName={whiteDisplayName}
            blackName={blackDisplayName}
          />

          <NotationLedger
            moves={moveHistory}
            currentMoveIndex={currentMoveIndex}
            onSelectMove={navigateToMove}
            result={gameResult === "In Progress" ? "1-0" : gameResult}
          />

          <MoveClassificationCard
            moves={moveHistory}
            whiteName={whiteDisplayName}
            blackName={blackDisplayName}
          />
        </div>
      )}

      {/* Bot Selection Modal */}
      <BotSelectorModal
        isOpen={isBotModalOpen}
        currentBot={selectedBot}
        currentPlayerColor={playerColor}
        onSelectBot={(bot, color) => resetBoardForMatch(bot, color)}
        onSelectLocalPassAndPlay={() => resetBoardForMatch(null, "w")}
        onClose={() => setIsBotModalOpen(false)}
      />
    </div>
  );
};

export default ChessGameView;
