import { z } from "zod";

export const signupSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .min(2, "Display name must be at least 2 characters")
    .max(20, "Display name cannot exceed 20 characters"),
  handle: z
    .string()
    .trim()
    .min(1, "Player handle is required")
    .min(3, "Handle must be at least 3 characters")
    .max(20, "Handle cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Handle can only contain letters, numbers, and underscores"),
  email: z
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .superRefine((val, ctx) => {
      if (!val) return;

      if (val.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be at least 6 characters",
        });
      }
      if (!/[A-Z]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must contain at least one uppercase letter",
        });
      }
      if (!/[a-z]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must contain at least one lowercase letter",
        });
      }
      if (!/[0-9]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must contain at least one digit",
        });
      }
      if (!/[\W_]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must contain at least one special character",
        });
      }
    }),
  avatarPiece: z.enum(["rook", "pawn", "bishop", "queen", "king", "knight"]),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type SignupFormErrors = Partial<Record<keyof SignupFormData, string[]>>;
