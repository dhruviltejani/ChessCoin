import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { AlertCircle, Loader2, Sparkles, Trophy } from "lucide-react";
import PlayerHandleInput from "../components/PlayerHandleInput";
import AvatarSelectionPanel from "../components/AvatarSelectionPanel";
import { type ChessPieceId, getChessPiece } from "../components/chessPieces";
import useHandleAvailability from "../hooks/useHandleAvailability";

interface GoogleProfileState {
  googleUser?: {
    email: string;
    displayName?: string;
    googleId?: string;
    credential: string;
    picture?: string;
  };
  initialAvatarPiece?: ChessPieceId;
}

const CompleteProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as GoogleProfileState) || {};
  const googleUser = state.googleUser;

  const [displayName, setDisplayName] = useState(googleUser?.displayName || "");
  const [displayNameErrors, setDisplayNameErrors] = useState<string[] | undefined>(undefined);
  const [avatarPiece, setAvatarPiece] = useState<ChessPieceId>(
    state.initialAvatarPiece || "queen"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Reusable handle availability hook (starts empty so user enters their own handle)
  const {
    handle,
    handleStatus,
    handleErrors,
    onHandleChange,
    onHandleBlur,
  } = useHandleAvailability("");

  const selectedPiece = getChessPiece(avatarPiece);
  const SelectedIcon = selectedPiece.icon;

  const validateDisplayName = (val: string, isSubmit = false): string[] | undefined => {
    const trimmed = val.trim();
    if (!trimmed) {
      // If the field is empty, do not show error on blur; only require on form submission
      return isSubmit ? ["Display name is required"] : undefined;
    }
    if (trimmed.length < 2) return ["Display name must be at least 2 characters"];
    if (trimmed.length > 20) return ["Display name cannot exceed 20 characters"];
    return undefined;
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayName(val);
    if (val.length > 20) {
      setDisplayNameErrors(["Display name cannot exceed 20 characters"]);
    } else {
      setDisplayNameErrors(undefined);
    }
  };

  const handleDisplayNameBlur = () => {
    setDisplayNameErrors(validateDisplayName(displayName, false));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);

    if (!googleUser?.credential) {
      setApiError("Missing Google credentials. Please sign in with Google first.");
      return;
    }

    const dNameErrors = validateDisplayName(displayName, true);
    if (dNameErrors) {
      setDisplayNameErrors(dNameErrors);
    }

    const hErrors = onHandleBlur(true);

    if (dNameErrors || (hErrors && hErrors.length > 0)) {
      return;
    }

    if (handleStatus === "unavailable" || handleStatus === "checking") {
      return;
    }

    const trimmedHandle = handle.trim();

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: googleUser.credential,
          displayName: displayName.trim(),
          handle: trimmedHandle,
          avatarPiece,
        }),
      }).catch(() =>
        fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credential: googleUser.credential,
            displayName: displayName.trim(),
            handle: trimmedHandle,
            avatarPiece,
          }),
        })
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setApiError(data?.message || "Failed to complete account registration. Please try again.");
        return;
      }

      // Navigate immediately to Dashboard
      navigate("/dashboard", {
        state: {
          user: data.user,
          registeredEmail: data.user.email,
          registeredHandle: data.user.handle,
          displayName: data.user.displayName,
          message: "Account created successfully! Welcome to ChessCoin.",
        },
      });
    } catch (err) {
      console.error("Failed to complete profile:", err);
      setApiError("Unable to reach authentication server. Please verify backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-zinc-950 text-white flex flex-col justify-between overflow-x-hidden overflow-y-auto">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-400/5 blur-3xl" />
      </div>

      {/* Header / Logo */}
      <header className="relative z-10 flex w-full items-center justify-center pt-3 pb-1 px-4">
        <Link to="/signup" className="flex items-center gap-2.5 sm:gap-3 transition hover:opacity-90">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-zinc-900 shadow-lg shadow-cyan-500/10">
            <Trophy className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="text-lg sm:text-2xl font-semibold tracking-tight">
            Chess<span className="text-cyan-400">Coin</span>
          </span>
        </Link>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center px-3 sm:px-6 my-auto py-2">
        <section className="w-full max-w-4xl rounded-2xl border border-zinc-800/90 bg-zinc-900/90 shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden flex flex-col lg:flex-row">
          {/* Left Panel: Profile Setup Form */}
          <div className="w-full flex-1 p-5 sm:p-6 lg:p-7 flex flex-col justify-between">
            <div>
              {/* Heading */}
              <div className="mb-4 text-left">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                    <span>Complete Profile</span>
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                  </h1>
                  <span className="flex lg:hidden items-center gap-1.5 text-xs text-cyan-400 font-medium bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    <SelectedIcon className="h-3.5 w-3.5" />
                    <span>{selectedPiece.name}</span>
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                  Choose your player handle and signature piece to finalize your ChessCoin membership.
                </p>
              </div>

              {/* API General Error */}
              {apiError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
                {/* Display Name */}
                <div>
                  <label
                    htmlFor="displayName"
                    className="mb-1 block text-xs font-medium tracking-wide text-zinc-300"
                  >
                    Display Name
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={handleDisplayNameChange}
                    onBlur={handleDisplayNameBlur}
                    placeholder="Your display name"
                    className={`h-9 sm:h-10 w-full rounded-lg border bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 ${
                      displayNameErrors && displayNameErrors.length > 0
                        ? "border-rose-500/70 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30"
                        : "border-zinc-800 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                    }`}
                  />
                  {displayNameErrors && displayNameErrors.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {displayNameErrors.map((msg, index) => (
                        <p key={index} className="flex items-center gap-1 text-[11px] text-rose-400">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{msg}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reusable Player Handle Input Component */}
                <PlayerHandleInput
                  value={handle}
                  onChange={onHandleChange}
                  onBlur={onHandleBlur}
                  handleStatus={handleStatus}
                  errors={handleErrors}
                  placeholder="grandmaster_x"
                />

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || handleStatus === "unavailable" || handleStatus === "checking"}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-cyan-500/10"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <span>Complete & Enter Arena</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Integrated Vertical / Horizontal Divider */}
          <div className="hidden lg:block w-px bg-linear-to-b from-transparent via-zinc-800 to-transparent" />
          <div className="block lg:hidden h-px w-full bg-zinc-800" />

          {/* Right Panel: Reusable Avatar Selection Panel Component */}
          <AvatarSelectionPanel
            selectedPieceId={avatarPiece}
            onSelectPiece={(pieceId) => setAvatarPiece(pieceId)}
            displayName={displayName}
            handle={handle}
          />
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full pt-1 pb-3 text-center">
        <p className="text-[11px] text-zinc-500">
          © 2025 ChessCoin Protocol. All rights reserved.
        </p>
      </footer>
    </main>
  );
};

export default CompleteProfile;
