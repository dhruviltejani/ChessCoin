import React from "react";
import { Crown, Flame, Laugh, Sparkles } from "lucide-react";
import type { ChessBot } from "../../data/chessBots";

interface BotAvatarProps {
  bot: ChessBot;
  size?: "xs" | "sm" | "md" | "lg";
  isThinking?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<BotAvatarProps["size"]>, string> = {
  xs: "w-6 h-6 text-[10px] rounded-lg",
  sm: "w-8 h-8 text-xs rounded-xl",
  md: "w-11 h-11 text-sm rounded-2xl",
  lg: "w-14 h-14 text-base rounded-2xl",
};

const ICON_SIZE_CLASSES: Record<NonNullable<BotAvatarProps["size"]>, string> = {
  xs: "w-2.5 h-2.5",
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

export const BotAvatar: React.FC<BotAvatarProps> = ({
  bot,
  size = "sm",
  isThinking = false,
}) => {
  const TierIcon =
    bot.tier === "beginner"
      ? Flame
      : bot.tier === "intermediate"
      ? Laugh
      : bot.tier === "advanced"
      ? Sparkles
      : Crown;

  return (
    <div className="relative shrink-0">
      <div
        className={`${SIZE_CLASSES[size]} bg-gradient-to-br ${bot.avatarGradient} flex items-center justify-center font-black text-white shadow-lg ring-1 ${bot.ringColor} select-none`}
      >
        <span>{bot.initials}</span>
      </div>

      {/* Tier corner emblem */}
      {size !== "xs" && (
        <span className="absolute -bottom-1 -right-1 rounded-full bg-[#0c101a] p-0.5 border border-zinc-700/80 shadow">
          <TierIcon
            className={`${ICON_SIZE_CLASSES[size]} ${
              bot.tier === "beginner"
                ? "text-rose-400"
                : bot.tier === "intermediate"
                ? "text-purple-400"
                : bot.tier === "advanced"
                ? "text-cyan-400"
                : "text-amber-400"
            }`}
          />
        </span>
      )}

      {/* Thinking pulse */}
      {isThinking && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#0c101a] animate-ping" />
      )}
    </div>
  );
};

export default BotAvatar;
