"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Save,
  Loader2,
  User,
  MapPin,
  FileText,
  Image as ImageIcon,
  Palette,
  Star,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
  Plus,
} from "lucide-react";
import type { TherapistProfileData, ThemeName } from "@/types/profile";
import { THEME_PRESETS } from "@/types/profile";
import { SPECIALTIES, THERAPY_TYPES, LANGUAGES, INSURANCE_TYPES, SESSION_TYPES, AVAILABILITY_OPTIONS, GENDER_OPTIONS } from "@/types/therapist";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateTherapistProfile } from "@/lib/actions/profile-update";

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: TherapistProfileData;
}

export function ProfileEditModal({ open, onOpenChange, profile }: ProfileEditModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state - organized by section
  const [formData, setFormData] = useState({
    // Basic Info
    title: profile.title,
    headline: profile.headline,
    shortDescription: profile.shortDescription,
    longDescription: profile.longDescription,

    // Location
    city: profile.city,
    postalCode: profile.postalCode,
    street: profile.street,
    practiceName: profile.practiceName,

    // Images
    imageUrl: profile.imageUrl,
    galleryImages: profile.galleryImages,
    officeImages: profile.officeImages,

    // Specializations (cast to string[] for form handling)
    specializations: profile.specializations as string[],
    specializationRanks: profile.specializationRanks,
    therapyTypes: profile.therapyTypes as string[],

    // Professional
    education: profile.education,
    certifications: profile.certifications,
    memberships: profile.memberships,
    experienceYears: profile.experienceYears,

    // Contact
    phone: profile.phone,
    email: profile.email,
    website: profile.website,
    linkedIn: profile.linkedIn,
    instagram: profile.instagram,

    // Settings (cast to string[] for form handling)
    languages: profile.languages as string[],
    insurance: profile.insurance as string[],
    pricePerSession: profile.pricePerSession,
    sessionType: profile.sessionType,
    availability: profile.availability,
    gender: profile.gender,

    // Theme
    themeColor: profile.themeColor,
    themeName: profile.themeName,

    // Additional
    consultationInfo: profile.consultationInfo,
    offersTrialSession: profile.offersTrialSession,
    trialSessionPrice: profile.trialSessionPrice,
  });

  // Collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    images: false,
    specializations: false,
    qualifications: false,
    contact: false,
    settings: false,
    theme: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: "specializations" | "therapyTypes" | "languages" | "insurance", value: string) => {
    setFormData((prev) => {
      const current = prev[key] as string[];
      if (current.includes(value)) {
        // Also remove from ranks if it's a specialization
        if (key === "specializations") {
          const newRanks = { ...prev.specializationRanks };
          delete newRanks[value];
          return {
            ...prev,
            [key]: current.filter((v) => v !== value),
            specializationRanks: newRanks,
          };
        }
        return { ...prev, [key]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const updateSpecializationRank = (specialty: string, rank: number | null) => {
    setFormData((prev) => {
      const newRanks = { ...prev.specializationRanks };
      if (rank === null) {
        delete newRanks[specialty];
      } else {
        newRanks[specialty] = rank;
      }
      return { ...prev, specializationRanks: newRanks };
    });
  };

  const addListItem = (key: "education" | "certifications" | "memberships" | "galleryImages" | "officeImages") => {
    setFormData((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ""],
    }));
  };

  const updateListItem = (key: "education" | "certifications" | "memberships" | "galleryImages" | "officeImages", index: number, value: string) => {
    setFormData((prev) => {
      const newList = [...(prev[key] || [])];
      newList[index] = value;
      return { ...prev, [key]: newList };
    });
  };

  const removeListItem = (key: "education" | "certifications" | "memberships" | "galleryImages" | "officeImages", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const result = await updateTherapistProfile(formData);

        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            onOpenChange(false);
            router.refresh();
          }, 1500);
        } else {
          setError(result.error || "Ein Fehler ist aufgetreten");
        }
      } catch {
        setError("Ein Fehler ist aufgetreten");
      }
    });
  };

  // Section header component
  const SectionHeader = ({ id, icon, title }: { id: string; icon: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="flex items-center justify-between w-full py-3 border-b hover:bg-gray-50 px-2 -mx-2"
    >
      <div className="flex items-center gap-2 font-medium">
        {icon}
        {title}
      </div>
      {openSections[id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
  );

  // Specialty translations
  const specialtyLabels: Record<string, string> = {
    depression: "Depression",
    anxiety: "Angststörungen",
    trauma: "Trauma & PTBS",
    relationships: "Beziehungen",
    addiction: "Sucht",
    eating_disorders: "Essstörungen",
    adhd: "ADHS",
    burnout: "Burnout",
  };

  const therapyTypeLabels: Record<string, string> = {
    cbt: "Kognitive Verhaltenstherapie",
    psychoanalysis: "Psychoanalyse",
    systemic: "Systemische Therapie",
    gestalt: "Gestalttherapie",
    humanistic: "Humanistische Therapie",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-white z-10 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Profil bearbeiten</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-4 space-y-2">
            {/* Error/Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
                Änderungen gespeichert!
              </div>
            )}

            {/* Basic Info Section */}
            <SectionHeader id="basicInfo" icon={<User className="h-4 w-4" />} title="Grundinformationen" />
            {openSections.basicInfo && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Berufstitel</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="z.B. Psychologische Psychotherapeutin"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Headline (Slogan)</Label>
                  <Input
                    value={formData.headline}
                    onChange={(e) => updateField("headline", e.target.value)}
                    placeholder="z.B. Ihre einfühlsame Begleitung auf dem Weg zu mehr Lebensfreude"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kurzbeschreibung</Label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => updateField("shortDescription", e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                    placeholder="Kurze Vorstellung für die Übersicht"
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-500">{(formData.shortDescription || "").length}/300</p>
                </div>
                <div className="space-y-2">
                  <Label>Ausführliche Beschreibung (Über mich)</Label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => updateField("longDescription", e.target.value)}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[150px]"
                    placeholder="Erzählen Sie mehr über sich, Ihren Werdegang und Ihren Therapieansatz..."
                  />
                </div>
              </div>
            )}

            {/* Images Section */}
            <SectionHeader id="images" icon={<ImageIcon className="h-4 w-4" />} title="Bilder" />
            {openSections.images && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Profilbild URL</Label>
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => updateField("imageUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Persönliche Galerie</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addListItem("galleryImages")}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Bild hinzufügen
                    </Button>
                  </div>
                  {formData.galleryImages.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="url"
                        value={url}
                        onChange={(e) => updateListItem("galleryImages", index, e.target.value)}
                        placeholder="Bild-URL..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeListItem("galleryImages", index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Praxis-Bilder</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addListItem("officeImages")}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Bild hinzufügen
                    </Button>
                  </div>
                  {formData.officeImages.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="url"
                        value={url}
                        onChange={(e) => updateListItem("officeImages", index, e.target.value)}
                        placeholder="Bild-URL..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeListItem("officeImages", index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specializations Section */}
            <SectionHeader id="specializations" icon={<Star className="h-4 w-4" />} title="Schwerpunkte & Verfahren" />
            {openSections.specializations && (
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label>Schwerpunkte (mit Priorität)</Label>
                  <p className="text-xs text-gray-500">Wählen Sie Ihre Schwerpunkte und setzen Sie Prioritäten (1 = Hauptschwerpunkt)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {SPECIALTIES.map((specialty) => {
                      const isSelected = formData.specializations.includes(specialty);
                      const rank = formData.specializationRanks[specialty];

                      return (
                        <div
                          key={specialty}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            isSelected ? "border-primary bg-primary/5" : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleArrayValue("specializations", specialty)}
                              />
                              <span className="text-sm">{specialtyLabels[specialty] || specialty}</span>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1">
                                <GripVertical className="h-4 w-4 text-gray-400" />
                                <select
                                  value={rank || ""}
                                  onChange={(e) =>
                                    updateSpecializationRank(
                                      specialty,
                                      e.target.value ? parseInt(e.target.value) : null
                                    )
                                  }
                                  className="text-xs border rounded px-2 py-1"
                                >
                                  <option value="">Prio</option>
                                  <option value="1">1</option>
                                  <option value="2">2</option>
                                  <option value="3">3</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Therapieverfahren</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {THERAPY_TYPES.map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.therapyTypes.includes(type)}
                          onCheckedChange={() => toggleArrayValue("therapyTypes", type)}
                        />
                        <span className="text-sm">{therapyTypeLabels[type] || type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Qualifications Section */}
            <SectionHeader id="qualifications" icon={<FileText className="h-4 w-4" />} title="Qualifikationen" />
            {openSections.qualifications && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Berufserfahrung (Jahre)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.experienceYears || ""}
                    onChange={(e) => updateField("experienceYears", parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Ausbildung</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addListItem("education")}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Hinzufügen
                    </Button>
                  </div>
                  {formData.education.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateListItem("education", index, e.target.value)}
                        placeholder="z.B. Studium der Psychologie, Universität Berlin"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeListItem("education", index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Zertifizierungen</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addListItem("certifications")}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Hinzufügen
                    </Button>
                  </div>
                  {formData.certifications.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateListItem("certifications", index, e.target.value)}
                        placeholder="z.B. EMDR-Therapeut (EMDRIA)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeListItem("certifications", index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Mitgliedschaften</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addListItem("memberships")}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Hinzufügen
                    </Button>
                  </div>
                  {formData.memberships.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateListItem("memberships", index, e.target.value)}
                        placeholder="z.B. Deutsche Gesellschaft für Psychologie (DGPs)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeListItem("memberships", index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Section */}
            <SectionHeader id="contact" icon={<Phone className="h-4 w-4" />} title="Kontakt & Standort" />
            {openSections.contact && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stadt</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="z.B. Berlin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PLZ</Label>
                    <Input
                      value={formData.postalCode}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      placeholder="z.B. 10115"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Straße & Hausnummer</Label>
                  <Input
                    value={formData.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    placeholder="z.B. Musterstraße 123"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Praxisname (optional)</Label>
                  <Input
                    value={formData.practiceName}
                    onChange={(e) => updateField("practiceName", e.target.value)}
                    placeholder="z.B. Praxis für Psychotherapie"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="z.B. +49 30 123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-Mail (öffentlich)</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="kontakt@praxis.de"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>LinkedIn</Label>
                    <Input
                      type="url"
                      value={formData.linkedIn}
                      onChange={(e) => updateField("linkedIn", e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input
                      type="url"
                      value={formData.instagram}
                      onChange={(e) => updateField("instagram", e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Settings Section */}
            <SectionHeader id="settings" icon={<Clock className="h-4 w-4" />} title="Verfügbarkeit & Preise" />
            {openSections.settings && (
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label>Preis pro Sitzung: {formData.pricePerSession} €</Label>
                  <Slider
                    value={[formData.pricePerSession]}
                    onValueChange={(val) => updateField("pricePerSession", val[0])}
                    max={300}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Sitzungsart</Label>
                  <RadioGroup
                    value={formData.sessionType}
                    onValueChange={(val) => updateField("sessionType", val as typeof formData.sessionType)}
                    className="flex flex-wrap gap-4"
                  >
                    {SESSION_TYPES.map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <RadioGroupItem value={type} />
                        <span className="text-sm">{type === "online" ? "Online" : type === "in_person" ? "Vor Ort" : "Beides"}</span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Verfügbarkeit</Label>
                  <RadioGroup
                    value={formData.availability}
                    onValueChange={(val) => updateField("availability", val as typeof formData.availability)}
                    className="flex flex-wrap gap-4"
                  >
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <div key={opt} className="flex items-center gap-2">
                        <RadioGroupItem value={opt} />
                        <span className="text-sm">
                          {opt === "immediately" ? "Sofort" : opt === "this_week" ? "Diese Woche" : "Flexibel"}
                        </span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Sprachen</Label>
                  <div className="flex flex-wrap gap-4">
                    {LANGUAGES.map((lang) => (
                      <div key={lang} className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.languages.includes(lang)}
                          onCheckedChange={() => toggleArrayValue("languages", lang)}
                        />
                        <span className="text-sm">
                          {lang === "de" ? "Deutsch" : lang === "en" ? "Englisch" : lang === "tr" ? "Türkisch" : "Arabisch"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Abrechnung</Label>
                  <div className="flex flex-wrap gap-4">
                    {INSURANCE_TYPES.map((ins) => (
                      <div key={ins} className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.insurance.includes(ins)}
                          onCheckedChange={() => toggleArrayValue("insurance", ins)}
                        />
                        <span className="text-sm">
                          {ins === "public" ? "Gesetzlich" : "Privat"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Geschlecht</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(val) => updateField("gender", val as typeof formData.gender)}
                    className="flex flex-wrap gap-4"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <div key={g} className="flex items-center gap-2">
                        <RadioGroupItem value={g} />
                        <span className="text-sm">
                          {g === "male" ? "Männlich" : g === "female" ? "Weiblich" : "Divers"}
                        </span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <Checkbox
                    checked={formData.offersTrialSession}
                    onCheckedChange={(checked) => updateField("offersTrialSession", !!checked)}
                  />
                  <Label className="cursor-pointer">Kostenloses/günstiges Erstgespräch anbieten</Label>
                </div>
                {formData.offersTrialSession && (
                  <div className="space-y-2 ml-6">
                    <Label>Preis Erstgespräch (0 = kostenlos)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.trialSessionPrice}
                      onChange={(e) => updateField("trialSessionPrice", parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Theme Section */}
            <SectionHeader id="theme" icon={<Palette className="h-4 w-4" />} title="Design & Farben" />
            {openSections.theme && (
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <Label>Farbschema</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(Object.keys(THEME_PRESETS) as ThemeName[]).map((themeName) => {
                      const preset = THEME_PRESETS[themeName];
                      const isSelected = formData.themeName === themeName;

                      return (
                        <button
                          key={themeName}
                          type="button"
                          onClick={() => {
                            updateField("themeName", themeName);
                            updateField("themeColor", preset.primaryColor);
                          }}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex gap-1 mb-2">
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: preset.primaryColor }}
                            />
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: preset.secondaryColor }}
                            />
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: preset.accentColor }}
                            />
                          </div>
                          <span className="text-sm font-medium">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Eigene Akzentfarbe (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.themeColor}
                      onChange={(e) => updateField("themeColor", e.target.value)}
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={formData.themeColor}
                      onChange={(e) => updateField("themeColor", e.target.value)}
                      placeholder="#8B7355"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="space-y-4 py-4 border-t mt-4">
              <div className="space-y-2">
                <Label>Info zum Erstgespräch</Label>
                <textarea
                  value={formData.consultationInfo}
                  onChange={(e) => updateField("consultationInfo", e.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                  placeholder="Was erwartet Patienten im ersten Gespräch..."
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-white flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Änderungen speichern
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
