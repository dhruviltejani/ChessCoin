import { useState, useEffect } from "react";
import type { HandleStatus } from "../components/PlayerHandleInput";
import { signupSchema } from "../lib/schema";

export const validateHandleFormat = (value: string): string[] | undefined => {
  const errors: string[] = [];
  if (value.length > 0 && !/^[a-zA-Z0-9_]+$/.test(value)) {
    errors.push("Handle can only contain letters, numbers, and underscores");
  }
  if (value.length > 20) {
    errors.push("Handle cannot exceed 20 characters");
  }
  return errors.length > 0 ? errors : undefined;
};

export const validateHandleWithZod = (value: string, isSubmit = false): string[] | undefined => {
  const trimmed = value.trim();
  if (!trimmed) {
    return isSubmit ? ["Player handle is required"] : undefined;
  }

  const result = signupSchema.shape.handle.safeParse(trimmed);
  if (!result.success) {
    return result.error.issues.map((issue) => issue.message);
  }
  return undefined;
};

export const useHandleAvailability = (initialValue: string = "") => {
  const [handle, setHandle] = useState(initialValue);
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [handleErrors, setHandleErrors] = useState<string[] | undefined>(undefined);

  // Debounced real-time availability check
  useEffect(() => {
    const trimmed = handle.trim();

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
            setHandleErrors(undefined);
          } else {
            setHandleStatus("unavailable");
            setHandleErrors(undefined);
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
  }, [handle]);

  const onHandleChange = (newValue: string) => {
    setHandle(newValue);
    const trimmed = newValue.trim();

    if (trimmed.length >= 3 && /^[a-zA-Z0-9_]+$/.test(trimmed) && trimmed.length <= 20) {
      setHandleStatus("checking");
    } else {
      setHandleStatus("idle");
    }

    const immediateError = validateHandleFormat(newValue);
    if (immediateError) {
      setHandleErrors(immediateError);
    } else {
      setHandleErrors(undefined);
    }
  };

  const onHandleBlur = (
    eventOrSubmit?: React.FocusEvent<HTMLInputElement> | boolean
  ): string[] | undefined => {
    const isSubmit = typeof eventOrSubmit === "boolean" ? eventOrSubmit : false;
    const trimmed = handle.trim();
    if (!trimmed && !isSubmit) {
      setHandleErrors(undefined);
      return undefined;
    }

    if (handleStatus === "unavailable") {
      setHandleErrors(undefined);
      return undefined;
    }

    const errors = validateHandleWithZod(handle, isSubmit);
    setHandleErrors(errors);
    return errors;
  };

  return {
    handle,
    setHandle,
    handleStatus,
    setHandleStatus,
    handleErrors,
    setHandleErrors,
    onHandleChange,
    onHandleBlur,
    validateHandleWithZod,
  };
};

export default useHandleAvailability;
