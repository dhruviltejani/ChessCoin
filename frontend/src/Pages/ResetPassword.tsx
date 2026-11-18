import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Trophy,
  XCircle,
} from "lucide-react";
import Button from "../components/Button";
import { resetPasswordSchema, type ResetPasswordFormErrors } from "../lib/schema";


const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [targetEmail, setTargetEmail] = useState<string | null>(null);

  const [errors, setErrors] = useState<ResetPasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsVerifyingToken(false);
      setIsTokenValid(false);
      setApiError("No reset token provided. Please request a new recovery link.");
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`).catch(() =>
          fetch(`http://localhost:5000/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
        );
        const data = await res.json().catch(() => null);

        if (res.ok && data?.valid) {
          setIsTokenValid(true);
          setTargetEmail(data.email || null);
        } else {
          setIsTokenValid(false);
          setApiError(data?.message || "This password reset link is invalid or has expired.");
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        setIsTokenValid(false);
        setApiError("Unable to verify link with server. Please ensure backend is reachable.");
      } finally {
        setIsVerifyingToken(false);
      }
    };

    checkToken();
  }, [token]);

  // Realtime password criteria
  const passwordCriteria = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[\W_]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validationResult = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      setErrors(validationResult.error.flatten().fieldErrors as ResetPasswordFormErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const endpoint = "/api/auth/reset-password";
      const fallbackEndpoint = "http://localhost:5000/api/auth/reset-password";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      }).catch(() =>
        fetch(fallbackEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        })
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setApiError(data?.message || "Failed to reset password. Please request a new link.");
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        navigate("/signin", {
          state: { message: "Password updated successfully! Please sign in with your new password." },
        });
      }, 2500);
    } catch (err) {
      console.error("Password reset submit error:", err);
      setApiError("Unable to reach backend service. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen sm:h-screen w-full bg-[#080b11] text-white flex flex-col justify-between items-center relative overflow-x-hidden overflow-y-auto sm:overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Radial Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-cyan-600/[0.08] blur-[130px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 flex w-full items-center justify-center pt-5 sm:pt-7 pb-2 px-4 shrink-0">
        <Link to="/signin" className="flex items-center gap-2.5 sm:gap-3 select-none transition hover:opacity-90">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-zinc-900 shadow-lg shadow-cyan-500/10">
            <Trophy className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="text-lg sm:text-2xl font-semibold tracking-tight text-white">
            Chess<span className="text-cyan-400">Coin</span>
          </span>
        </Link>
      </header>

      {/* Main Container */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-4 my-auto">
        <section className="relative w-full max-w-[420px] sm:max-w-[440px] rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-[#0d121c]/95 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] backdrop-blur-2xl p-6 sm:p-8 transition-all">
          {/* Badge */}
          <div className="relative flex justify-center mb-3 sm:mb-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#111928] border border-cyan-500/30 shadow-lg shadow-cyan-500/10 flex items-center justify-center text-cyan-400">
              <KeyRound className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
          </div>

          <div className="text-center mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Choose New Password
            </h1>
            <p className="mt-1.5 text-xs sm:text-[13px] text-zinc-400 leading-relaxed max-w-[320px] mx-auto">
              {targetEmail
                ? `Creating a new secure password for ${targetEmail}`
                : "Create a strong and secure password for your account"}
            </p>
          </div>

          {/* Token verification loading */}
          {isVerifyingToken && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="h-7 w-7 text-cyan-400 animate-spin" />
              <p className="text-xs text-zinc-400">Verifying security token...</p>
            </div>
          )}

          {/* Invalid / Expired Token */}
          {!isVerifyingToken && !isTokenValid && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
                <XCircle className="h-7 w-7 text-rose-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-rose-300">Invalid or Expired Link</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  {apiError || "This recovery link is no longer valid. Recovery links expire after 1 hour."}
                </p>
              </div>

              <Link
                to="/forgot-password"
                className="w-full h-11 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-400/20"
              >
                <span>Request New Reset Link</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Success state */}
          {!isVerifyingToken && isTokenValid && isSuccess && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center py-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-emerald-300">Password Updated Successfully!</h3>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  Your new password is now active. Redirecting you to sign in...
                </p>
              </div>

              <Link
                to="/signin"
                className="w-full h-11 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Password Reset Form */}
          {!isVerifyingToken && isTokenValid && !isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {apiError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  New Password
                </label>
                <div
                  className={`relative flex items-center w-full rounded-xl bg-[#07090e] border transition h-11 px-3.5 ${
                    errors.password?.length
                      ? "border-rose-500/70 focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400/30"
                      : "border-zinc-800 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20"
                  }`}
                >
                  <Lock className="h-4 w-4 text-zinc-500 shrink-0 mr-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && errors.password.length > 0 && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.password[0]}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Confirm Password
                </label>
                <div
                  className={`relative flex items-center w-full rounded-xl bg-[#07090e] border transition h-11 px-3.5 ${
                    errors.confirmPassword?.length
                      ? "border-rose-500/70 focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400/30"
                      : "border-zinc-800 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20"
                  }`}
                >
                  <Lock className="h-4 w-4 text-zinc-500 shrink-0 mr-2.5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && errors.confirmPassword.length > 0 && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.confirmPassword[0]}</span>
                  </p>
                )}
              </div>

              {/* Password strength checklist */}
              <div className="p-2.5 rounded-xl bg-[#070a12] border border-zinc-800/80 space-y-1.5 text-[11px]">
                <div className="grid grid-cols-2 gap-1 text-zinc-400">
                  {passwordCriteria.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      {item.met ? (
                        <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 mx-1 shrink-0" />
                      )}
                      <span className={item.met ? "text-emerald-300 font-medium" : "text-zinc-500"}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button
                type="submit"
                isLoading={isSubmitting}
                loadingText="Updating Password..."
                rightIcon={<ArrowRight className="h-4 w-4 stroke-[2.5]" />}
                className="w-full h-11 mt-2 text-zinc-950 font-bold text-xs sm:text-sm"
              >
                Set New Password
              </Button>


              <div className="pt-2 text-center">
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-cyan-300 transition group"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full pt-1 pb-4 sm:pb-6 text-center shrink-0">
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
    </main>
  );
};

export default ResetPassword;
