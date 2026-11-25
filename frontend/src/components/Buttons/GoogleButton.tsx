import React from "react";

export type ButtonSize = "sm" | "md" | "lg" | "default" | (string & {});

const sizeStyles: Record<string, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 sm:h-10 w-full sm:w-56 max-w-xs",
  default: "h-9 sm:h-10 w-full sm:w-56 max-w-xs",
  lg: "h-11 sm:h-12 w-full max-w-sm text-base",
};

export interface GoogleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  text?: string;
  size?: ButtonSize;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  text = "Google",
  size = "default",
  children,
  className = "",
  type = "button",
  ...props
}) => {
  const sizeClass = sizeStyles[size] || size || sizeStyles.default;

  return (
    <button
      type={type}
      className={`flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800/80 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 ${sizeClass} ${className}`}
      {...props}
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M21.35 12.23c0-.79-.07-1.55-.2-2.28H12v4.32h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.43Z"
        />
        <path
          fill="#34A853"
          d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.75 9.75 0 0 0 12 21.75Z"
        />
        <path
          fill="#FBBC05"
          d="M6.54 13.83a5.86 5.86 0 0 1 0-3.66V7.64H3.29a9.75 9.75 0 0 0 0 8.72l3.25-2.53Z"
        />
        <path
          fill="#EA4335"
          d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.24 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.39l3.25 2.53C7.31 7.86 9.46 6.14 12 6.14Z"
        />
      </svg>
      {children || <span>{text}</span>}
    </button>
  );
};

export default GoogleButton;
