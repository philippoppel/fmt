"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  shortDescription: z.string().max(500).optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  specializations: z.array(z.string()),
  therapyTypes: z.array(z.string()),
  languages: z.array(z.string()),
  insurance: z.array(z.string()),
  pricePerSession: z.number().min(0).max(500),
  sessionType: z.enum(["online", "in_person", "both"]),
  availability: z.enum(["immediately", "this_week", "flexible"]),
  gender: z.enum(["male", "female", "diverse"]).nullable(),
});

export type ProfileData = z.infer<typeof profileSchema>;

export type UpdateProfileResult =
  | { success: true }
  | { success: false; error: string };

export async function updateProfile(data: ProfileData): Promise<UpdateProfileResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const validatedData = profileSchema.safeParse(data);

  if (!validatedData.success) {
    const errors = validatedData.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || "Invalid input";
    return { success: false, error: firstError };
  }

  const { name, ...profileData } = validatedData.data;

  // Update user name
  await db.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  // Update therapist profile
  await db.therapistProfile.update({
    where: { userId: session.user.id },
    data: {
      title: profileData.title || null,
      imageUrl: profileData.imageUrl || null,
      shortDescription: profileData.shortDescription || null,
      city: profileData.city || null,
      postalCode: profileData.postalCode || null,
      specializations: profileData.specializations,
      therapyTypes: profileData.therapyTypes,
      languages: profileData.languages,
      insurance: profileData.insurance,
      pricePerSession: profileData.pricePerSession,
      sessionType: profileData.sessionType,
      availability: profileData.availability,
      gender: profileData.gender,
    },
  });

  revalidatePath("/therapists");
  revalidatePath("/dashboard/settings");

  return { success: true };
}
