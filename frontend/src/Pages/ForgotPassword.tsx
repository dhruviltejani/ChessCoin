import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  AtSign,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Trophy,
} from "lucide-react";
import Button from "../components/Button";
import { forgotPasswordSchema, type ForgotPasswordFormErrors } from "../lib/schema";
import { apiFetch } from "../lib/api";


const ResetLockIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Counter-clockwise circular arrow */}
    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    <polyline points="2.5 3 2.5 7.5 7 7.5" />
    {/* Padlock in the center */}
    <rect x="8.5" y="11" width="7" height="6" rx="1.5" stroke="currentColor" fill="currentColor" fillOpacity="0.25" />
    <path d="M10 11V9a2 2 0 1 1 4 0v2" />
    <circle cx="12" cy="13.8" r="0.8" fill="currentColor" />
  </svg>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setApiError(null);
    if (errors.email) {
      setErrors({});
    }
  };

  const handleBlur = () => {
    if (!email.trim()) {
      setErrors({});
    }
  };

  const startCooldown = () => {
    setResendCooldown(45);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate using Zod
    const validationResult = forgotPasswordSchema.safeParse({ email });
    if (!validationResult.success) {
      setErrors(validationResult.error.flatten().fieldErrors as ForgotPasswordFormErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        if (data?.field === "email") {
          setErrors({ email: [data?.message || "Email not registered."] });
        } else {
          setApiError(data?.message || "Failed to send reset email. Please try again.");
        }
        return;
      }

      // Success
      setIsSubmitted(true);
      if (data?.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
      startCooldown();
    } catch (err) {
      console.error("Forgot password request failed:", err);
      setApiError("Unable to reach backend service. Please check your network or server status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen sm:h-screen w-full bg-[#080b11] text-white flex flex-col justify-between items-center relative overflow-x-hidden overflow-y-auto sm:overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Ambient Radial Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[480px] rounded-full bg-cyan-600/[0.08] blur-[130px]" />
      </div>

      {/* Top Header / Logo */}
      <header className="relative z-10 flex w-full items-center justify-center pt-5 sm:pt-7 pb-2 px-4 shrink-0">
        <Link
          to="/signin"
          className="flex items-center gap-2.5 sm:gap-3 select-none transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-zinc-900 shadow-lg shadow-cyan-500/10">
            <Trophy className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="text-lg sm:text-2xl font-semibold tracking-tight text-white">
            Chess<span className="text-cyan-400">Coin</span>
          </span>
        </Link>
      </header>

      {/* Main Card Container */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-4 my-auto">
        <section className="relative w-full max-w-[420px] sm:max-w-[440px] rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-[#0d121c]/95 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] backdrop-blur-2xl p-6 sm:p-8 transition-all">
          {/* Subtle Glow Behind Icon Badge */}
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl" />

          {/* Top Reset Password Badge */}
          <div className="relative flex justify-center mb-3 sm:mb-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#111928] border border-cyan-500/30 shadow-lg shadow-cyan-500/10 flex items-center justify-center text-cyan-400">
              <ResetLockIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Reset Your Password
            </h1>
            <p className="mt-1.5 text-xs sm:text-[13px] text-zinc-400 leading-relaxed max-w-[320px] mx-auto">
              Enter your verified email . We'll send an encrypted recovery link immediately.
            </p>
          </div>

          {/* General API Error Alert */}
          {apiError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Success State */}
          {isSubmitted ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                  Recovery link dispatched!
                </p>
                <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                  We've sent an encrypted recovery link to:
                  <br />
                  <span className="font-semibold text-cyan-300">{email}</span>
                </p>
              </div>

              {/* Dev mode / Ethereal test inbox link */}
              {previewUrl && (
                <div className="rounded-xl border border-cyan-500/30 bg-[#101a2e] p-3 text-xs text-zinc-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-cyan-400 flex items-center gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Test Email Inbox (Dev Mode):
                    </span>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 underline font-semibold hover:text-cyan-200 transition"
                    >
                      View Email ↗
                    </a>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Nodemailer captured the email via Ethereal. Click above to view the email and test the reset link directly.
                  </p>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSubmit}
                  disabled={resendCooldown > 0}
                  isLoading={isSubmitting}
                  loadingText="Resending..."
                  leftIcon={resendCooldown === 0 ? <RefreshCw className="h-3.5 w-3.5 text-cyan-400" /> : undefined}
                  className="w-full h-11 text-zinc-300 hover:text-white text-xs sm:text-sm font-medium"
                >
                  {resendCooldown > 0 ? `Resend link in ${resendCooldown}s` : "Resend recovery link"}
                </Button>


                <Link
                  to="/signin"
                  className="w-full h-11 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-400/20 active:scale-[0.99]"
                >
                  <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Reset Request Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-zinc-300 mb-1.5 text-left"
                >
                  Identity Verification
                </label>
                <div
                  className={`relative flex items-center w-full rounded-xl bg-[#07090e] border transition h-11 px-3.5 ${
                    errors.email?.length
                      ? "border-rose-500/70 focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400/30"
                      : "border-zinc-800 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/20"
                  }`}
                >
                  <AtSign className="h-4 w-4 text-zinc-500 shrink-0 mr-2.5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="emailadddress@gmail.com"
                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && errors.email.length > 0 && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-rose-400 text-left">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.email[0]}</span>
                  </p>
                )}
              </div>

              {/* Action Button: Send Password Reset Link -> */}
              <Button
                type="submit"
                isLoading={isSubmitting}
                loadingText="Sending Recovery Link..."
                rightIcon={<ArrowRight className="h-4 w-4 stroke-[2.5]" />}
                className="w-full h-11 mt-2 text-zinc-950 font-bold text-xs sm:text-sm"
              >
                Send Password Reset Link
              </Button>


              {/* Back to Sign In Link */}
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

      {/* Page Footer */}
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

export default ForgotPassword;
