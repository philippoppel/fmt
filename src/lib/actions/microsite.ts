"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  micrositeDraftInputSchema,
  competencyInputSchema,
  offeringInputSchema,
  micrositeThemeSchema,
} from "@/lib/validations/microsite";
import { validateAgainstTierLimits } from "@/lib/microsite/tier-limits";
import { validateThemeContrast } from "@/lib/microsite/contrast-checker";
import type { MicrositeConfig, Competency, Offering } from "@/types/microsite";
import type { AccountType } from "@/types/therapist";

// ============================================
// TYPES
// ============================================

interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

// ============================================
// GET MICROSITE DATA
// ============================================

export async function getMicrositeData(): Promise<ActionResult<{
  draft: MicrositeConfig | null;
  published: MicrositeConfig | null;
  status: "draft" | "published";
  lastSavedAt: Date | null;
  publishedAt: Date | null;
  accountType: AccountType;
  slug: string | null;
}>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        micrositeDraft: true,
        micrositePublished: true,
        micrositeStatus: true,
        micrositeLastSavedAt: true,
        micrositePublishedAt: true,
        accountType: true,
        slug: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    return {
      success: true,
      data: {
        draft: profile.micrositeDraft as MicrositeConfig | null,
        published: profile.micrositePublished as MicrositeConfig | null,
        status: profile.micrositeStatus as "draft" | "published",
        lastSavedAt: profile.micrositeLastSavedAt,
        publishedAt: profile.micrositePublishedAt,
        accountType: profile.accountType,
        slug: profile.slug,
      },
    };
  } catch (error) {
    console.error("Error getting microsite data:", error);
    return { success: false, error: "Fehler beim Laden der Microsite-Daten" };
  }
}

// ============================================
// SAVE DRAFT
// ============================================

export async function saveMicrositeDraft(
  data: unknown
): Promise<ActionResult<{ savedAt: Date }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    // Validate input
    const parseResult = micrositeDraftInputSchema.safeParse(data);
    if (!parseResult.success) {
      return { success: false, error: "Ungültige Eingabedaten" };
    }

    const validatedData = parseResult.data;

    // Get profile for tier validation
    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        accountType: true,
        micrositeDraft: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    // Validate against tier limits
    const tierValidation = validateAgainstTierLimits(profile.accountType, {
      competenciesCount: validatedData.competencies?.length,
      offeringsCount: validatedData.offerings?.length,
      hasLogo: !!validatedData.hero?.logoUrl,
      hasHeroImage: !!validatedData.hero?.coverImageUrl,
      hasCustomColors: !!validatedData.theme?.colors,
      hasEffects: validatedData.theme?.effects?.textGlow || validatedData.theme?.effects?.parallax,
      hasSectionReorder: !!validatedData.sectionOrder,
    });

    if (!tierValidation.valid) {
      return {
        success: false,
        error: tierValidation.errors.map(e => e.message).join(", ")
      };
    }

    // Validate theme contrast if colors provided
    if (validatedData.theme?.colors) {
      const themeParseResult = micrositeThemeSchema.shape.colors.safeParse(validatedData.theme.colors);
      if (themeParseResult.success) {
        const contrastValidation = validateThemeContrast(themeParseResult.data);
        if (!contrastValidation.isValid) {
          return {
            success: false,
            error: `Farbkontrast-Problem: ${contrastValidation.errors.join(", ")}`,
          };
        }
      }
    }

    // Merge with existing draft
    const existingDraft = profile.micrositeDraft as MicrositeConfig | null;
    const mergedDraft = mergeDraftData(existingDraft, validatedData);

    const now = new Date();

    // Update database
    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        micrositeDraft: mergedDraft as object,
        micrositeLastSavedAt: now,
      },
    });

    return {
      success: true,
      data: { savedAt: now },
    };
  } catch (error) {
    console.error("Error saving microsite draft:", error);
    return { success: false, error: "Fehler beim Speichern" };
  }
}

// ============================================
// PUBLISH MICROSITE
// ============================================

export async function publishMicrosite(): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        slug: true,
        micrositeDraft: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    if (!profile.micrositeDraft) {
      return { success: false, error: "Kein Draft zum Veröffentlichen vorhanden" };
    }

    const now = new Date();

    // Copy draft to published
    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        micrositePublished: profile.micrositeDraft as object,
        micrositeStatus: "published",
        micrositePublishedAt: now,
      },
    });

    // Revalidate the public page
    if (profile.slug) {
      revalidatePath(`/p/${profile.slug}`);
      revalidatePath(`/de/p/${profile.slug}`);
      revalidatePath(`/en/p/${profile.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error publishing microsite:", error);
    return { success: false, error: "Fehler beim Veröffentlichen" };
  }
}

// ============================================
// UNPUBLISH MICROSITE
// ============================================

export async function unpublishMicrosite(): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, slug: true },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        micrositeStatus: "draft",
      },
    });

    // Revalidate the public page
    if (profile.slug) {
      revalidatePath(`/p/${profile.slug}`);
      revalidatePath(`/de/p/${profile.slug}`);
      revalidatePath(`/en/p/${profile.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error unpublishing microsite:", error);
    return { success: false, error: "Fehler beim Zurücksetzen auf Draft" };
  }
}

// ============================================
// COMPETENCY CRUD
// ============================================

export async function upsertCompetency(
  data: unknown
): Promise<ActionResult<{ competency: Competency }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const parseResult = competencyInputSchema.safeParse(data);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message || "Ungültige Eingabe" };
    }

    const input = parseResult.data;

    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        accountType: true,
        micrositeDraft: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    const draft = profile.micrositeDraft as MicrositeConfig | null;
    const competencies = draft?.competencies || [];

    // Check if updating existing or creating new
    const existingIndex = input.id
      ? competencies.findIndex((c) => c.id === input.id)
      : -1;

    if (existingIndex === -1) {
      // Creating new - check tier limit
      const tierValidation = validateAgainstTierLimits(profile.accountType, {
        competenciesCount: competencies.length + 1,
      });

      if (!tierValidation.valid) {
        return { success: false, error: tierValidation.errors[0]?.message };
      }
    }

    const competency: Competency = {
      id: input.id || `comp_${Date.now()}`,
      icon: input.icon ?? null,
      title: input.title,
      description: input.description || "",
      order: existingIndex >= 0 ? competencies[existingIndex].order : competencies.length,
      visible: input.visible ?? true,
    };

    let updatedCompetencies: Competency[];
    if (existingIndex >= 0) {
      updatedCompetencies = [...competencies];
      updatedCompetencies[existingIndex] = competency;
    } else {
      updatedCompetencies = [...competencies, competency];
    }

    const updatedDraft = {
      ...draft,
      competencies: updatedCompetencies,
    };

    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        micrositeDraft: updatedDraft as object,
        micrositeLastSavedAt: new Date(),
      },
    });

    return {
      success: true,
      data: { competency },
    };
  } catch (error) {
    console.error("Error upserting competency:", error);
    return { success: false, error: "Fehler beim Speichern der Kompetenz" };
  }
}

export async function deleteCompetency(id: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, micrositeDraft: true },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    const draft = profile.micrositeDraft as MicrositeConfig | null;
    const competencies = draft?.competencies || [];

    const updatedCompetencies = competencies
      .filter((c) => c.id !== id)
      .map((c, index) => ({ ...c, order: index }));

    const updatedDraft = {
      ...draft,
      competencies: updatedCompetencies,
    };

    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        micrositeDraft: updatedDraft as object,
        micrositeLastSavedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting competency:", error);
    return { success: false, error: "Fehler beim Löschen der Kompetenz" };
  }
}

export async function reorderCompetencies(ids: string[]): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, micrositeDraft: true },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    const draft = profile.micrositeDraft as MicrositeConfig | null;
    const competencies = draft?.competencies || [];

    // Create a map for quick lookup
    const competencyMap = new Map(competencies.map((c) => [c.id, c]));

    // Reorder based on provided ids
    const reorderedCompetencies = ids
      .map((id, index) => {
        const competency = competencyMap.get(id);
        if (competency) {
          return { ...competency, order: index };
        }
        return null;
      })
      .filter((c): c is Competency => c !== null);

    const updatedDraft = {
      ...draft,
      competencies: reorderedCompetencies,
    };

    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        micrositeDraft: updatedDraft as object,
        micrositeLastSavedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error reordering competencies:", error);
    return { success: false, error: "Fehler beim Neuordnen der Kompetenzen" };
  }
}

// ============================================
// OFFERING CRUD
// ============================================

export async function upsertOffering(
  data: unknown
): Promise<ActionResult<{ offering: Offering }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const parseResult = offeringInputSchema.safeParse(data);
    if (!parseResult.success) {
      return { success: false, error: parseResult.error.issues[0]?.message || "Ungültige Eingabe" };
    }

    const input = parseResult.data;

    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        accountType: true,
        micrositeDraft: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    const draft = profile.micrositeDraft as MicrositeConfig | null;
    const offerings = draft?.offerings || [];

    const existingIndex = input.id
      ? offerings.findIndex((o) => o.id === input.id)
      : -1;

    if (existingIndex === -1) {
      const tierValidation = validateAgainstTierLimits(profile.accountType, {
        offeringsCount: offerings.length + 1,
      });

      if (!tierValidation.valid) {
        return { success: false, error: tierValidation.errors[0]?.message };
      }
    }

    const offering: Offering = {
      id: input.id || `offer_${Date.now()}`,
      title: input.title,
      description: input.description || "",
      price: input.price ?? null,
      duration: input.duration ?? null,
      isHighlighted: input.isHighlighted ?? false,
    };

    let updatedOfferings: Offering[];
    if (existingIndex >= 0) {
      updatedOfferings = [...offerings];
      updatedOfferings[existingIndex] = offering;
    } else {
      updatedOfferings = [...offerings, offering];
    }

    const updatedDraft = {
      ...draft,
      offerings: updatedOfferings,
    };

    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        micrositeDraft: updatedDraft as object,
        micrositeLastSavedAt: new Date(),
      },
    });

    return {
      success: true,
      data: { offering },
    };
  } catch (error) {
    console.error("Error upserting offering:", error);
    return { success: false, error: "Fehler beim Speichern des Angebots" };
  }
}

export async function deleteOffering(id: string): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, micrositeDraft: true },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    const draft = profile.micrositeDraft as MicrositeConfig | null;
    const offerings = draft?.offerings || [];

    const updatedOfferings = offerings.filter((o) => o.id !== id);

    const updatedDraft = {
      ...draft,
      offerings: updatedOfferings,
    };

    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        micrositeDraft: updatedDraft as object,
        micrositeLastSavedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting offering:", error);
    return { success: false, error: "Fehler beim Löschen des Angebots" };
  }
}

// ============================================
// SECTION REORDER (Premium)
// ============================================

export async function reorderSections(newOrder: string[]): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        accountType: true,
        micrositeDraft: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    // Check tier - only premium can reorder sections
    const tierValidation = validateAgainstTierLimits(profile.accountType, {
      hasSectionReorder: true,
    });

    if (!tierValidation.valid) {
      return { success: false, error: tierValidation.errors[0]?.message };
    }

    const draft = profile.micrositeDraft as MicrositeConfig | null;

    const updatedDraft = {
      ...draft,
      sectionOrder: newOrder,
    };

    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        micrositeDraft: updatedDraft as object,
        micrositeLastSavedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error reordering sections:", error);
    return { success: false, error: "Fehler beim Neuordnen der Sektionen" };
  }
}

// ============================================
// TOGGLE SECTION VISIBILITY
// ============================================

export async function toggleSectionVisibility(
  sectionId: string,
  visible: boolean
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Nicht authentifiziert" };
    }

    const profile = await db.therapistProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        accountType: true,
        micrositeDraft: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Profil nicht gefunden" };
    }

    // Check tier - mittel and premium can hide sections
    const tierValidation = validateAgainstTierLimits(profile.accountType, {
      hasSectionReorder: !visible, // Using this as proxy for "can modify sections"
    });

    // Only block for gratis tier when trying to hide
    if (!visible && profile.accountType === "gratis") {
      return {
        success: false,
        error: "Sektionen ausblenden erfordert mindestens Mittel-Tier"
      };
    }

    const draft = profile.micrositeDraft as MicrositeConfig | null;
    let hiddenSections = draft?.hiddenSections || [];

    if (visible) {
      hiddenSections = hiddenSections.filter((s) => s !== sectionId);
    } else {
      if (!hiddenSections.includes(sectionId as never)) {
        hiddenSections = [...hiddenSections, sectionId as never];
      }
    }

    const updatedDraft = {
      ...draft,
      hiddenSections,
    };

    await db.therapistProfile.update({
      where: { id: profile.id },
      data: {
        micrositeDraft: updatedDraft as object,
        micrositeLastSavedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error toggling section visibility:", error);
    return { success: false, error: "Fehler beim Ändern der Sichtbarkeit" };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function mergeDraftData(
  existing: MicrositeConfig | null,
  updates: Record<string, unknown>
): MicrositeConfig {
  if (!existing) {
    return updates as MicrositeConfig;
  }

  const merged = { ...existing };

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        typeof (merged as Record<string, unknown>)[key] === "object" &&
        (merged as Record<string, unknown>)[key] !== null
      ) {
        // Deep merge for objects
        (merged as Record<string, unknown>)[key] = {
          ...((merged as Record<string, unknown>)[key] as object),
          ...(value as object),
        };
      } else {
        // Direct assignment for primitives and arrays
        (merged as Record<string, unknown>)[key] = value;
      }
    }
  }

  return merged;
}
