import React from "react";
import { ChessKnight } from "lucide-react";
import {
  KingIcon,
  QueenIcon,
  RookIcon,
  BishopIcon,
  PawnIcon,
} from "./ChessIcons";

export type ChessPieceId = "rook" | "pawn" | "bishop" | "queen" | "king" | "knight";

export interface ChessPiece {
  id: ChessPieceId;
  name: string;
  role: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CHESS_PIECES: ChessPiece[] = [
  {
    id: "rook",
    name: "Rook",
    role: "The Fortress",
    tagline: "Commands ranks with solid defense.",
    icon: RookIcon,
  },
  {
    id: "pawn",
    name: "Pawn",
    role: "The Vanguard",
    tagline: "Destined for glorious promotion.",
    icon: PawnIcon,
  },
  {
    id: "bishop",
    name: "Bishop",
    role: "The Tactician",
    tagline: "Strikes diagonals with precision.",
    icon: BishopIcon,
  },
  {
    id: "queen",
    name: "Queen",
    role: "The Dominator",
    tagline: "Ultimate mobility, board mastery.",
    icon: QueenIcon,
  },
  {
    id: "king",
    name: "King",
    role: "The Sovereign",
    tagline: "The heart of every endgame.",
    icon: KingIcon,
  },
  {
    id: "knight",
    name: "Knight",
    role: "The Renegade",
    tagline: "Unpredictable tactical leaps.",
    icon: ChessKnight,
  },
];

export const getChessPiece = (id?: string): ChessPiece => {
  return CHESS_PIECES.find((piece) => piece.id === id) || CHESS_PIECES[3]; // Default Queen
};
