import React from "react";
import { Loader2 } from "lucide-react";
import type { ButtonSize } from "./GoogleButton";

const sizeStyles: Record<string, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 sm:h-10 w-full sm:w-56 max-w-xs",
  default: "h-9 sm:h-10 w-full sm:w-56 max-w-xs",
  lg: "h-11 sm:h-12 w-full max-w-sm text-base",
};

export interface CreateAccountButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  text?: string;
  label?: string;
  size?: ButtonSize;
  isLoading?: boolean;
  isSubmitting?: boolean;
  loadingText?: string;
}

export const CreateAccountButton: React.FC<CreateAccountButtonProps> = ({
  text,
  label,
  size = "default",
  children,
  isLoading = false,
  isSubmitting = false,
  loadingText,
  disabled,
  className = "",
  type = "submit",
  ...props
}) => {
  const loading = isLoading || isSubmitting;
  const buttonContent = text || label || children || "Create Account";
  const displayLoadingText =
    loadingText ||
    (buttonContent === "Create Account"
      ? "Creating Account..."
      : typeof buttonContent === "string"
      ? `${buttonContent.replace(/e$/, "")}ing...`
      : "Creating Account...");

  const sizeClass = sizeStyles[size] || size || sizeStyles.default;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`mt-2 flex items-center justify-center gap-2 rounded-lg bg-cyan-400 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>{displayLoadingText}</span>
        </>
      ) : (
        <span>{buttonContent}</span>
      )}
    </button>
  );
};

export default CreateAccountButton;
