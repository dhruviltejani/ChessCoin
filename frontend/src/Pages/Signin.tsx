import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { apiFetch } from "../lib/api";
import {
  AlertCircle,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Swords,
  Trophy,
  X,
} from "lucide-react";
import { BishopIcon } from "../components/ChessIcons";
import GoogleButton from "../components/Buttons/GoogleButton";
import { signinSchema, type SigninFormData, type SigninFormErrors } from "../lib/schema";

const Signin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const flashMessage = (location.state as { message?: string } | null)?.message;

  const [formData, setFormData] = useState<SigninFormData>({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<SigninFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);


  // Google setup / dev simulation modal
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [testGoogleEmail, setTestGoogleEmail] = useState("player@chesscoin.org");
  const [testGoogleName, setTestGoogleName] = useState("Chess Champion");

  const isGoogleConfigured = Boolean(
    import.meta.env.VITE_GOOGLE_CLIENT_ID &&
      import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() !== "" &&
      !import.meta.env.VITE_GOOGLE_CLIENT_ID.startsWith("your-")
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setApiError(null);

    // Clear error for this field while typing
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // If the input field is empty, do not show any validation errors on blur
    if (!value || value.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);

    // Validate on submit using Zod schema
    const validationResult = signinSchema.safeParse(formData);
    if (!validationResult.success) {
      setErrors(validationResult.error.flatten().fieldErrors as SigninFormErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);


    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        if (data?.field && data?.message) {
          setErrors({ [data.field]: [data.message] });
        } else {
          setApiError(data?.message || "Invalid credentials. Please verify your email/handle and password.");
        }
        return;
      }


      // Successful sign in -> Navigate to Dashboard
      navigate("/dashboard", {
        state: {
          user: data.user,
          displayName: data.user.displayName,
          registeredEmail: data.user.email,
          registeredHandle: data.user.handle,
          message: `Welcome back, ${data.user.displayName}!`,
        },
      });
    } catch (err) {
      console.error("Sign in failed:", err);
      setApiError("Unable to reach backend server. Please make sure the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuthSuccess = async (credentialOrPayload: string) => {
    setApiError(null);

    try {
      const response = await apiFetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentialOrPayload,
          checkOnly: true,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setApiError(data?.message || "Google verification failed. Please try again.");
        return;
      }

      setShowGoogleSetupModal(false);

      if (!data.isNewUser && data.user) {
        // User already has an account -> direct to Dashboard
        navigate("/dashboard", {
          state: {
            user: data.user,
            registeredEmail: data.user.email,
            registeredHandle: data.user.handle,
            displayName: data.user.displayName,
            message: `Welcome back, ${data.user.displayName}!`,
          },
        });
        return;
      }

      // New Google User -> Redirect to Complete Profile onboarding
      navigate("/complete-profile", {
        state: {
          googleUser: {
            email: data.googleProfile?.email,
            displayName: data.googleProfile?.displayName,
            googleId: data.googleProfile?.googleId,
            credential: credentialOrPayload,
            picture: data.googleProfile?.picture,
          },
          initialAvatarPiece: "bishop",
        },
      });
    } catch (err) {
      console.error("Google sign in error:", err);
      setApiError("Unable to reach backend server. Please verify backend is running.");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        await handleGoogleAuthSuccess(
          JSON.stringify({
            sub: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name || userInfo.given_name,
            picture: userInfo.picture,
          })
        );
      } catch (err) {
        console.error("Failed to fetch Google profile:", err);
        setApiError("Failed to fetch Google user profile.");
      }
    },
    onError: (err) => {
      console.warn("Google Sign-In was cancelled or failed:", err);
    },
  });

  const handleGoogleSignin = () => {
    if (isGoogleConfigured) {
      googleLogin();
    } else {
      setShowGoogleSetupModal(true);
    }
  };

  return (

    <main className="min-h-screen sm:h-screen w-full bg-[#080b11] text-white flex flex-col justify-between items-center relative overflow-x-hidden overflow-y-auto sm:overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient Radial Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-cyan-600/[0.07] blur-[130px]" />
      </div>

      {/* Top Header / Logo */}
      <header className="relative z-10 flex w-full items-center justify-center pt-2 sm:pt-3 pb-1 px-4 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 select-none">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-zinc-900 shadow-lg shadow-cyan-500/10">
            <Trophy className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="text-lg sm:text-2xl font-semibold tracking-tight">
            Chess<span className="text-cyan-400">Coin</span>
          </span>
        </div>
      </header>



      {/* Main Content Area */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-2 my-auto">
        <section className="w-full max-w-[420px] sm:max-w-[440px] rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-[#0d121c]/95 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] backdrop-blur-2xl p-5 sm:p-7 transition-all">
          {/* Top Avatar Badge with Bishop & Online Green Dot */}
          <div className="flex justify-center mb-2.5 sm:mb-3">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#141b29] border border-zinc-700/60 shadow-inner flex items-center justify-center">
                <BishopIcon className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-300" />
              </div>
              {/* Online Green Status Dot */}
              <span
                className="absolute -bottom-1 -right-1 w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-[#10b981] ring-[2.5px] ring-[#0d121c]"
                title="Online"
                aria-label="Online"
              />
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Welcome Back, Chessmaster
            </h1>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-[270px] sm:max-w-xs mx-auto">
              Sign in to access your ratings, leagues, and live tournaments
            </p>
          </div>

          {/* Flash / Navigation Message (e.g., from reset password or signup) */}
          {flashMessage && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400 animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{flashMessage}</span>
            </div>
          )}

          {/* General API Error Alert */}
          {apiError && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Signin Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            {/* Email / Handle Input */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-medium text-zinc-300 mb-1 text-left"
              >
                Email or Username 
              </label>
              <div
                className={`relative flex items-center w-full rounded-xl bg-[#07090e] border transition h-10 sm:h-11 px-3.5 ${
                  errors.identifier?.length
                    ? "border-rose-500/70 focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400/30"
                    : "border-zinc-800 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20"
                }`}
              >
                <AtSign className="h-4 w-4 text-zinc-500 shrink-0 mr-2.5" />
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  value={formData.identifier}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="gm_hikaru or grandmaster@chess.org"
                  className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
              {errors.identifier && errors.identifier.length > 0 && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.identifier[0]}</span>
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-zinc-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition hover:underline cursor-pointer"
                >
                  Forgot Password?
                </Link>
              </div>

              <div
                className={`relative flex items-center w-full rounded-xl bg-[#07090e] border transition h-10 sm:h-11 px-3.5 ${
                  errors.password?.length
                    ? "border-rose-500/70 focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400/30"
                    : "border-zinc-800 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20"
                }`}
              >
                <Lock className="h-4 w-4 text-zinc-500 shrink-0 mr-2.5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && errors.password.length > 0 && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errors.password[0]}</span>
                </p>
              )}
            </div>



            {/* Sign In to Play Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 sm:h-11 mt-4 sm:mt-5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-lg shadow-cyan-400/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Swords className="h-4 w-4 stroke-[2.5] text-zinc-950" />
                  <span>Sign In to Play</span>
                </>
              )}
            </button>
          </form>

          {/* Fully Centered Divider */}
          <div className="my-3 sm:my-3.5 flex items-center justify-center gap-3 w-full">
            <div className="h-px flex-1 bg-zinc-800/80" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-zinc-500 uppercase select-none shrink-0 text-center">
              OR CONTINUE WITH
            </span>
            <div className="h-px flex-1 bg-zinc-800/80" />
          </div>

          {/* Google Sign In Button */}
          <div className="flex justify-center">
            <GoogleButton
              size="h-9 sm:h-10 w-full sm:w-56 max-w-xs"
              onClick={handleGoogleSignin}
            />
          </div>

          {/* Bottom Prompt / Sign Up Link */}
          <div className="mt-3.5 sm:mt-4 text-center text-xs text-zinc-400 flex items-center justify-center gap-1.5">
            <span>Don't have a ChessCoin account?</span>
            <Link
              to="/signup"
              className="font-semibold text-cyan-400 transition hover:text-cyan-300 hover:underline underline-offset-4"
            >
              Sign Up free
            </Link>
          </div>
        </section>
      </div>

      {/* Page Footer */}
      <footer className="relative z-10 w-full pt-1 pb-2 sm:pb-3 text-center shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-zinc-400">
          <a href="#" className="transition hover:text-zinc-200">
            Terms of Service
          </a>
          <span className="text-zinc-600">•</span>
          <a href="#" className="transition hover:text-zinc-200">
            Privacy Policy
          </a>
          <span className="text-zinc-600">•</span>
          <a href="#" className="transition hover:text-zinc-200">
            Support
          </a>
        </div>
        <p className="mt-1 text-[11px] text-zinc-500">
          © 2025 ChessCoin Protocol. All rights reserved.
        </p>

      </footer>

      {/* Google Setup / Dev Simulation Modal (if Google Client ID is unconfigured) */}
      {showGoogleSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0d121c] p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowGoogleSetupModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-white">Google Sign-In</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Google OAuth client ID is not configured in environment variables. You can test instant Google Sign-In with a simulated profile below:
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Google Email
                </label>
                <input
                  type="email"
                  value={testGoogleEmail}
                  onChange={(e) => setTestGoogleEmail(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#07090e] border border-zinc-800 px-3 text-sm text-zinc-200 outline-none focus:border-cyan-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Google Display Name
                </label>
                <input
                  type="text"
                  value={testGoogleName}
                  onChange={(e) => setTestGoogleName(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#07090e] border border-zinc-800 px-3 text-sm text-zinc-200 outline-none focus:border-cyan-500/60"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowGoogleSetupModal(false)}
                className="flex-1 h-10 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleGoogleAuthSuccess(
                    JSON.stringify({
                      sub: `dev_google_${Date.now()}`,
                      email: testGoogleEmail,
                      name: testGoogleName,
                    })
                  );
                }}
                className="flex-1 h-10 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-bold transition flex items-center justify-center cursor-pointer"
              >
                Continue as {testGoogleName.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Signin;
