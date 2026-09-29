import { z } from "zod";

export const signinSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or player handle is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});



export type SigninFormData = z.infer<typeof signinSchema>;
export type SigninFormErrors = Partial<Record<keyof SigninFormData, string[]>>;
