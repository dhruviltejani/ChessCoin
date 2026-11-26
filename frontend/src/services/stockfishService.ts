// Stockfish Engine & Game Analysis Service

export type MoveClassificationType =
  | "brilliant"
  | "great"
  | "best"
  | "excellent"
  | "good"
  | "book"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export interface StockfishEvaluation {
  cp?: number; // Centipawns (positive = white advantage, negative = black advantage)
  mate?: number; // Moves to checkmate (positive = white wins, negative = black wins)
  bestMove?: string; // Long algebraic notation, e.g. "e2e4"
  depth?: number;
}

export interface EvaluatedMove {
  moveNumber: number;
  ply: number;
  san: string;
  from: string;
  to: string;
  color: "w" | "b";
  fen: string;
  evalBefore: StockfishEvaluation;
  evalAfter: StockfishEvaluation;
  classification: MoveClassificationType;
  accuracy: number;
}

// Common opening moves for Book classification (Chess.com book moves)
const OPENING_BOOK_SAN: Record<string, boolean> = {
  // Move 1
  "e4": true, "d4": true, "Nf3": true, "c4": true, "g3": true, "b3": true, "f4": true, "Nc3": true,
  "e5": true, "c5": true, "e6": true, "c6": true, "d5": true, "Nf6": true, "g6": true, "d6": true,
  // Move 2
  "Nf3 Nc6": true, "Bc4 Bc5": true, "c3 Nf6": true, "d3 d6": true, "Bb5 a6": true, "Ba4 Nf6": true,
  "c4 e6": true, "Nc3 Nf6": true, "Bg5 Be7": true, "e3 O-O": true,
  "Nf3 d6": true, "d4 cxd4": true, "Nxd4 Nf6": true, "Nc3 a6": true,
  "Nc3 Bb4": true, "e5 c5": true,
  "Nc3 dxe4": true, "Nxe4 Bf5": true,
  "Bc4": true, "Bb5": true, "O-O": true, "Nc6": true, "Bc5": true, "Be7": true, "Bb4": true,
  "d3": true, "a6": true, "h6": true, "Bd7": true, "Bg4": true, "Nbd7": true,
};

class StockfishManager {
  private worker: Worker | null = null;
  public isReady = false;
  private currentCallback: ((evalResult: StockfishEvaluation) => void) | null = null;
  private fallbackEnabled = false;
  private evalQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === "undefined") return;

    try {
      this.worker = new Worker("/stockfish.js");
      this.worker.onmessage = (e) => this.handleWorkerMessage(e.data);
      this.worker.onerror = () => {
        console.warn("Stockfish worker error, using fallback engine.");
        this.fallbackEnabled = true;
      };

      this.sendCommand("uci");
      this.sendCommand("isready");
      this.sendCommand("ucinewgame");
    } catch {
      console.warn("Stockfish WebWorker not supported, using fallback engine.");
      this.fallbackEnabled = true;
    }
  }

  private sendCommand(cmd: string) {
    if (this.worker && !this.fallbackEnabled) {
      this.worker.postMessage(cmd);
    }
  }

  private handleWorkerMessage(line: string) {
    if (typeof line !== "string") return;

    if (line === "readyok") {
      this.isReady = true;
      return;
    }

    if (line.startsWith("info") && (line.includes("score cp") || line.includes("score mate"))) {
      let cp: number | undefined;
      let mate: number | undefined;
      let bestMove: string | undefined;

      const cpMatch = line.match(/score cp (-?\d+)/);
      if (cpMatch) {
        cp = parseInt(cpMatch[1], 10);
      }

      const mateMatch = line.match(/score mate (-?\d+)/);
      if (mateMatch) {
        mate = parseInt(mateMatch[1], 10);
      }

      const pvMatch = line.match(/pv (\w+)/);
      if (pvMatch) {
        bestMove = pvMatch[1];
      }

      const depthMatch = line.match(/depth (\d+)/);
      const depth = depthMatch ? parseInt(depthMatch[1], 10) : undefined;

      if (this.currentCallback && (cp !== undefined || mate !== undefined)) {
        this.currentCallback({ cp, mate, bestMove, depth });
      }
    }

    if (line.startsWith("bestmove")) {
      const parts = line.split(" ");
      const bestMove = parts[1];
      if (this.currentCallback && bestMove) {
        this.currentCallback({ bestMove });
      }
    }
  }

  /**
   * Evaluate a chess position in FEN notation
   */
  public evaluatePosition(fen: string, depth = 10): Promise<StockfishEvaluation> {
    if (this.fallbackEnabled || !this.worker) {
      return Promise.resolve(this.heuristicEvaluation(fen));
    }

    const run = this.evalQueue.then(() =>
      new Promise<StockfishEvaluation>((resolve) => {
        let latestEval: StockfishEvaluation = { cp: 0 };
        const timeout = setTimeout(() => {
          this.currentCallback = null;
          resolve(
            latestEval.cp !== undefined || latestEval.mate !== undefined
              ? latestEval
              : this.heuristicEvaluation(fen)
          );
        }, 450);

        this.currentCallback = (result) => {
          if (result.cp !== undefined || result.mate !== undefined) {
            latestEval = { ...latestEval, ...result };
          }
          if (result.bestMove) {
            latestEval.bestMove = result.bestMove;
            clearTimeout(timeout);
            this.currentCallback = null;
            resolve(latestEval);
          }
        };

        this.sendCommand("stop");
        this.sendCommand(`position fen ${fen}`);
        this.sendCommand(`go depth ${depth}`);
      }).then((ev) => {
        const isBlackTurn = fen.split(" ")[1] === "b";
        // Normalize score so positive = White advantage
        if (isBlackTurn && ev.cp !== undefined) {
          ev.cp = -ev.cp;
        }
        if (isBlackTurn && ev.mate !== undefined) {
          ev.mate = -ev.mate;
        }
        return ev;
      })
    );

    this.evalQueue = run.then(
      () => undefined,
      () => undefined
    );

    return run;
  }

  /**
   * Lightweight evaluation heuristic (Material + center mobility)
   */
  public heuristicEvaluation(fen: string): StockfishEvaluation {
    const pieceValues: Record<string, number> = {
      p: -100, n: -320, b: -330, r: -500, q: -900, k: 0,
      P: 100,  N: 320,  B: 330,  R: 500,  Q: 900,  K: 0,
    };

    const boardPart = fen.split(" ")[0];
    let score = 0;
    for (const char of boardPart) {
      if (pieceValues[char] !== undefined) {
        score += pieceValues[char];
      }
    }

    return {
      cp: score,
      depth: 6,
    };
  }
}

export const stockfish = new StockfishManager();

/**
 * Calculate win probability from centipawn score (Chess.com CAPS sigmoid formula)
 */
export function winChance(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

/**
 * Calculate move accuracy (0 to 100%) based on loss in win expectancy
 */
export function calculateMoveAccuracy(winChanceBefore: number, winChanceAfter: number, color: "w" | "b"): number {
  const diff = color === "w" ? winChanceBefore - winChanceAfter : winChanceAfter - winChanceBefore;
  const loss = Math.max(0, diff);
  const accuracy = 103.1668 * Math.exp(-0.04354 * loss) - 3.1669;
  return Math.min(100, Math.max(0, Math.round(accuracy * 10) / 10));
}

/**
 * Classify a move given position evaluations (Accurate Chess.com standard)
 */
export function classifyMove(
  ply: number,
  san: string,
  color: "w" | "b",
  evalBefore: StockfishEvaluation,
  evalAfter: StockfishEvaluation,
  isCapture = false,
  isCheck = false,
  isCheckmate = false
): { classification: MoveClassificationType; accuracy: number } {
  // 1. Opening book check (first 8 plies for standard openings)
  if (ply <= 8 && (OPENING_BOOK_SAN[san] || ["e4", "e5", "d4", "d5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "O-O", "d3", "c6", "e6", "d6"].includes(san))) {
    return { classification: "book", accuracy: 100 };
  }

  // 2. Checkmate is always Best Move
  if (isCheckmate) {
    return { classification: "best", accuracy: 100 };
  }

  const cpBefore = evalBefore.cp ?? (evalBefore.mate ? (evalBefore.mate > 0 ? 1500 : -1500) : 0);
  const cpAfter = evalAfter.cp ?? (evalAfter.mate ? (evalAfter.mate > 0 ? 1500 : -1500) : 0);

  const wcBefore = winChance(cpBefore);
  const wcAfter = winChance(cpAfter);
  const accuracy = calculateMoveAccuracy(wcBefore, wcAfter, color);

  // Win expectancy loss from the player's perspective
  const winLoss = color === "w" ? Math.max(0, wcBefore - wcAfter) : Math.max(0, wcAfter - wcBefore);
  const cpLoss = color === "w" ? cpBefore - cpAfter : cpAfter - cpBefore;

  // 3. Brilliant Move (Chess.com: piece sacrifice where advantage is preserved and win loss <= 1.5%)
  if (isCapture && winLoss <= 1.5 && ((color === "w" && wcAfter >= 60) || (color === "b" && wcAfter <= 40))) {
    if (san.includes("x") || isCheck) {
      return { classification: "brilliant", accuracy: 100 };
    }
  }

  // 4. Great Move (Chess.com: finding the critical/best move in a tense or defending situation)
  if (winLoss <= 1.0 && ((color === "w" && wcAfter >= 55) || (color === "b" && wcAfter <= 45))) {
    if (Math.abs(cpBefore) > 150 && Math.abs(cpAfter) > 180) {
      return { classification: "great", accuracy: 99 };
    }
  }

  // 5. Best Move: Win loss < 1.8%
  if (winLoss <= 1.8 || cpLoss <= 12) {
    return { classification: "best", accuracy };
  }

  // 6. Excellent: Win loss <= 4.5%
  if (winLoss <= 4.5 || cpLoss <= 35) {
    return { classification: "excellent", accuracy };
  }

  // 7. Good: Win loss <= 9.0%
  if (winLoss <= 9.0 || cpLoss <= 70) {
    return { classification: "good", accuracy };
  }

  // 8. Inaccuracy: Win loss <= 18.0%
  if (winLoss <= 18.0 || cpLoss <= 140) {
    return { classification: "inaccuracy", accuracy };
  }

  // 9. Mistake: Win loss <= 35.0%
  if (winLoss <= 35.0 || cpLoss <= 280) {
    return { classification: "mistake", accuracy };
  }

  // 10. Blunder: Large swing in win expectancy or handing over advantage
  return { classification: "blunder", accuracy };
}
