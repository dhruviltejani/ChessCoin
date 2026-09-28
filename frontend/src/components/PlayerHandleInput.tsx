import React from "react";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export type HandleStatus = "idle" | "checking" | "available" | "unavailable";

export interface PlayerHandleInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleStatus: HandleStatus;
  errors?: string[];
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const PlayerHandleInput: React.FC<PlayerHandleInputProps> = ({
  value,
  onChange,
  onBlur,
  handleStatus,
  errors = [],
  disabled = false,
  id = "handle",
  placeholder = "grandmaster_x",
  label = "Player Handle",
  className = "",
}) => {
  const hasError = Boolean(errors.length > 0 || handleStatus === "unavailable");
  const trimmed = value.trim();
  const showStatusPill =
    trimmed.length >= 3 &&
    /^[a-zA-Z0-9_]+$/.test(trimmed) &&
    trimmed.length <= 20;

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-medium tracking-wide text-zinc-300"
        >
          {label}
        </label>
        {showStatusPill && (
          <div className="flex items-center gap-1.5">
            {handleStatus === "checking" && (
              <span className="flex items-center gap-1 text-xs font-medium text-zinc-400">
                <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                Checking...
              </span>
            )}
            {handleStatus === "available" && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                Available
              </span>
            )}
            {handleStatus === "unavailable" && (
              <span className="flex items-center gap-1 text-xs font-medium text-rose-400">
                <AlertCircle className="h-3 w-3" />
                Unavailable
              </span>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-cyan-400">
          @
        </span>
        <input
          id={id}
          name="handle"
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`h-9 sm:h-10 w-full rounded-lg border bg-zinc-950 pl-8 pr-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 disabled:opacity-60 disabled:cursor-not-allowed ${
            hasError
              ? "border-rose-500/70 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30"
              : "border-zinc-800 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
          }`}
        />
      </div>

      {handleStatus !== "unavailable" && errors && errors.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {errors.map((msg, index) => (
            <p key={index} className="flex items-center gap-1 text-[11px] text-rose-400">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{msg}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerHandleInput;
