import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-bold transition select-none rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]";

  const variantStyles = {
    primary:
      "bg-[#40c9ff] hover:bg-[#30bcf2] text-zinc-950 shadow-lg shadow-cyan-400/20 focus:ring-2 focus:ring-cyan-400/40",
    secondary:
      "bg-[#141b29] hover:bg-[#1a2335] text-zinc-200 border border-zinc-800 hover:border-zinc-700 shadow-sm",
    outline:
      "border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 active:bg-cyan-400/20",
    ghost:
      "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50",
    danger:
      "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20",
  };

  const sizeStyles = {
    sm: "h-9 px-3 text-xs gap-1.5",
    md: "h-11 px-4 text-xs sm:text-sm gap-2",
    lg: "h-12 px-6 text-sm sm:text-base gap-2.5",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
