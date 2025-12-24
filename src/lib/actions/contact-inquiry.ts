"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getOrCreateMatchingSession } from "./tracking";

/**
 * Contact Inquiry Server Action
 * Submits a contact inquiry from the matching wizard to a therapist
 * Supports optional intensity data with GDPR consent
 */

const contactInquirySchema = z.object({
  therapistId: z.string().min(1, "Therapist ID is required"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message too long"),
  selectedTopics: z.array(z.string()),
  selectedSubTopics: z.array(z.string()),
  matchScore: z.number().optional(),
  intensity: z
    .object({
      level: z.enum(["low", "medium", "high"]).nullable(),
      description: z.string().optional(),
    })
    .optional(),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;

export async function submitContactInquiry(
  input: ContactInquiryInput
): Promise<{ success: boolean; inquiryId?: string; error?: string }> {
  try {
    // Validate input
    const validated = contactInquirySchema.parse(input);

    // Verify therapist exists
    const therapist = await db.therapistProfile.findUnique({
      where: { id: validated.therapistId },
      select: { id: true, contactCount: true },
    });

    if (!therapist) {
      return { success: false, error: "Therapist not found" };
    }

    // Create contact inquiry
    const inquiry = await db.contactInquiry.create({
      data: {
        therapistId: validated.therapistId,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        message: validated.message,
        selectedTopics: validated.selectedTopics,
        selectedSubTopics: validated.selectedSubTopics,
        matchScore: validated.matchScore ?? null,
        // Only include intensity if explicitly provided (GDPR consent required on frontend)
        intensityLevel: validated.intensity?.level ?? null,
        intensityDescription: validated.intensity?.description ?? null,
        intensityConsent: !!validated.intensity,
      },
    });

    // Update therapist contact count for analytics
    await db.therapistProfile.update({
      where: { id: validated.therapistId },
      data: { contactCount: { increment: 1 } },
    });

    // Track interaction for ML analytics
    const sessionId = await getOrCreateMatchingSession();
    await db.matchInteraction.create({
      data: {
        sessionId,
        therapistId: validated.therapistId,
        action: "contact",
        matchScore: validated.matchScore ?? null,
        searchCriteria: {
          topics: validated.selectedTopics,
          subTopics: validated.selectedSubTopics,
        },
      },
    });

    return { success: true, inquiryId: inquiry.id };
  } catch (error) {
    console.error("Failed to submit contact inquiry:", error);

    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return {
        success: false,
        error: firstIssue?.message || "Validation failed",
      };
    }

    return { success: false, error: "Failed to send message. Please try again." };
  }
}

/**
 * Get contact inquiries for a therapist (for therapist dashboard)
 */
export async function getContactInquiries(therapistId: string): Promise<{
  success: boolean;
  inquiries?: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    selectedTopics: string[];
    status: string;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    const inquiries = await db.contactInquiry.findMany({
      where: { therapistId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        message: true,
        selectedTopics: true,
        status: true,
        createdAt: true,
      },
    });

    return { success: true, inquiries };
  } catch (error) {
    console.error("Failed to get contact inquiries:", error);
    return { success: false, error: "Failed to load inquiries" };
  }
}

/**
 * Update inquiry status (for therapist dashboard)
 */
export async function updateInquiryStatus(
  inquiryId: string,
  status: "new" | "read" | "replied" | "archived"
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.contactInquiry.update({
      where: { id: inquiryId },
      data: { status },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update inquiry status:", error);
    return { success: false, error: "Failed to update status" };
  }
}
