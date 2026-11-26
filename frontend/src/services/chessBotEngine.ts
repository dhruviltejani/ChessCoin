import { Chess, type Move, type Square } from "chess.js";
import type { ChessBot } from "../data/chessBots";

export interface BotMoveChoice {
  from: Square;
  to: Square;
  promotion?: string;
}

interface CandidateLine {
  multipv: number;
  uciMove: string;
  cp?: number;
  mate?: number;
}

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Lightweight piece-square bonus for center control (fallback engine)
const CENTER_BONUS: Record<string, number> = {
  d4: 28, e4: 28, d5: 28, e5: 28,
  c3: 14, d3: 14, e3: 14, f3: 14,
  c4: 18, f4: 18, c5: 18, f5: 18,
  c6: 14, d6: 14, e6: 14, f6: 14,
};

function evaluateBoardHeuristic(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? -99999 : 99999;
  }
  if (chess.isDraw()) return 0;

  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type] ?? 0;
      const center = CENTER_BONUS[piece.square] ?? 0;
      const sign = piece.color === "w" ? 1 : -1;
      score += sign * (val + (piece.type !== "k" ? center : 0));
    }
  }
  return score;
}

function alphaBeta(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizingWhite: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoardHeuristic(chess);
  }

  const moves = chess.moves({ verbose: true });
  // Order captures and checks first for better pruning
  moves.sort((a, b) => {
    const aScore = (a.captured ? 10 : 0) + (a.san.includes("+") ? 5 : 0);
    const bScore = (b.captured ? 10 : 0) + (b.san.includes("+") ? 5 : 0);
    return bScore - aScore;
  });

  if (maximizingWhite) {
    let maxEval = -Infinity;
    for (const m of moves) {
      chess.move(m);
      const ev = alphaBeta(chess, depth - 1, alpha, beta, false);
      chess.undo();
      if (ev > maxEval) maxEval = ev;
      if (ev > alpha) alpha = ev;
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      chess.move(m);
      const ev = alphaBeta(chess, depth - 1, alpha, beta, true);
      chess.undo();
      if (ev < minEval) minEval = ev;
      if (ev < beta) beta = ev;
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function pickWeightedIndex(weights: number[], maxLen: number): number {
  const usable = weights.slice(0, maxLen);
  const sum = usable.reduce((acc, w) => acc + w, 0);
  if (sum <= 0) return 0;
  let r = Math.random() * sum;
  for (let i = 0; i < usable.length; i++) {
    r -= usable[i];
    if (r <= 0) return i;
  }
  return 0;
}

function uciToMoveChoice(uci: string, chess: Chess): BotMoveChoice | null {
  if (!uci || uci.length < 4 || uci === "(none)") return null;
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promotion = uci.length > 4 ? uci.slice(4, 5) : undefined;

  const legal = chess.moves({ verbose: true });
  const match = legal.find(
    (m) => m.from === from && m.to === to && (!m.promotion || !promotion || m.promotion === promotion)
  );
  if (!match) return null;

  return {
    from: match.from,
    to: match.to,
    promotion: match.promotion || promotion,
  };
}

class ChessBotEngine {
  private worker: Worker | null = null;
  private isReady = false;
  private fallbackEnabled = false;
  private queue: Promise<void> = Promise.resolve();
  private activeLineHandler: ((line: string) => void) | null = null;
  private readyResolvers: (() => void)[] = [];

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === "undefined") {
      this.fallbackEnabled = true;
      return;
    }

    try {
      this.worker = new Worker("/stockfish.js");
      this.worker.onmessage = (e) => this.handleMessage(e.data);
      this.worker.onerror = () => {
        this.fallbackEnabled = true;
      };
      this.send("uci");
      this.send("isready");
      this.send("ucinewgame");
    } catch {
      this.fallbackEnabled = true;
    }
  }

  private send(cmd: string) {
    if (this.worker && !this.fallbackEnabled) {
      this.worker.postMessage(cmd);
    }
  }

  private handleMessage(line: string) {
    if (typeof line !== "string") return;

    if (line === "readyok") {
      this.isReady = true;
      const resolvers = [...this.readyResolvers];
      this.readyResolvers = [];
      resolvers.forEach((r) => r());
    }

    if (this.activeLineHandler) {
      this.activeLineHandler(line);
    }
  }

  private waitForReady(timeoutMs = 1500): Promise<boolean> {
    if (this.fallbackEnabled || !this.worker) return Promise.resolve(false);
    if (this.isReady) return Promise.resolve(true);

    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(this.isReady), timeoutMs);
      this.readyResolvers.push(() => {
        clearTimeout(timer);
        resolve(true);
      });
    });
  }

  /**
   * Pick an opening move tailored to the bot's personality if in the first few plies
   */
  private tryOpeningBookMove(chess: Chess, bot: ChessBot, moveHistorySan: string[]): BotMoveChoice | null {
    const ply = moveHistorySan.length;
    if (ply > 5) return null;

    // Chance to follow signature opening (100% for Master/Advanced on move 1, high for others)
    const bookChance = bot.tier === "beginner" ? 0.65 : bot.tier === "intermediate" ? 0.75 : 0.9;
    if (Math.random() > bookChance) return null;

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    let preferredSans: string[] = [];

    if (chess.turn() === "w") {
      // Match a White repertoire line prefix
      for (const line of bot.engine.openingPreferences.asWhite) {
        const whitePlies = moveHistorySan.filter((_, idx) => idx % 2 === 0);
        const matchesPrefix = whitePlies.every((san, i) => line[i] === san);
        if (matchesPrefix && line[whitePlies.length]) {
          preferredSans.push(line[whitePlies.length]);
        }
      }
    } else if (ply === 1) {
      // Responding to White's first move
      const first = moveHistorySan[0];
      if (first === "e4") {
        preferredSans = bot.engine.openingPreferences.vsE4;
      } else if (first === "d4") {
        preferredSans = bot.engine.openingPreferences.vsD4;
      }
    }

    if (preferredSans.length === 0) return null;

    // Pick a legal move from the preferred candidates
    const matchingLegal = legalMoves.filter((m) => preferredSans.includes(m.san));
    if (matchingLegal.length === 0) return null;

    // For beginner/intermediate pick randomly among matching lines; for advanced/master bias earlier entries
    const chosen: Move =
      bot.tier === "master" || bot.tier === "advanced"
        ? matchingLegal[Math.floor(Math.random() * Math.min(2, matchingLegal.length))]
        : matchingLegal[Math.floor(Math.random() * matchingLegal.length)];

    return {
      from: chosen.from,
      to: chosen.to,
      promotion: chosen.promotion,
    };
  }

  /**
   * Chaos / Human blunder move selector for Beginner / Intermediate bots
   */
  private selectChaosMove(chess: Chess, bot: ChessBot): BotMoveChoice | null {
    const legal = chess.moves({ verbose: true });
    if (legal.length === 0) return null;

    if (bot.engine.prefersChaosChecksAndCaptures) {
      // Aggressive beginner style: love checks, queen moves, and any capture (even bad trades!)
      const flashyMoves = legal.filter(
        (m) => m.san.includes("+") || m.captured || m.piece === "q"
      );
      if (flashyMoves.length > 0 && Math.random() < 0.72) {
        const pick = flashyMoves[Math.floor(Math.random() * flashyMoves.length)];
        return { from: pick.from, to: pick.to, promotion: pick.promotion };
      }
    }

    const pick = legal[Math.floor(Math.random() * legal.length)];
    return { from: pick.from, to: pick.to, promotion: pick.promotion };
  }

  /**
   * Pure JS Minimax fallback calibrated to the bot's tier
   */
  private selectFallbackMove(chess: Chess, bot: ChessBot): BotMoveChoice | null {
    const legal = chess.moves({ verbose: true });
    if (legal.length === 0) return null;
    if (legal.length === 1) {
      return { from: legal[0].from, to: legal[0].to, promotion: legal[0].promotion };
    }

    if (Math.random() < bot.engine.chaosRate) {
      return this.selectChaosMove(chess, bot);
    }

    const isWhite = chess.turn() === "w";
    const depth = bot.engine.fallbackDepth;
    const scored: { move: Move; score: number }[] = [];

    for (const m of legal) {
      chess.move(m);
      const baseEval = alphaBeta(chess, depth - 1, -Infinity, Infinity, !isWhite);
      chess.undo();
      // Add slight noise for lower tiers so games stay varied
      const noise =
        bot.tier === "beginner"
          ? (Math.random() - 0.5) * 450
          : bot.tier === "intermediate"
          ? (Math.random() - 0.5) * 90
          : bot.tier === "advanced"
          ? (Math.random() - 0.5) * 20
          : 0;
      scored.push({ move: m, score: baseEval + noise });
    }

    scored.sort((a, b) => (isWhite ? b.score - a.score : a.score - b.score));
    const idx = pickWeightedIndex(bot.engine.candidateWeights, scored.length);
    const chosen = scored[idx].move;

    return {
      from: chosen.from,
      to: chosen.to,
      promotion: chosen.promotion,
    };
  }

  /**
   * Query Stockfish worker for top MultiPV candidates
   */
  private queryStockfishCandidates(fen: string, bot: ChessBot): Promise<CandidateLine[]> {
    return new Promise<CandidateLine[]>((resolve) => {
      if (this.fallbackEnabled || !this.worker) {
        resolve([]);
        return;
      }

      const candidates = new Map<number, CandidateLine>();
      let bestMoveFallback: string | null = null;
      const maxWait = bot.tier === "master" ? 1300 : 850;

      const finish = () => {
        clearTimeout(timeout);
        this.activeLineHandler = null;
        const list = Array.from(candidates.values()).sort((a, b) => a.multipv - b.multipv);
        if (list.length === 0 && bestMoveFallback) {
          list.push({ multipv: 1, uciMove: bestMoveFallback });
        }
        resolve(list);
      };

      const timeout = setTimeout(() => {
        this.send("stop");
        finish();
      }, maxWait);

      this.activeLineHandler = (line: string) => {
        if (line.startsWith("info") && line.includes(" pv ")) {
          const mpvMatch = line.match(/multipv (\d+)/);
          const multipv = mpvMatch ? parseInt(mpvMatch[1], 10) : 1;
          const pvMatch = line.match(/ pv (\w+)/);
          if (pvMatch) {
            const cpMatch = line.match(/score cp (-?\d+)/);
            const mateMatch = line.match(/score mate (-?\d+)/);
            candidates.set(multipv, {
              multipv,
              uciMove: pvMatch[1],
              cp: cpMatch ? parseInt(cpMatch[1], 10) : undefined,
              mate: mateMatch ? parseInt(mateMatch[1], 10) : undefined,
            });
          }
        } else if (line.startsWith("bestmove")) {
          const parts = line.split(" ");
          if (parts[1] && parts[1] !== "(none)") {
            bestMoveFallback = parts[1];
          }
          finish();
        }
      };

      this.send("stop");
      this.send(`setoption name Skill Level value ${bot.engine.skillLevel}`);
      this.send(`setoption name MultiPV value ${bot.engine.multiPv}`);
      this.send(`position fen ${fen}`);
      const movetime = bot.tier === "master" ? 850 : bot.tier === "advanced" ? 550 : 350;
      this.send(`go depth ${bot.engine.depth} movetime ${movetime}`);
    });
  }

  /**
   * Compute the bot's next move for the given position & move history
   */
  public chooseMove(
    fen: string,
    bot: ChessBot,
    moveHistorySan: string[]
  ): Promise<BotMoveChoice | null> {
    const task = this.queue.then(async () => {
      let chess = new Chess();
      if (moveHistorySan.length > 0) {
        try {
          for (const san of moveHistorySan) {
            chess.move(san);
          }
          if (chess.fen() !== fen) {
            chess = new Chess(fen);
          }
        } catch {
          chess = new Chess(fen);
        }
      } else {
        chess = new Chess(fen);
      }
      if (chess.isGameOver()) return null;

      // 1. Check for signature opening move first
      const bookMove = this.tryOpeningBookMove(chess, bot, moveHistorySan);
      if (bookMove) return bookMove;

      // 2. Always take immediate checkmate if Master or Advanced (and usually Intermediate)
      const legalMoves = chess.moves({ verbose: true });
      if (bot.tier !== "beginner") {
        const mateInOne = legalMoves.find((m) => m.san.includes("#"));
        if (mateInOne) {
          return {
            from: mateInOne.from,
            to: mateInOne.to,
            promotion: mateInOne.promotion,
          };
        }
      }

      // 3. Chaos / Beginner human-like blunder roll
      if (Math.random() < bot.engine.chaosRate) {
        const chaos = this.selectChaosMove(chess, bot);
        if (chaos) return chaos;
      }

      // 4. Ask Stockfish WASM if ready
      const ready = await this.waitForReady(1200);
      if (ready) {
        const candidates = await this.queryStockfishCandidates(fen, bot);
        if (candidates.length > 0) {
          const idx = pickWeightedIndex(bot.engine.candidateWeights, candidates.length);
          const chosenLine = candidates[idx] ?? candidates[0];
          const converted = uciToMoveChoice(chosenLine.uciMove, chess);
          if (converted) return converted;
        }
      }

      // 5. Fallback heuristic/minimax move
      return this.selectFallbackMove(chess, bot);
    });

    this.queue = task.then(
      () => undefined,
      () => undefined
    );

    return task;
  }
}

export const chessBotEngine = new ChessBotEngine();
