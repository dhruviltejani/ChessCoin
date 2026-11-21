import React from "react";

// Standard high-fidelity vector chess pieces (Staunton / Modern Tournament standard)
// Features clean, noble silhouettes, majestic Staunton knight, authoritative castle rook, and regal imperial king.

export const ChessPieces: Record<string, (props?: { fill?: string; square?: string; svgStyle?: React.CSSProperties }) => React.JSX.Element> = {
  wP: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      <path
        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill="#ffffff"
        stroke="#1a1c23"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  wN: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      <path
        d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
        fill="#ffffff"
        stroke="#1a1c23"
        strokeWidth="1.5"
      />
      <path
        d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.03,5.1 20.14,5.36 C 21.61,5.49 21.68,6.88 21.43,8.08 C 21.18,9.28 21.49,9.95 22,10 z"
        fill="#ffffff"
        stroke="#1a1c23"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="25.5" r="1" fill="#1a1c23" />
      <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" fill="#1a1c23" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" />
    </svg>
  ),
  wB: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      <g fill="none" fillRule="evenodd" stroke="#1a1c23" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"
          fill="#ffffff"
        />
        <path
          d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"
          fill="#ffffff"
        />
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#ffffff" />
        <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" stroke="#1a1c23" />
      </g>
    </svg>
  ),
  // Clean, imposing castle Rook with balanced battlements and arrow loop
  wR: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      <g fill="#ffffff" stroke="#1a1c23" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Tiered Fortress Plinth Base */}
        <path d="M 9,39.5 L 36,39.5 L 35,36 L 10,36 Z" />
        <path d="M 11,36 L 12.5,32.5 L 32.5,32.5 L 34,36 Z" />
        {/* Tower Body */}
        <path d="M 12.5,32.5 L 14,17 L 31,17 L 32.5,32.5 Z" />
        {/* Parapet Shelf and 4 Symmetrical Merlons */}
        <path d="M 10,17 L 35,17 L 35,9.5 L 30.5,9.5 L 30.5,13.5 L 26,13.5 L 26,9.5 L 19,9.5 L 19,13.5 L 14.5,13.5 L 14.5,9.5 L 10,9.5 Z" />
        {/* Trim Lines */}
        <path d="M 10,17 L 35,17" />
        <path d="M 12.5,32.5 L 32.5,32.5" />
        {/* Castle Arrow Slit */}
        <path d="M 22.5,21.5 L 22.5,28 M 20.5,24.5 L 24.5,24.5" fill="none" stroke="#1a1c23" strokeWidth="1.4" />
      </g>
    </svg>
  ),
  wQ: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      <g fill="#ffffff" fillRule="evenodd" stroke="#1a1c23" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5 4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm-7.5-3a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm-18 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-7.5-14-7.5 14-7-11 2 12zm0 0c0 4 2.5 7.5 6 9.5m14 0c3.5-2 6-5.5 6-9.5" />
        <path d="M11 38.5a35 35 0 0 0 23 0v-3a35 35 0 0 1-23 0v3z" />
        <path d="M11 29a35 35 0 0 0 23 0" fill="none" />
      </g>
    </svg>
  ),
  // Majestic Imperial King with bold royal cross and arched crown
  wK: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      {/* Royal Cross Finial */}
      <path d="M 22.5,4.5 L 22.5,11 M 19.5,7.5 L 25.5,7.5" stroke="#1a1c23" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Crown Finial Bead */}
      <circle cx="22.5" cy="11.5" r="1.5" fill="#ffffff" stroke="#1a1c23" strokeWidth="1.4" />
      {/* Imperial Crown & Torso */}
      <path
        d="M 12.5,37 C 18,39.5 27,39.5 32.5,37 C 32.5,32 30.5,29.5 30.5,27 C 30.5,22 34,18 34,15.5 C 34,13.5 31.5,13.5 29.5,15 C 27.5,16.5 25,18 22.5,18 C 20,18 17.5,16.5 15.5,15 C 13.5,13.5 11,13.5 11,15.5 C 11,18 14.5,22 14.5,27 C 14.5,29.5 12.5,32 12.5,37 Z"
        fill="#ffffff"
        stroke="#1a1c23"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Crown Inset Cross */}
      <path
        d="M 22.5,18 L 22.5,27 M 18,22.5 L 27,22.5"
        stroke="#1a1c23"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Royal Mantle Collar */}
      <path
        d="M 14.5,27 C 19.5,28.5 25.5,28.5 30.5,27"
        stroke="#1a1c23"
        strokeWidth="1.4"
        fill="none"
      />
      {/* Stately Plinth Foundation */}
      <path
        d="M 10,39.5 L 35,39.5 L 34,37 L 11,37 Z"
        fill="#ffffff"
        stroke="#1a1c23"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M 12.5,37 C 18,35 27,35 32.5,37"
        stroke="#1a1c23"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  ),
  bP: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      <path
        d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
        fill="#1e2433"
        stroke="#e2e8f0"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  bN: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      <path
        d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
        fill="#1e2433"
        stroke="#e2e8f0"
        strokeWidth="1.5"
      />
      <path
        d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.03,5.1 20.14,5.36 C 21.61,5.49 21.68,6.88 21.43,8.08 C 21.18,9.28 21.49,9.95 22,10 z"
        fill="#1e2433"
        stroke="#e2e8f0"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="25.5" r="1" fill="#e2e8f0" />
      <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" fill="#e2e8f0" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" />
    </svg>
  ),
  bB: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      <g fill="none" fillRule="evenodd" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"
          fill="#1e2433"
        />
        <path
          d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"
          fill="#1e2433"
        />
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#1e2433" />
        <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" stroke="#e2e8f0" />
      </g>
    </svg>
  ),
  // Dark Fortress Rook
  bR: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      <g fill="#1e2433" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Tiered Fortress Plinth Base */}
        <path d="M 9,39.5 L 36,39.5 L 35,36 L 10,36 Z" />
        <path d="M 11,36 L 12.5,32.5 L 32.5,32.5 L 34,36 Z" />
        {/* Tower Body */}
        <path d="M 12.5,32.5 L 14,17 L 31,17 L 32.5,32.5 Z" />
        {/* Parapet Shelf and 4 Symmetrical Merlons */}
        <path d="M 10,17 L 35,17 L 35,9.5 L 30.5,9.5 L 30.5,13.5 L 26,13.5 L 26,9.5 L 19,9.5 L 19,13.5 L 14.5,13.5 L 14.5,9.5 L 10,9.5 Z" />
        {/* Trim Lines */}
        <path d="M 10,17 L 35,17" />
        <path d="M 12.5,32.5 L 32.5,32.5" />
        {/* Castle Arrow Slit */}
        <path d="M 22.5,21.5 L 22.5,28 M 20.5,24.5 L 24.5,24.5" fill="none" stroke="#e2e8f0" strokeWidth="1.4" />
      </g>
    </svg>
  ),
  bQ: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      <g fill="#1e2433" fillRule="evenodd" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5 4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm-7.5-3a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm-18 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-7.5-14-7.5 14-7-11 2 12zm0 0c0 4 2.5 7.5 6 9.5m14 0c3.5-2 6-5.5 6-9.5" />
        <path d="M11 38.5a35 35 0 0 0 23 0v-3a35 35 0 0 1-23 0v3z" />
        <path d="M11 29a35 35 0 0 0 23 0" fill="none" />
      </g>
    </svg>
  ),
  // Dark Imperial King
  bK: ({ svgStyle } = {}) => (
    <svg viewBox="0 0 45 45" style={svgStyle} className="w-full h-full pointer-events-none select-none">
      {/* Royal Cross Finial */}
      <path d="M 22.5,4.5 L 22.5,11 M 19.5,7.5 L 25.5,7.5" stroke="#e2e8f0" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* Crown Finial Bead */}
      <circle cx="22.5" cy="11.5" r="1.5" fill="#1e2433" stroke="#e2e8f0" strokeWidth="1.4" />
      {/* Imperial Crown & Torso */}
      <path
        d="M 12.5,37 C 18,39.5 27,39.5 32.5,37 C 32.5,32 30.5,29.5 30.5,27 C 30.5,22 34,18 34,15.5 C 34,13.5 31.5,13.5 29.5,15 C 27.5,16.5 25,18 22.5,18 C 20,18 17.5,16.5 15.5,15 C 13.5,13.5 11,13.5 11,15.5 C 11,18 14.5,22 14.5,27 C 14.5,29.5 12.5,32 12.5,37 Z"
        fill="#1e2433"
        stroke="#e2e8f0"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Crown Inset Cross */}
      <path
        d="M 22.5,18 L 22.5,27 M 18,22.5 L 27,22.5"
        stroke="#e2e8f0"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Royal Mantle Collar */}
      <path
        d="M 14.5,27 C 19.5,28.5 25.5,28.5 30.5,27"
        stroke="#e2e8f0"
        strokeWidth="1.4"
        fill="none"
      />
      {/* Stately Plinth Foundation */}
      <path
        d="M 10,39.5 L 35,39.5 L 34,37 L 11,37 Z"
        fill="#1e2433"
        stroke="#e2e8f0"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M 12.5,37 C 18,35 27,35 32.5,37"
        stroke="#e2e8f0"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  ),
};
