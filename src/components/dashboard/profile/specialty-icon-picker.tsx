"use client";

import { useState } from "react";
import {
  Brain, Heart, Users, Flame, Pill, Utensils, Zap, Battery,
  Frown, AlertTriangle, Target, Lightbulb, Moon, Gauge,
  Baby, UserRound, Sparkles, HeartHandshake, Home, Scale,
  Briefcase, Fingerprint, Rainbow, Globe, BedDouble, Activity,
  PersonStanding, GraduationCap, Puzzle, Shield, Smile, Sun,
  Cloud, TreePine, Leaf, Star, Coffee, Book, Music, Palette,
  Camera, Compass, Anchor, Feather, Wind, Droplets, Mountain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Available icons for selection
export const AVAILABLE_ICONS = {
  // Mental Health
  Brain: Brain,
  Zap: Zap,
  Heart: Heart,
  Battery: Battery,
  Target: Target,
  AlertTriangle: AlertTriangle,
  Gauge: Gauge,
  Lightbulb: Lightbulb,
  // Relationships
  HeartHandshake: HeartHandshake,
  Home: Home,
  Scale: Scale,
  Baby: Baby,
  Users: Users,
  // Life
  Frown: Frown,
  Briefcase: Briefcase,
  Fingerprint: Fingerprint,
  Rainbow: Rainbow,
  Globe: Globe,
  // Behavioral
  Utensils: Utensils,
  Pill: Pill,
  BedDouble: BedDouble,
  Activity: Activity,
  Sparkles: Sparkles,
  // Special Groups
  GraduationCap: GraduationCap,
  PersonStanding: PersonStanding,
  Flame: Flame,
  Puzzle: Puzzle,
  UserRound: UserRound,
  // Additional
  Shield: Shield,
  Smile: Smile,
  Sun: Sun,
  Moon: Moon,
  Cloud: Cloud,
  TreePine: TreePine,
  Leaf: Leaf,
  Star: Star,
  Coffee: Coffee,
  Book: Book,
  Music: Music,
  Palette: Palette,
  Camera: Camera,
  Compass: Compass,
  Anchor: Anchor,
  Feather: Feather,
  Wind: Wind,
  Droplets: Droplets,
  Mountain: Mountain,
} as const;

export type IconName = keyof typeof AVAILABLE_ICONS;

// Default icons for each specialty
export const DEFAULT_SPECIALTY_ICONS: Record<string, IconName> = {
  depression: "Brain",
  anxiety: "Zap",
  trauma: "Heart",
  burnout: "Battery",
  ocd: "Target",
  phobias: "AlertTriangle",
  panic: "Gauge",
  bipolar: "Lightbulb",
  couples: "HeartHandshake",
  family: "Home",
  divorce: "Scale",
  parenting: "Baby",
  grief: "Frown",
  career: "Briefcase",
  identity: "Fingerprint",
  lgbtq: "Rainbow",
  migration: "Globe",
  eating_disorders: "Utensils",
  addiction: "Pill",
  sleep: "BedDouble",
  stress: "Activity",
  psychosomatic: "Sparkles",
  children: "GraduationCap",
  elderly: "PersonStanding",
  adhd: "Flame",
  autism: "Puzzle",
  relationships: "Users",
};

interface SpecialtyIconPickerProps {
  specialty: string;
  selectedIcon: IconName;
  onIconChange: (icon: IconName) => void;
  disabled?: boolean;
}

export function SpecialtyIconPicker({
  specialty,
  selectedIcon,
  onIconChange,
  disabled = false,
}: SpecialtyIconPickerProps) {
  const [open, setOpen] = useState(false);
  const SelectedIconComponent = AVAILABLE_ICONS[selectedIcon];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Icon ändern"
        >
          <SelectedIconComponent className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(AVAILABLE_ICONS).map(([name, IconComponent]) => (
            <Button
              key={name}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                selectedIcon === name && "bg-primary/10 ring-1 ring-primary"
              )}
              onClick={() => {
                onIconChange(name as IconName);
                setOpen(false);
              }}
            >
              <IconComponent className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper to get icon component by name
export function getIconComponent(iconName: IconName) {
  return AVAILABLE_ICONS[iconName] || Brain;
}
