import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import {
  signupSchema,
  type SignupFormData,
  type SignupFormErrors,
} from "../lib/schema";

import {
  CHESS_PIECES,
  type ChessPieceId,
} from "../components/chessPieces";
import PlayerHandleInput, { type HandleStatus } from "../components/PlayerHandleInput";
import AvatarSelectionPanel from "../components/AvatarSelectionPanel";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [isEmailRegistered, setIsEmailRegistered] = useState(false);
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [testGoogleEmail, setTestGoogleEmail] = useState("player@chesscoin.org");
  const [testGoogleName, setTestGoogleName] = useState("Chess Champion");

  const [formData, setFormData] = useState<SignupFormData>({
    displayName: "",
    handle: "",
    email: "",
    password: "",
    avatarPiece: "queen",
  });

  const selectedPiece =
    CHESS_PIECES.find((p) => p.id === formData.avatarPiece) || CHESS_PIECES[3];
  const SelectedIcon = selectedPiece.icon;

  const getImmediateError = (
    name: keyof SignupFormData,
    value: string
  ): string[] | undefined => {
    if (name === "displayName" && value.length > 20) {
      return ["Display name cannot exceed 20 characters"];
    }
    if (name === "handle") {
      const handleErrors: string[] = [];
      if (value.length > 0 && !/^[a-zA-Z0-9_]+$/.test(value)) {
        handleErrors.push("Handle can only contain letters, numbers, and underscores");
      }
      if (value.length > 20) {
        handleErrors.push("Handle cannot exceed 20 characters");
      }
      if (handleErrors.length > 0) {
        return handleErrors;
      }
    }
    if (name === "email") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        const result = signupSchema.shape.email.safeParse(trimmed);
        if (!result.success) {
          return result.error.issues.map((issue) => issue.message);
        }
      }
    }
    return undefined;
  };

  const validateField = (
    name: keyof SignupFormData,
    value: unknown
  ): string[] | undefined => {
    // If the input field is empty, do not show any validation errors
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    const fieldSchema = signupSchema.shape[name];
    if (!fieldSchema) return undefined;
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues.map((issue) => issue.message);
    }
    return undefined;
  };

  // Real-time handle availability check against backend users table
  useEffect(() => {
    const trimmed = formData.handle.trim();

    // Skip when empty or format is invalid
    if (!trimmed || trimmed.length < 3 || trimmed.length > 20 || !/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const queryUrl = `/api/auth/check-handle?handle=${encodeURIComponent(trimmed)}`;
        const fallbackUrl = `http://localhost:5000/api/auth/check-handle?handle=${encodeURIComponent(trimmed)}`;

        const response = await fetch(queryUrl, { signal: controller.signal }).catch(() =>
          fetch(fallbackUrl, { signal: controller.signal })
        );
        const data = await response.json();

        if (data.success) {
          if (data.available) {
            setHandleStatus("available");
            setErrors((previous) => ({
              ...previous,
              handle: undefined,
            }));
          } else {
            setHandleStatus("unavailable");
            setErrors((previous) => ({
              ...previous,
              handle: undefined,
            }));
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          console.error("Failed to check handle availability:", err);
          setHandleStatus("idle");
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [formData.handle]);

  // Real-time email availability check against backend users table
  useEffect(() => {
    const trimmed = formData.email.trim();

    // Check if email format is valid before querying backend
    const parseResult = signupSchema.shape.email.safeParse(trimmed);
    if (!trimmed || !parseResult.success) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const queryUrl = `/api/auth/check-email?email=${encodeURIComponent(trimmed)}`;
        const fallbackUrl = `http://localhost:5000/api/auth/check-email?email=${encodeURIComponent(trimmed)}`;

        const response = await fetch(queryUrl, { signal: controller.signal }).catch(() =>
          fetch(fallbackUrl, { signal: controller.signal })
        );
        if (!response) return;
        const data = await response.json();

        if (data.success) {
          if (!data.available) {
            setIsEmailRegistered(true);
            setErrors((previous) => ({
              ...previous,
              email: ["Email address is already registered"],
            }));
          } else {
            setIsEmailRegistered(false);
            setErrors((previous) => {
              if (previous.email?.[0] === "Email address is already registered") {
                return { ...previous, email: undefined };
              }
              return previous;
            });
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          console.error("Failed to check email availability:", err);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [formData.email]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof SignupFormData;
    setFormData((previous) => ({
      ...previous,
      [fieldName]: value,
    }));

    if (fieldName === "email") {
      setIsEmailRegistered(false);
      setErrors((previous) => {
        if (previous.email?.[0] === "Email address is already registered") {
          return { ...previous, email: undefined };
        }
        return previous;
      });
    }


    if (fieldName === "handle") {
      const trimmed = value.trim();
      if (trimmed.length >= 3 && /^[a-zA-Z0-9_]+$/.test(trimmed) && trimmed.length <= 20) {
        setHandleStatus("checking");
      } else {
        setHandleStatus("idle");
      }
    }

    // Immediate errors (such as exceeding maximum character limit) are shown in real time while typing
    const immediateError = getImmediateError(fieldName, value);
    if (immediateError) {
      setErrors((previous) => ({
        ...previous,
        [fieldName]: immediateError,
      }));
    } else {
      // Clear non-immediate errors while typing; they will be validated when leaving the field
      setErrors((previous) => ({
        ...previous,
        [fieldName]: undefined,
      }));
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof SignupFormData;
    const inputValue = value ?? formData[fieldName] ?? "";

    // If the input field is empty, there should be no error shown
    if (!inputValue || inputValue.trim() === "") {
      setErrors((previous) => ({
        ...previous,
        [fieldName]: undefined,
      }));
      return;
    }

    // Show error when the user leaves the input field
    const fieldErrors = validateField(fieldName, inputValue);

    // If handle is unavailable, do not show error message because status badge already displays "Unavailable"
    if (fieldName === "handle" && handleStatus === "unavailable") {
      setErrors((previous) => ({
        ...previous,
        handle: undefined,
      }));
      return;
    }

    // If email is already marked as registered by real-time check, keep the registered error
    if (fieldName === "email" && isEmailRegistered) {
      setErrors((previous) => ({
        ...previous,
        email: ["Email address is already registered"],
      }));
      return;
    }

    setErrors((previous) => ({
      ...previous,
      [fieldName]: fieldErrors,
    }));
  };

  const handleSelectPiece = (pieceId: ChessPieceId) => {
    setFormData((previous) => ({
      ...previous,
      avatarPiece: pieceId,
    }));

    if (errors.avatarPiece) {
      setErrors((previous) => ({
        ...previous,
        avatarPiece: undefined,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    setApiError(null);
    const result = signupSchema.safeParse(formData);

    if (!result.success || isEmailRegistered) {
      const fieldErrors = (result.error ? result.error.flatten().fieldErrors : {}) as SignupFormErrors;
      if (handleStatus === "unavailable") {
        fieldErrors.handle = undefined;
      }
      if (isEmailRegistered) {
        fieldErrors.email = ["Email address is already registered"];
      }
      setErrors(fieldErrors);
      return;
    }

    // Prevent submission if handle is unavailable or checking
    if (handleStatus === "unavailable") {
      return;
    }

    if (handleStatus === "checking") {
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Live validation guard: verify handle is not taken in the users table
      if (handleStatus !== "available") {
        const checkQueryUrl = `/api/auth/check-handle?handle=${encodeURIComponent(formData.handle.trim())}`;
        const checkFallbackUrl = `http://localhost:5000/api/auth/check-handle?handle=${encodeURIComponent(formData.handle.trim())}`;
        const checkRes = await fetch(checkQueryUrl).catch(() => fetch(checkFallbackUrl));
        const checkData = await checkRes.json();
        if (checkData.success && !checkData.available) {
          setHandleStatus("unavailable");
          setErrors((previous) => ({
            ...previous,
            handle: undefined,
          }));
          setIsSubmitting(false);
          return;
        }
      }

      const registerUrl = "/api/auth/register";
      const registerFallbackUrl = "http://localhost:5000/api/auth/register";
      const response = await fetch(registerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }).catch(() =>
        fetch(registerFallbackUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.field && data.message) {
          if (data.field === "handle") {
            setHandleStatus("unavailable");
            setErrors((previous) => ({
              ...previous,
              handle: undefined,
            }));
          } else if (data.field === "email") {
            setIsEmailRegistered(true);
            setErrors((previous) => ({
              ...previous,
              email: [data.message],
            }));
          } else {
            setErrors((previous) => ({
              ...previous,
              [data.field]: [data.message],
            }));
          }
        } else if (data.errors) {
          if (data.errors.handle) {
            setHandleStatus("unavailable");
            delete data.errors.handle;
          }
          setErrors(data.errors);
        } else {
          setApiError(data.message || "Failed to create account. Please try again.");
        }
        return;
      }

      console.log("Signup successful:", data.user);

      // Navigate immediately to Dashboard
      navigate("/dashboard", {
        state: {
          user: data.user,
          registeredEmail: data.user.email || formData.email,
          registeredHandle: data.user.handle || formData.handle,
          displayName: data.user.displayName || formData.displayName,
          message: "Account created successfully! Welcome to ChessCoin.",
        },
      });
    } catch (err) {
      console.error("Failed to connect to backend server:", err);
      setApiError("Unable to reach backend server. Please make sure the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGoogleConfigured = Boolean(
    import.meta.env.VITE_GOOGLE_CLIENT_ID &&
      import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() !== "" &&
      !import.meta.env.VITE_GOOGLE_CLIENT_ID.startsWith("your-")
  );

  const handleGoogleAuthSuccess = async (credentialOrPayload: string) => {
    setApiError(null);

    try {
      // Check if user already exists
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentialOrPayload,
          checkOnly: true,
        }),
      }).catch(() =>
        fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credential: credentialOrPayload,
            checkOnly: true,
          }),
        })
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setApiError(data?.message || "Google verification failed. Please try again.");
        return;
      }

      setShowGoogleSetupModal(false);

      if (!data.isNewUser && data.user) {
        // User already has an account, redirect to dashboard
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

      // New Google User: Redirect to Complete Profile onboarding page!
      navigate("/complete-profile", {
        state: {
          googleUser: {
            email: data.googleProfile?.email,
            displayName: data.googleProfile?.displayName,
            googleId: data.googleProfile?.googleId,
            credential: credentialOrPayload,
            picture: data.googleProfile?.picture,
          },
          initialAvatarPiece: formData.avatarPiece,
        },
      });
    } catch (err) {
      console.error("Google sign up error:", err);
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

  const handleGoogleSignup = () => {
    if (isGoogleConfigured) {
      googleLogin();
    } else {
      setShowGoogleSetupModal(true);
    }
  };

  const getInputClassName = (hasError?: boolean) =>
    `h-9 sm:h-10 w-full rounded-lg border bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 ${
      hasError
        ? "border-rose-500/70 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30"
        : "border-zinc-800 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
    }`;

  return (
    <main className="min-h-screen w-full bg-zinc-950 text-white flex flex-col justify-between overflow-x-hidden overflow-y-auto">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-400/5 blur-3xl" />
      </div>

      {/* Header / Logo */}
      <header className="relative z-10 flex w-full items-center justify-center pt-2 sm:pt-3 pb-1 px-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-zinc-900 shadow-lg shadow-cyan-500/10">
            <Trophy className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="text-lg sm:text-2xl font-semibold tracking-tight">
            Chess<span className="text-cyan-400">Coin</span>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center px-3 sm:px-6 my-auto py-3 sm:py-6 transition-all duration-200">
        {/* Unified Signup & Profile Card (Single Connected Div) */}
        <section className="w-full max-w-4xl rounded-2xl border border-zinc-800/90 bg-zinc-900/90 shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Panel: Signup Credentials Form */}
          <div className="w-full flex-1 p-5 sm:p-6 lg:p-6 flex flex-col justify-between">
            <div>
              {/* Heading */}
              <div className="mb-3 text-left">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100">
                    Create Account
                  </h1>
                  <span className="flex lg:hidden items-center gap-1.5 text-xs text-cyan-400 font-medium bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    <SelectedIcon className="h-3.5 w-3.5" />
                    <span>{selectedPiece.name}</span>
                  </span>
                </div>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-400">
                  Compete in rated blitz leagues, earn tokens, and join verified tournaments.
                </p>
              </div>

              {/* API General Error Banner */}
              {apiError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
                {/* Display Name with linked avatar indicator */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label
                      htmlFor="displayName"
                      className="text-xs font-medium tracking-wide text-zinc-300"
                    > 
                      Display Name
                    </label>
    
                  </div>

                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Your display name"
                    className={getInputClassName(Boolean(errors.displayName?.length))}
                  />
                  {errors.displayName && errors.displayName.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {errors.displayName.map((msg, index) => (
                        <p key={index} className="flex items-center gap-1 text-[11px] text-rose-400">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{msg}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Player Handle */}
                <PlayerHandleInput
                  value={formData.handle}
                  onChange={(val) => {
                    const fakeEvent = {
                      target: { name: "handle", value: val },
                    } as React.ChangeEvent<HTMLInputElement>;
                    handleChange(fakeEvent);
                  }}
                  onBlur={handleBlur}
                  handleStatus={handleStatus}
                  errors={errors.handle}
                />

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-xs font-medium tracking-wide text-zinc-300"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@chesscoin.org"
                    className={getInputClassName(Boolean(errors.email?.length))}
                  />
                  {errors.email && errors.email.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {errors.email.map((msg, index) => (
                        <p key={index} className="flex items-center gap-1 text-[11px] text-rose-400">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{msg}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-xs font-medium tracking-wide text-zinc-300"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Create a strong password"
                      className={`${getInputClassName(Boolean(errors.password?.length))} pr-10`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && errors.password.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      {errors.password.map((msg, index) => (
                        <p key={index} className="flex items-center gap-1 text-[11px] text-rose-400">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{msg}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Create Account Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting || handleStatus === "unavailable" || handleStatus === "checking"}
                    className="mt-2 flex h-9 sm:h-10 w-full sm:w-56 max-w-xs items-center justify-center gap-2 rounded-lg bg-cyan-400 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="my-2 sm:my-2.5 flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-[11px] font-medium tracking-wide text-zinc-500">
                  OR FAST SIGN UP WITH
                </span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              {/* Google Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="flex h-9 sm:h-10 w-full sm:w-56 max-w-xs items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800/80 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M21.35 12.23c0-.79-.07-1.55-.2-2.28H12v4.32h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.43Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.75 9.75 0 0 0 12 21.75Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.54 13.83a5.86 5.86 0 0 1 0-3.66V7.64H3.29a9.75 9.75 0 0 0 0 8.72l3.25-2.53Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.24 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.39l3.25 2.53C7.31 7.86 9.46 6.14 12 6.14Z"
                    />
                  </svg>
                  Google
                </button>
              </div>
            </div>

            {/* Already have an account */}
            <div className="mt-2.5 text-center text-xs text-zinc-400 flex justify-center items-center gap-1">
              <span>Already have an account ?</span>
              <Link
                to="/signin"
                className="font-semibold text-cyan-400 transition hover:text-cyan-300 hover:underline underline-offset-4"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Integrated Vertical / Horizontal Divider */}
          <div className="hidden lg:block w-px bg-linear-to-b from-transparent via-zinc-800 to-transparent" />
          <div className="block lg:hidden h-px w-full bg-zinc-800" />

          {/* Right Panel: Reusable Avatar Selection Panel Component */}
          <AvatarSelectionPanel
            selectedPieceId={formData.avatarPiece as ChessPieceId}
            onSelectPiece={(pieceId) => handleSelectPiece(pieceId)}
            displayName={formData.displayName}
            handle={formData.handle}
            error={errors.avatarPiece?.[0]}
          />

        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full pt-2 pb-2 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
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

      {/* Google OAuth Configuration & Dev Simulation Modal */}
      {showGoogleSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowGoogleSetupModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-semibold text-zinc-100">Google OAuth Setup & Dev Mode</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              To use real Google Sign-In, configure <code className="text-cyan-400 bg-zinc-950 px-1 py-0.5 rounded">VITE_GOOGLE_CLIENT_ID</code> in <code className="text-cyan-400 bg-zinc-950 px-1 py-0.5 rounded">frontend/.env</code>.
            </p>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 mb-4 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                Instant Dev Test with Selected Avatar ({selectedPiece.name})
              </span>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Simulated Google Email</label>
                <input
                  type="email"
                  value={testGoogleEmail}
                  onChange={(e) => setTestGoogleEmail(e.target.value)}
                  className="h-8 w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-200 outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Simulated Google Name</label>
                <input
                  type="text"
                  value={testGoogleName}
                  onChange={(e) => setTestGoogleName(e.target.value)}
                  className="h-8 w-full rounded border border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-200 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  const testPayload = JSON.stringify({
                    email: testGoogleEmail.trim() || "grandmaster@chesscoin.org",
                    name: testGoogleName.trim() || "Chess Master",
                    sub: `google_dev_${Date.now()}`,
                  });
                  handleGoogleAuthSuccess(testPayload);
                }}
                className="flex-1 h-9 rounded-lg bg-cyan-400 text-xs font-semibold text-zinc-950 hover:bg-cyan-300 transition flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Signing up...</span>
                  </>
                ) : (
                  <span>Test Google Signup Now</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowGoogleSetupModal(false)}
                className="h-9 px-3 rounded-lg border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
    </main>
  );
};

export default Signup;