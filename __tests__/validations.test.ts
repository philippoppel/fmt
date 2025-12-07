import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  twoFactorSchema,
} from "@/lib/validations/auth";

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("should accept valid credentials", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should accept login with optional 2FA code", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        code: "123456",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
      }
    });

    it("should reject empty email", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      acceptTerms: true,
    };

    it("should accept valid registration data", () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject name with less than 2 characters", () => {
      const result = registerSchema.safeParse({ ...validData, name: "J" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("name"))).toBe(true);
      }
    });

    it("should reject password without uppercase letter", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "password1!",
        confirmPassword: "password1!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without lowercase letter", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "PASSWORD1!",
        confirmPassword: "PASSWORD1!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without number", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "Password!",
        confirmPassword: "Password!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without special character", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "Password1",
        confirmPassword: "Password1",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 8 characters", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "Pass1!",
        confirmPassword: "Pass1!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-matching passwords", () => {
      const result = registerSchema.safeParse({
        ...validData,
        confirmPassword: "DifferentPassword1!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(true);
      }
    });

    it("should reject when terms not accepted", () => {
      const result = registerSchema.safeParse({ ...validData, acceptTerms: false });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("acceptTerms"))).toBe(true);
      }
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should accept valid email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("should accept valid password reset data", () => {
      const result = resetPasswordSchema.safeParse({
        password: "NewPassword1!",
        confirmPassword: "NewPassword1!",
      });
      expect(result.success).toBe(true);
    });

    it("should reject non-matching passwords", () => {
      const result = resetPasswordSchema.safeParse({
        password: "NewPassword1!",
        confirmPassword: "DifferentPassword1!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject weak password", () => {
      const result = resetPasswordSchema.safeParse({
        password: "weak",
        confirmPassword: "weak",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("twoFactorSchema", () => {
    it("should accept exactly 6 digit code", () => {
      const result = twoFactorSchema.safeParse({ code: "123456" });
      expect(result.success).toBe(true);
    });

    it("should reject code with less than 6 characters", () => {
      const result = twoFactorSchema.safeParse({ code: "12345" });
      expect(result.success).toBe(false);
    });

    it("should reject code with more than 6 characters", () => {
      const result = twoFactorSchema.safeParse({ code: "1234567" });
      expect(result.success).toBe(false);
    });

    it("should accept 6 character alphanumeric code", () => {
      // Note: Schema only validates length, not format
      const result = twoFactorSchema.safeParse({ code: "ABC123" });
      expect(result.success).toBe(true);
    });
  });
});
