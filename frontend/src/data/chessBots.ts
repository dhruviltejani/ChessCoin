export type BotDifficultyTier = "beginner" | "intermediate" | "advanced" | "master";

export interface BotDialoguePool {
  onStart: string[];
  onPlayerMove: string[];
  onCapture: string[];
  onCheck: string[];
  onBlunderByPlayer: string[];
  onBotBlunder: string[];
  onWin: string[];
  onLose: string[];
  onDraw: string[];
}

export interface BotEngineConfig {
  skillLevel: number; // Stockfish Skill Level 0-20
  depth: number; // Stockfish search depth
  multiPv: number; // Candidate moves requested
  fallbackDepth: number; // Minimax fallback depth if Stockfish worker unavailable
  thinkTimeMs: [number, number]; // [min, max] artificial think delay
  /** Probability weights for MultiPV candidates [1st, 2nd, 3rd, ...] */
  candidateWeights: number[];
  /** Chance (0-1) to play an aggressive/chaotic/suboptimal legal move */
  chaosRate: number;
  /** Prefer checks/captures when chaos triggers */
  prefersChaosChecksAndCaptures: boolean;
  /** Opening moves in SAN keyed by FEN piece-placement or ply-based simple responses */
  openingPreferences: {
    asWhite: string[][];
    vsE4: string[];
    vsD4: string[];
  };
}

export interface ChessBot {
  id: string;
  name: string;
  handle: string;
  tier: BotDifficultyTier;
  tierLabel: string;
  rating: number;
  title: string;
  tagline: string;
  bio: string;
  styleTags: string[];
  expectedAccuracy: string;
  signatureOpenings: string[];
  initials: string;
  accentColor: string;
  badgeTextClass: string;
  badgeBgClass: string;
  borderClass: string;
  avatarGradient: string;
  ringColor: string;
  engine: BotEngineConfig;
  dialogue: BotDialoguePool;
}

export const CHESS_BOTS: ChessBot[] = [
  {
    id: "ishowspeed",
    name: "IShowSpeed",
    handle: "@ishowspeed",
    tier: "beginner",
    tierLabel: "Beginner",
    rating: 450,
    title: "Chaos Streamer",
    tagline: "Wild queen rushes, random checks & zero hesitation",
    bio: "Plays pure instinct chess at 1000 BPM. Loves early queen attacks, ignores hanging pieces, and celebrates every check like a World Cup goal.",
    styleTags: ["Chaotic", "Wayward Queen", "Ultra Aggressive"],
    expectedAccuracy: "45% – 62%",
    signatureOpenings: ["Wayward Queen (Qh5)", "Scholar's Mate Attempts", "Random Pawn Storms"],
    initials: "IS",
    accentColor: "#f43f5e",
    badgeTextClass: "text-rose-300",
    badgeBgClass: "bg-rose-500/15 border-rose-500/35",
    borderClass: "border-rose-500/30 hover:border-rose-400/60",
    avatarGradient: "from-rose-500 via-red-500 to-amber-500",
    ringColor: "ring-rose-500/40",
    engine: {
      skillLevel: 0,
      depth: 2,
      multiPv: 4,
      fallbackDepth: 1,
      thinkTimeMs: [350, 750],
      candidateWeights: [0.22, 0.28, 0.28, 0.22],
      chaosRate: 0.42,
      prefersChaosChecksAndCaptures: true,
      openingPreferences: {
        asWhite: [
          ["e4", "Qh5", "Bc4"],
          ["e4", "Bc4", "Qf3"],
          ["d4", "h4", "Bg5"],
        ],
        vsE4: ["e5", "Nc6", "Qh4", "Bc5"],
        vsD4: ["d5", "e5", "Nf6", "c5"],
      },
    },
    dialogue: {
      onStart: [
        "SEWEY!! Let's play chess chat, I'm basically Ronaldo on the board!",
        "Bro you're cooked, watch this opening I learned 5 minutes ago!",
      ],
      onPlayerMove: [
        "Wait... why did you put that there?!",
        "Okay okay I see what you're doing chat!",
        "Hold up, let me cook real quick!",
      ],
      onCapture: [
        "YOINK!! Give me that piece!!",
        "BOOM! That's free real estate right there!",
      ],
      onCheck: [
        "CHECK!! ARF ARF ARF!! RUN KING RUN!!",
        "CHECKMATE?! Oh wait not yet... STILL CHECK!!",
      ],
      onBlunderByPlayer: [
        "WAIT DID YOU JUST HANG THAT?! W SPEED!!",
        "NO WAY CHAT HE JUST GAVE ME THAT FOR FREE!",
      ],
      onBotBlunder: [
        "WAIT WHY DID MY QUEEN DISAPPEAR?! BRO THIS GAME IS RIGGED!",
        "Hold on... I meant to do that. It's a Botez gambit!",
      ],
      onWin: [
        "SEWEYYYYY!! GRANDMASTER SPEED BABY!!",
        "I'M LITERALLY BETTER THAN MAGNUS RIGHT NOW!!",
      ],
      onLose: [
        "NAH BRO YOU'RE STREAM SNIPING MY BOARD!! REMATCH!!",
        "Okay you got lucky chat, my mouse slipped!",
      ],
      onDraw: [
        "Wait a draw?! How nobody win?!",
        "Stalemate?! Nah I basically won that!",
      ],
    },
  },
  {
    id: "samay-raina",
    name: "Samay Raina",
    handle: "@samayraina",
    tier: "intermediate",
    tierLabel: "Intermediate",
    rating: 1250,
    title: "Comedian Tactician",
    tagline: "Spicy gambits, cheeky knight forks & stream banter",
    bio: "The king of Indian chess entertainment. Plays resourceful middlegame tricks, loves knight forks and gambits, and turns every blunder into comedy gold.",
    styleTags: ["Tricky", "Gambits", "Knight Forks"],
    expectedAccuracy: "70% – 82%",
    signatureOpenings: ["Italian Game", "Scotch Gambit", "Sicilian / King's Indian"],
    initials: "SR",
    accentColor: "#a855f7",
    badgeTextClass: "text-purple-300",
    badgeBgClass: "bg-purple-500/15 border-purple-500/35",
    borderClass: "border-purple-500/30 hover:border-purple-400/60",
    avatarGradient: "from-purple-500 via-fuchsia-500 to-indigo-500",
    ringColor: "ring-purple-500/40",
    engine: {
      skillLevel: 6,
      depth: 5,
      multiPv: 3,
      fallbackDepth: 2,
      thinkTimeMs: [450, 950],
      candidateWeights: [0.55, 0.3, 0.15],
      chaosRate: 0.14,
      prefersChaosChecksAndCaptures: true,
      openingPreferences: {
        asWhite: [
          ["e4", "Nf3", "Bc4", "d4"],
          ["e4", "Nf3", "d4", "Bc4"],
          ["d4", "c4", "Nc3"],
        ],
        vsE4: ["e5", "c5", "Nc6", "Nf6"],
        vsD4: ["Nf6", "d5", "g6", "e6"],
      },
    },
    dialogue: {
      onStart: [
        "Welcome to Chaukadi Chess Club! No mercy, only comedy.",
        "Bhai aaj gambit khelenge, Bhagwan bharose!",
      ],
      onPlayerMove: [
        "Interesting move... Sagar Bhai would approve or cry.",
        "Haan bhai, sab theory yaad karke aaye ho?",
        "Let's create some chaos on the board!",
      ],
      onCapture: [
        "Thank you! Free material never hurts.",
        "Ek aur piece gaya! Life is unfair.",
      ],
      onCheck: [
        "Check! Thoda sa pressure feel ho raha hai?",
        "Knight fork alert... or maybe just vibes!",
      ],
      onBlunderByPlayer: [
        "Arre bhai bhai bhai!! Ye kya blunder kar diya!",
        "Thank you for subscribing to Samay's charity!",
      ],
      onBotBlunder: [
        "Khatam... tata... goodbye! Missed that completely.",
        "Wait that's a tactical sacrifice... of my own rating.",
      ],
      onWin: [
        "GG! Rating stonks going up tonight!",
        "Sagar Shah ko bhejo ye game, brilliant tha!",
      ],
      onLose: [
        "Well played yaar! Time trouble mein phas gaya.",
        "Okay you're too strong, next game main Stockfish bulaunga!",
      ],
      onDraw: [
        "Draw! Peace treaty signed on the 64 squares.",
        "Half point each, fair enough!",
      ],
    },
  },
  {
    id: "gotham-chess",
    name: "GothamChess",
    handle: "@gothamchess",
    tier: "advanced",
    tierLabel: "Advanced",
    rating: 2350,
    title: "IM Levy Rozman",
    tagline: "Caro-Kann, Vienna & sacrificing THE ROOOOK!",
    bio: "International Master and chess educator. Ruthlessly punishes opening mistakes, plays sharp Vienna and Caro-Kann setups, and hunts for dramatic sacrifices.",
    styleTags: ["IM Strength", "Caro-Kann / Vienna", "Tactical Sacrifices"],
    expectedAccuracy: "86% – 94%",
    signatureOpenings: ["Vienna Gambit", "Caro-Kann Defense", "London System"],
    initials: "GC",
    accentColor: "#06b6d4",
    badgeTextClass: "text-cyan-300",
    badgeBgClass: "bg-cyan-500/15 border-cyan-500/35",
    borderClass: "border-cyan-500/30 hover:border-cyan-400/60",
    avatarGradient: "from-cyan-400 via-sky-500 to-blue-600",
    ringColor: "ring-cyan-500/40",
    engine: {
      skillLevel: 14,
      depth: 9,
      multiPv: 2,
      fallbackDepth: 3,
      thinkTimeMs: [500, 1050],
      candidateWeights: [0.82, 0.18],
      chaosRate: 0.03,
      prefersChaosChecksAndCaptures: false,
      openingPreferences: {
        asWhite: [
          ["e4", "Nc3", "f4"],
          ["d4", "Bf4", "e3", "Nf3"],
          ["e4", "Nc3", "Bc4"],
        ],
        vsE4: ["c6", "d5", "Bf5", "e6"],
        vsD4: ["Nf6", "d5", "e6", "c5"],
      },
    },
    dialogue: {
      onStart: [
        "Play the Caro-Kann or face the Vienna. Let's see what you've got!",
        "Alright, no Guess the Elo nonsense today — show me clean chess.",
      ],
      onPlayerMove: [
        "Solid development. Now let's test your calculation.",
        "I see the idea — let's sharpen the position.",
        "Good move, keeping the tension.",
      ],
      onCapture: [
        "Clean capture. Watch the tactical follow-up!",
        "AND HE TAKES!! Calculating the aftermath.",
      ],
      onCheck: [
        "Check! Your king safety is looking a bit suspect.",
        "Check — forcing moves first, always!",
      ],
      onBlunderByPlayer: [
        "Oh no... THAT'S GOING STRAIGHT INTO GUESS THE ELO!",
        "Wait, did you just leave that undefended?!",
      ],
      onBotBlunder: [
        "Okay, even an IM gets tunnel vision sometimes. Respect!",
        "Oof, missed that resource. Nice find!",
      ],
      onWin: [
        "AND HE SACRIFICES... THE GAME! GG, subscribe for more!",
        "Clinical conversion. Check the analysis bar on that one!",
      ],
      onLose: [
        "Wait—you actually beat the IM?! Fair play, brilliant game!",
        "Alright, I'm putting this in my next video. Well played!",
      ],
      onDraw: [
        "Dead equal endgame — solid defense, GG!",
        "A hard-fought draw. Respectable accuracy!",
      ],
    },
  },
  {
    id: "gukesh-dommaraju",
    name: "Gukesh Dommaraju",
    handle: "@gukeshd",
    tier: "master",
    tierLabel: "Master",
    rating: 2780,
    title: "World Chess Champion",
    tagline: "Super-GM precision, deep calculation & clinical endgames",
    bio: "The youngest undisputed World Chess Champion. Combines relentless classical calculation with ice-cold defensive resilience and ruthless endgame technique.",
    styleTags: ["2780 Super-GM", "Deep Calculation", "Endgame Mastery"],
    expectedAccuracy: "94% – 99%",
    signatureOpenings: ["Ruy Lopez", "Catalan Opening", "Queen's Gambit / Najdorf"],
    initials: "GD",
    accentColor: "#f59e0b",
    badgeTextClass: "text-amber-300",
    badgeBgClass: "bg-amber-500/15 border-amber-500/35",
    borderClass: "border-amber-500/30 hover:border-amber-400/60",
    avatarGradient: "from-amber-400 via-orange-500 to-yellow-500",
    ringColor: "ring-amber-500/40",
    engine: {
      skillLevel: 20,
      depth: 13,
      multiPv: 1,
      fallbackDepth: 3,
      thinkTimeMs: [600, 1200],
      candidateWeights: [1.0],
      chaosRate: 0,
      prefersChaosChecksAndCaptures: false,
      openingPreferences: {
        asWhite: [
          ["e4", "Nf3", "Bb5", "Ba4"],
          ["d4", "c4", "g3", "Bg2"],
          ["d4", "c4", "Nf3", "Nc3"],
        ],
        vsE4: ["e5", "c5", "Nc6", "d6"],
        vsD4: ["Nf6", "e6", "d5", "Bb4+"],
      },
    },
    dialogue: {
      onStart: [
        "Let's have a principled, sharp game. Best of luck.",
        "Every move counts. Take your time and calculate deeply.",
      ],
      onPlayerMove: [
        "An interesting practical choice. Let me verify the variations.",
        "Good prophylactic thinking.",
        "Maintaining dynamic balance.",
      ],
      onCapture: [
        "Converting the structural edge.",
        "Precise exchange. The resulting endgame favors my pieces.",
      ],
      onCheck: [
        "Check. Precision is mandatory here.",
        "Forcing your king onto a passive square.",
      ],
      onBlunderByPlayer: [
        "That inaccuracy gives me a decisive initiative.",
        "I had calculated this refutation a few moves earlier.",
      ],
      onBotBlunder: [
        "Very sharp resource — I underestimated that counterplay.",
        "Strong practical move. You put real pressure on the position.",
      ],
      onWin: [
        "Good game. Thank you for the battle.",
        "The endgame calculation held up cleanly. Well played.",
      ],
      onLose: [
        "Extraordinary play! You outcalculated me in the critical line.",
        "Congratulations — a genuinely world-class performance.",
      ],
      onDraw: [
        "A well-contested draw. Clean accuracy from both sides.",
        "Neither side cracked. Respect.",
      ],
    },
  },
];

export function getChessBotById(id?: string | null): ChessBot | null {
  if (!id) return null;
  return CHESS_BOTS.find((b) => b.id === id) ?? null;
}

export function pickRandomDialogue(lines: string[]): string {
  if (!lines.length) return "";
  return lines[Math.floor(Math.random() * lines.length)];
}
