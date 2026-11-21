import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar/Sidebar";
import ChessGameView from "../components/chess/ChessGameView";

export const PlayPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("play");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Extract user info if passed via router state
  const state = location.state as {
    user?: { displayName?: string; handle?: string; email?: string; avatarUrl?: string };
    displayName?: string;
    registeredHandle?: string;
  } | null;

  const displayName = state?.user?.displayName || state?.displayName || "Dhruvil";
  const rawHandle = state?.user?.handle || state?.registeredHandle || "dhruvil";
  const handle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
  const avatarUrl = state?.user?.avatarUrl;

  const user = {
    name: displayName,
    handle,
    avatarUrl,
  };

  const handleSidebarItemClick = (id: string) => {
    if (id === "home") {
      navigate("/dashboard");
    } else {
      setActiveTab(id);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#07090e] text-white overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      {/* Desktop Sidebar (Hidden in Focus Mode) */}
      {!isFocusMode && (
        <div className="hidden md:flex shrink-0 animate-in fade-in duration-200">
          <Sidebar
            activeItem={activeTab}
            onItemClick={handleSidebarItemClick}
            user={user}
          />
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform md:hidden transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close Sidebar"
            className="absolute top-4 right-3 text-zinc-400 hover:text-white z-50 p-1.5 rounded-lg bg-zinc-800/80 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <Sidebar
            activeItem={activeTab}
            onItemClick={(id) => {
              handleSidebarItemClick(id);
              setMobileSidebarOpen(false);
            }}
            user={user}
          />
        </div>
      </div>

      {/* Main Content Area (Strictly non-scrollable) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Top Navbar */}
        <header className="flex md:hidden items-center justify-between px-4 py-2 border-b border-zinc-800/80 bg-[#080b11] shrink-0 z-30">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open Sidebar"
            className="p-2 rounded-xl border border-zinc-800 bg-[#121622] text-zinc-300 hover:text-white cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-white tracking-wider text-base">
            CHESS<span className="text-cyan-400">COIN</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-[#00bcd4] flex items-center justify-center text-zinc-950 font-bold text-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Inner Container: Perfectly centered and shrunk to fit without scroll */}
        <div className="flex-1 flex items-center justify-center p-1 sm:p-2 overflow-hidden w-full h-full">
          <ChessGameView
            isFocusMode={isFocusMode}
            onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayPage;
