import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2,
  Bell,
  LayoutGrid,
  MessageSquare,
  Play,
  Settings,
  Shield,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { PawnIcon } from "../ChessIcons";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string | number;
}

export interface SidebarProps {
  activeItem?: string;
  defaultActiveItem?: string;
  onItemClick?: (id: string) => void;
  user?: {
    name?: string;
    handle?: string;
    avatarUrl?: string;
  };
  className?: string;
}

const mainNavItems: NavItem[] = [
  { id: "home", label: "Home", icon: LayoutGrid },
  { id: "play", label: "Play", icon: Play },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "leagues", label: "Leagues", icon: Shield },
  { id: "leaderboard", label: "Leaderboard", icon: BarChart2 },
];

const secondaryNavItems: NavItem[] = [
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "friends", label: "Friends", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  defaultActiveItem = "home",
  onItemClick,
  user = {
    name: "Dhruvil",
    handle: "@dhruvil",
  },
  className = "",
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [internalActive, setInternalActive] = useState(defaultActiveItem);
  const currentPath = location.pathname;
  const pathBasedItem = currentPath.startsWith("/tournaments")
    ? "tournaments"
    : currentPath.startsWith("/dashboard") || currentPath.startsWith("/home")
    ? "home"
    : internalActive;

  const currentActive = (activeItem !== undefined ? activeItem : pathBasedItem).toLowerCase();

  const handleSelect = (id: string) => {
    setInternalActive(id);
    if (onItemClick) {
      onItemClick(id);
    }
    if (id === "tournaments" && !location.pathname.startsWith("/tournaments")) {
      navigate("/tournaments", { state: { user } });
    } else if (
      id === "home" &&
      !location.pathname.startsWith("/dashboard") &&
      !location.pathname.startsWith("/home")
    ) {
      navigate("/dashboard", { state: { user } });
    }
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = currentActive === item.id.toLowerCase();
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelect(item.id)}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all select-none text-left cursor-pointer ${
          isActive
            ? "bg-[#00bcd4] text-zinc-950 font-semibold shadow-md shadow-cyan-500/20"
            : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-zinc-950 stroke-[2.2]" : "text-zinc-400"}`} />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <aside
      className={`w-60 sm:w-64 h-screen bg-[#080b11] border-r border-zinc-800/70 flex flex-col justify-between p-4 shrink-0 select-none ${className}`}
    >
      <div className="flex flex-col flex-1">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-2 py-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#141824] border border-cyan-500/30 flex items-center justify-center shadow-md shadow-amber-500/5 shrink-0">
            <PawnIcon className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="text-white font-bold tracking-wider text-base sm:text-lg">
            CHESSCOIN
          </span>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {mainNavItems.map(renderNavItem)}
        </nav>

        {/* Divider */}
        <div className="my-3 border-t border-zinc-800/80" />

        {/* Secondary Navigation */}
        <nav className="space-y-1">
          {secondaryNavItems.map(renderNavItem)}
        </nav>
      </div>

      {/* User Profile Card at bottom */}
      <div className="mt-auto pt-3">
        <div className="p-2.5 rounded-2xl bg-[#111520] border border-zinc-800/80 flex items-center gap-3 shadow-inner">
          <div className="w-9 h-9 rounded-full bg-[#00bcd4] flex items-center justify-center text-zinc-950 shrink-0 font-bold shadow-sm">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-zinc-950 stroke-[2.2]" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate leading-tight">
              {user.name || "Dhruvil"}
            </span>
            <span className="text-xs text-zinc-400 truncate leading-tight mt-0.5">
              {user.handle || "@dhruvil"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
