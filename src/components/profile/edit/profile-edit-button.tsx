"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { TherapistProfileData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { ProfileEditModal } from "./profile-edit-modal";

interface ProfileEditButtonProps {
  profile: TherapistProfileData;
}

export function ProfileEditButton({ profile }: ProfileEditButtonProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);

  return (
    <>
      {/* Floating Edit Button */}
      <Button
        onClick={() => setEditModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl text-white gap-2"
        style={{ backgroundColor: "var(--profile-primary)" }}
        size="lg"
      >
        <Pencil className="h-4 w-4" />
        Profil bearbeiten
      </Button>

      {/* Edit Modal */}
      <ProfileEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        profile={profile}
      />
    </>
  );
}
