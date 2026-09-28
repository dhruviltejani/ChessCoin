import { ChessKnight } from "lucide-react";

// Custom High-Precision SVG Chess Icons
export const KingIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v4M10 4h4" />
    <path d="M7 8c1.5-1 3.5-1 5-1s3.5 0 5 1" />
    <path d="M6 9.5c.5 3 2 4.5 3 5.5h6c1-1 2.5-2.5 3-5.5" />
    <path d="M8 15v2c0 .5-.5 1-1 1h10c-.5 0-1-.5-1-1v-2" />
    <path d="M5 21h14M7 18h10" />
    <circle cx="12" cy="11.5" r="1" fill="currentColor" />
  </svg>
);

export const QueenIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="5" cy="7" r="1" fill="currentColor" />
    <circle cx="9" cy="5.5" r="1" fill="currentColor" />
    <circle cx="12" cy="5.5" r="1" fill="currentColor" />
    <circle cx="15" cy="5.5" r="1" fill="currentColor" />
    <circle cx="19" cy="7" r="1" fill="currentColor" />
    <path d="M5 8.5l2 6.5h10l2-6.5-3.5 3-3.5-5-3.5 5L5 8.5z" />
    <path d="M7 15c.5 2 2 3 5 3s4.5-1 5-3" />
    <path d="M5.5 21h13M7 18h10" />
  </svg>
);

export const RookIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 4h3v3h2V4h2v3h2V4h3v5H6V4z" />
    <path d="M7 9v2.5l1.5 1h7L17 11.5V9" />
    <path d="M8.5 12.5v4.5h7v-4.5" />
    <path d="M12 14v2" />
    <path d="M5.5 21h13M7 18h10" />
  </svg>
);

export const BishopIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="3.5" r="1" fill="currentColor" />
    <path d="M12 5.5c-3 1.5-4.5 4.5-4 8.5h8c.5-4-1-7-4-8.5z" />
    <path d="M10.5 8.5l3 3" />
    <path d="M8 15c1 1 2.5 1.5 4 1.5s3-.5 4-1.5" />
    <path d="M5.5 21h13M7 18h10M8 16.5v1.5M16 16.5v1.5" />
  </svg>
);

export const KnightIcon = ChessKnight;

export const PawnIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="6" r="3.25" />
    <path d="M9 11c1-.5 2-.75 3-.75s2 .25 3 .75" />
    <path d="M9.5 12c-.5 2-1.5 4-2.5 5.5h10c-1-1.5-2-3.5-2.5-5.5" />
    <path d="M5.5 21h13M7 18.5h10" />
  </svg>
);