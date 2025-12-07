import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-Mail-Adresse ist erforderlich")
    .email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  code: z.string().optional(), // 2FA Code
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name ist erforderlich")
      .min(2, "Name muss mindestens 2 Zeichen haben"),
    email: z
      .string()
      .min(1, "E-Mail-Adresse ist erforderlich")
      .email("Ungültige E-Mail-Adresse"),
    password: z
      .string()
      .min(1, "Passwort ist erforderlich")
      .min(8, "Passwort muss mindestens 8 Zeichen haben")
      .regex(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten")
      .regex(/[a-z]/, "Passwort muss mindestens einen Kleinbuchstaben enthalten")
      .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten")
      .regex(
        /[^A-Za-z0-9]/,
        "Passwort muss mindestens ein Sonderzeichen enthalten"
      ),
    confirmPassword: z.string().min(1, "Passwort-Bestätigung ist erforderlich"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Sie müssen die Nutzungsbedingungen akzeptieren",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-Mail-Adresse ist erforderlich")
    .email("Ungültige E-Mail-Adresse"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Passwort ist erforderlich")
      .min(8, "Passwort muss mindestens 8 Zeichen haben")
      .regex(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten")
      .regex(/[a-z]/, "Passwort muss mindestens einen Kleinbuchstaben enthalten")
      .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten")
      .regex(
        /[^A-Za-z0-9]/,
        "Passwort muss mindestens ein Sonderzeichen enthalten"
      ),
    confirmPassword: z.string().min(1, "Passwort-Bestätigung ist erforderlich"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

export const twoFactorSchema = z.object({
  code: z
    .string()
    .min(6, "Code muss 6 Zeichen haben")
    .max(6, "Code muss 6 Zeichen haben"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;
