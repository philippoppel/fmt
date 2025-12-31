/**
 * Wizard Categories V2 - Based on kategorien.docx
 *
 * Complete taxonomy for the therapy matching wizard MVP.
 * All categories, subcategories, and symptom questions are sourced
 * exclusively from kategorien.docx.
 */

import type { Specialty } from "@/types/therapist";

// Severity levels for Likert scale (0-3)
export type SeverityLevel = 0 | 1 | 2 | 3;

// Symptom question structure
export interface SymptomQuestion {
  id: string;
  textDE: string;
  order: 1 | 2 | 3 | 4; // Q1 always asked, Q2/Q3 conditional, Q4 always asked
}

// Subcategory (Unterkategorie)
export interface WizardSubcategory {
  id: string;
  labelDE: string;
  parentCategoryId: string;
  symptomQuestions: SymptomQuestion[];
}

// Main category (Oberkategorie)
export interface WizardCategory {
  id: string;
  labelDE: string;
  iconName: string; // Lucide icon name (fallback)
  imageUrl: string; // Unsplash image URL
  isCrisis?: boolean;
  subcategories: WizardSubcategory[];
  mappedSpecialties: Specialty[];
}

// ============================================================================
// WIZARD CATEGORIES - Complete taxonomy from kategorien.docx
// ============================================================================

export const WIZARD_CATEGORIES: WizardCategory[] = [
  // -------------------------------------------------------------------------
  // 1. Familie & Beziehung
  // -------------------------------------------------------------------------
  {
    id: "family_relationships",
    labelDE: "Familie & Beziehung",
    iconName: "Users",
    imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop",
    mappedSpecialties: ["family", "couples"],
    subcategories: [
      {
        id: "child",
        labelDE: "Kind",
        parentCategoryId: "family_relationships",
        symptomQuestions: [
          { id: "fam_child_q1", textDE: "Hat sich deine Beziehung zu deinem Kind in der letzten Zeit negativ verändert?", order: 1 },
          { id: "fam_child_q2", textDE: "Hast du das Gefühl aktuell schwer oder gar keinen Zugang zu deinem Kind zu finden?", order: 2 },
          { id: "fam_child_q3", textDE: "Hast du das Gefühl, dass dein Kind aggressiv auf dich oder Angehörige reagiert?", order: 3 },
          { id: "fam_child_q4", textDE: "Hast du das Gefühl, dass dein Kind ängstlich/zurückgezogen oder schnell emotional (auch aggressiv) reagiert?", order: 4 },
        ],
      },
      {
        id: "relationship",
        labelDE: "Beziehung",
        parentCategoryId: "family_relationships",
        symptomQuestions: [
          { id: "fam_rel_q1", textDE: "Hast du das Gefühl nicht ausreichend gesehen und wertgeschätzt zu werden?", order: 1 },
          { id: "fam_rel_q2", textDE: "Fühlst du dich emotional missbraucht, vernachlässigt oder abgewertet?", order: 2 },
          { id: "fam_rel_q3", textDE: "Fühlst du dich aktuell von deinem Partner/in nicht verstanden? Nicht geliebt?", order: 3 },
          { id: "fam_rel_q4", textDE: "Hast du das Gefühl aktuell von deinem Partner/in manipuliert zu werden?", order: 4 },
        ],
      },
      {
        id: "parents",
        labelDE: "Eltern",
        parentCategoryId: "family_relationships",
        symptomQuestions: [
          { id: "fam_par_q1", textDE: "Hast du das Gefühl von deinen Eltern nicht ausreichend gesehen und wertgeschätzt zu werden?", order: 1 },
          { id: "fam_par_q2", textDE: "Fühlst du dich emotional von deinen Eltern missbraucht, vernachlässigt oder abgewertet?", order: 2 },
          { id: "fam_par_q3", textDE: "Fühlst du dich aktuell von deinen Eltern nicht verstanden? Nicht geliebt?", order: 3 },
          { id: "fam_par_q4", textDE: "Hast du das Gefühl aktuell von deinen Eltern manipuliert zu werden?", order: 4 },
        ],
      },
      {
        id: "siblings",
        labelDE: "Geschwister",
        parentCategoryId: "family_relationships",
        symptomQuestions: [
          { id: "fam_sib_q1", textDE: "Hast du das Gefühl keinen Zugang zu deinen Geschwistern zu finden?", order: 1 },
          { id: "fam_sib_q2", textDE: "Sind ständiger Machtkampf, Missgunst oder Lästerei Teil eurer Geschwisterbeziehung?", order: 2 },
          { id: "fam_sib_q3", textDE: "Machst du dir Sorgen um deine Geschwister bzw. der Distanz zwischen euch?", order: 3 },
          { id: "fam_sib_q4", textDE: "Erlebst du ständige Konflikte im Miteinander?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. Arbeit & Beruf
  // -------------------------------------------------------------------------
  {
    id: "work_career",
    labelDE: "Arbeit & Beruf",
    iconName: "Briefcase",
    imageUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop",
    mappedSpecialties: ["burnout", "career"],
    subcategories: [
      {
        id: "stress_overwhelm",
        labelDE: "Stress und Überforderung",
        parentCategoryId: "work_career",
        symptomQuestions: [
          { id: "work_stress_q1", textDE: "Fühlst du dich überfordert in deiner Arbeit?", order: 1 },
          { id: "work_stress_q2", textDE: "Hast du Probleme mit der Motivation und Konzentration?", order: 2 },
          { id: "work_stress_q3", textDE: "Fehlt dir die Energie? Kämpfst du mit Erschöpfung?", order: 3 },
          { id: "work_stress_q4", textDE: "Kannst du berufliches und privates nur mehr schwer trennen?", order: 4 },
        ],
      },
      {
        id: "workload_pressure",
        labelDE: "Arbeitsbelastung und Druck",
        parentCategoryId: "work_career",
        symptomQuestions: [
          { id: "work_load_q1", textDE: "Hast du Schwierigkeiten Aufgaben termingerecht zu erledigen?", order: 1 },
          { id: "work_load_q2", textDE: "Ist dir gefühlt die allgemeine Belastung in der Arbeit zu hoch?", order: 2 },
          { id: "work_load_q3", textDE: "Fehlen dir die Rückzugsmöglichkeiten am Arbeitsplatz?", order: 3 },
          { id: "work_load_q4", textDE: "Bist du dir unsicher in der Kommunikation mit deinen Vorgesetzten oder KollegInnen?", order: 4 },
        ],
      },
      {
        id: "interpersonal_work",
        labelDE: "Zwischenmenschliche Probleme",
        parentCategoryId: "work_career",
        symptomQuestions: [
          { id: "work_inter_q1", textDE: "Fühlst du dich von deinem Vorgesetzten oder KollegInnen missverstanden?", order: 1 },
          { id: "work_inter_q2", textDE: "Hast du Angst Dinge direkt anzusprechen?", order: 2 },
          { id: "work_inter_q3", textDE: "Hast du das Gefühl ausgegrenzt zu werden?", order: 3 },
          { id: "work_inter_q4", textDE: "Fehlen dir Hilfsangebote oder Rücksicht von deinen KollegInnen?", order: 4 },
        ],
      },
      {
        id: "career_discrimination",
        labelDE: "Karriere und Diskriminierung",
        parentCategoryId: "work_career",
        symptomQuestions: [
          { id: "work_career_q1", textDE: "Fehlen dir Weiterentwicklungsmöglichkeiten in deiner Position?", order: 1 },
          { id: "work_career_q2", textDE: "Hast du Sorgen um eine langfristige Perspektive in deiner Arbeit?", order: 2 },
          { id: "work_career_q3", textDE: "Fühlst du dich ausgeschlossen und diskriminiert?", order: 3 },
          { id: "work_career_q4", textDE: "Hast du Sorge vor Vorurteilen und negativen Folgen?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 3. Selbstwert & Persönlichkeit
  // -------------------------------------------------------------------------
  {
    id: "selfworth_personality",
    labelDE: "Selbstwert & Persönlichkeit",
    iconName: "Heart",
    imageUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop",
    mappedSpecialties: ["identity"],
    subcategories: [
      {
        id: "selfworth",
        labelDE: "Selbstwert",
        parentCategoryId: "selfworth_personality",
        symptomQuestions: [
          { id: "self_worth_q1", textDE: "Hast du das Gefühl dass du von anderen geschätzt wirst?", order: 1 },
          { id: "self_worth_q2", textDE: "Hast du Angst negativ beurteilt zu werden?", order: 2 },
          { id: "self_worth_q3", textDE: "Fühlst du dich oft unter Druck alles perfekt machen zu müssen?", order: 3 },
          { id: "self_worth_q4", textDE: "Beeinflusst dich die Meinung anderer stark?", order: 4 },
        ],
      },
      {
        id: "selfconfidence",
        labelDE: "Selbstvertrauen",
        parentCategoryId: "selfworth_personality",
        symptomQuestions: [
          { id: "self_conf_q1", textDE: "Hast du das Gefühl deine Fähigkeiten gut zu kennen?", order: 1 },
          { id: "self_conf_q2", textDE: "Kannst du auf deine Entscheidungen vertrauen?", order: 2 },
          { id: "self_conf_q3", textDE: "Kannst du Feedback und Kritik gut annehmen?", order: 3 },
          { id: "self_conf_q4", textDE: "Fühlst du dich sicher vor Menschen zu präsentieren?", order: 4 },
        ],
      },
      {
        id: "personality_issues",
        labelDE: "Probleme mit der eigenen Persönlichkeit",
        parentCategoryId: "selfworth_personality",
        symptomQuestions: [
          { id: "self_pers_q1", textDE: "Hast du das Gefühl dass deine Persönlichkeit oft Konflikte auslöst?", order: 1 },
          { id: "self_pers_q2", textDE: "Wirst du oft aufgrund deiner Persönlichkeit in Gruppen ausgeschlossen?", order: 2 },
          { id: "self_pers_q3", textDE: "Beeinflussen oftmalige Stimmungsschwankungen deinen Umgang mit anderen?", order: 3 },
          { id: "self_pers_q4", textDE: "Hast du Schwierigkeiten dich selbst zu strukturieren und Prioritäten zu setzen?", order: 4 },
        ],
      },
      {
        id: "personality_development",
        labelDE: "Persönlichkeitsentwicklung",
        parentCategoryId: "selfworth_personality",
        symptomQuestions: [
          { id: "self_dev_q1", textDE: "Möchtest du Lernen Feedback und Anregungen gut umsetzen zu können?", order: 1 },
          { id: "self_dev_q2", textDE: "Hast du das Gefühl mehr über dich und deine Persönlichkeit erfahren zu wollen?", order: 2 },
          { id: "self_dev_q3", textDE: "Möchtest du dich und deine Fähigkeiten aktiv weiter entwickeln?", order: 3 },
          { id: "self_dev_q4", textDE: "Ist dir Selbstreflexion für die Entwicklung wichtig?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 4. Schlafprobleme & Innere Unruhe
  // -------------------------------------------------------------------------
  {
    id: "sleep_restlessness",
    labelDE: "Schlafprobleme & Innere Unruhe",
    iconName: "Moon",
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop",
    mappedSpecialties: ["sleep", "stress"],
    subcategories: [
      {
        id: "falling_asleep",
        labelDE: "Einschlafen",
        parentCategoryId: "sleep_restlessness",
        symptomQuestions: [
          { id: "sleep_fall_q1", textDE: "Drehen sich deine Gedanken beim Einschlafen?", order: 1 },
          { id: "sleep_fall_q2", textDE: "Kannst du schlecht einschlafen?", order: 2 },
          { id: "sleep_fall_q3", textDE: "Dauert es länger beim einschlafen obwohl du schon Einschlafroutinen pflegst?", order: 3 },
          { id: "sleep_fall_q4", textDE: "Fühlt sich dein Körper oft unruhig an beim Einschlafen?", order: 4 },
        ],
      },
      {
        id: "staying_asleep",
        labelDE: "Durchschlafen",
        parentCategoryId: "sleep_restlessness",
        symptomQuestions: [
          { id: "sleep_stay_q1", textDE: "Wachst du nachts häufig auf?", order: 1 },
          { id: "sleep_stay_q2", textDE: "Kannst du nach dem Aufwachen in der Nacht schwer wieder einschlafen?", order: 2 },
          { id: "sleep_stay_q3", textDE: "Fühlt sich dein Körper oft unruhig nach dem Aufwachen?", order: 3 },
          { id: "sleep_stay_q4", textDE: "Fühlst du dich tagsüber häufig matt und müde?", order: 4 },
        ],
      },
      {
        id: "inner_restlessness",
        labelDE: "Innere Unruhe",
        parentCategoryId: "sleep_restlessness",
        symptomQuestions: [
          { id: "sleep_rest_q1", textDE: "Fühlst du dich häufig innerlich angespannt?", order: 1 },
          { id: "sleep_rest_q2", textDE: "Hast du das Gefühl schwer zur Ruhe zu kommen?", order: 2 },
          { id: "sleep_rest_q3", textDE: "Hast du das Gefühl ständig unter Strom zu stehen?", order: 3 },
          { id: "sleep_rest_q4", textDE: "Erlebst du innere Unruhe ohne erkennbare äußere Gründe?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 5. Niedergeschlagenheit & Innere Leere
  // -------------------------------------------------------------------------
  {
    id: "depression_emptiness",
    labelDE: "Niedergeschlagenheit & Innere Leere",
    iconName: "CloudRain",
    imageUrl: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400&h=300&fit=crop",
    mappedSpecialties: ["depression"],
    subcategories: [
      {
        id: "feeling_down",
        labelDE: "Niedergeschlagen",
        parentCategoryId: "depression_emptiness",
        symptomQuestions: [
          { id: "dep_down_q1", textDE: "Fühlst du dich häufig niedergeschlagen und traurig?", order: 1 },
          { id: "dep_down_q2", textDE: "Hält deine Niedergeschlagenheit schon länger als zwei Wochen?", order: 2 },
          { id: "dep_down_q3", textDE: "Ziehst du dich häufig zurück?", order: 3 },
          { id: "dep_down_q4", textDE: "Fühlst du dich oft erschöpft und kraftlos?", order: 4 },
        ],
      },
      {
        id: "inner_emptiness",
        labelDE: "Innere Leere",
        parentCategoryId: "depression_emptiness",
        symptomQuestions: [
          { id: "dep_empty_q1", textDE: "Hast du das Gefühl von innerer Leere?", order: 1 },
          { id: "dep_empty_q2", textDE: "Fällt es dir schwer Motivation für Tätigkeiten des Alltags aufzubringen?", order: 2 },
          { id: "dep_empty_q3", textDE: "Fällt es dir schwer dich über etwas zu freuen?", order: 3 },
          { id: "dep_empty_q4", textDE: "Siehst du deine Zukunft eher pessimistisch?", order: 4 },
        ],
      },
      {
        id: "lack_of_drive",
        labelDE: "Fehlender Antrieb",
        parentCategoryId: "depression_emptiness",
        symptomQuestions: [
          { id: "dep_drive_q1", textDE: "Fühlst du dich trotz Schlaf nicht erholt?", order: 1 },
          { id: "dep_drive_q2", textDE: "Erlebst du kleine Aufgaben als sehr anstrengend?", order: 2 },
          { id: "dep_drive_q3", textDE: "Fühlst du dich oft erschöpft und kraftlos?", order: 3 },
          { id: "dep_drive_q4", textDE: "Fühlt sich dein Körper oft schwer an, meist morgens?", order: 4 },
        ],
      },
      {
        id: "social_withdrawal",
        labelDE: "Sozialer Rückzug",
        parentCategoryId: "depression_emptiness",
        symptomQuestions: [
          { id: "dep_social_q1", textDE: "Meidest du soziale Situationen die dir vorher Freude bereitet haben?", order: 1 },
          { id: "dep_social_q2", textDE: "Ziehst du dich aktuell eher zurück?", order: 2 },
          { id: "dep_social_q3", textDE: "Fällt es dir schwer am sozialen Leben Teil zu nehmen? Fällt es dir schwer Kontakt zu halten?", order: 3 },
          { id: "dep_social_q4", textDE: "Meidest du alltägliche Situationen in Schule oder Beruf?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 6. Angst & Panik
  // -------------------------------------------------------------------------
  {
    id: "anxiety_panic",
    labelDE: "Angst & Panik",
    iconName: "AlertTriangle",
    imageUrl: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=400&h=300&fit=crop",
    mappedSpecialties: ["anxiety", "panic", "phobias"],
    subcategories: [
      {
        id: "generalized_anxiety",
        labelDE: "Generalisierte Ängste",
        parentCategoryId: "anxiety_panic",
        symptomQuestions: [
          { id: "anx_gen_q1", textDE: "Machst du dir häufig Sorgen über unterschiedliche Dinge des täglichen Lebens?", order: 1 },
          { id: "anx_gen_q2", textDE: "Nimmst du Angst als dauerhaften Grundzustand wahr?", order: 2 },
          { id: "anx_gen_q3", textDE: "Fällt es dir schwer dich zu konzentrieren?", order: 3 },
          { id: "anx_gen_q4", textDE: "Vermeidest du Situationen aus Angst, dass etwas passieren könnte?", order: 4 },
        ],
      },
      {
        id: "health_anxiety",
        labelDE: "Hypochondrische Ängste",
        parentCategoryId: "anxiety_panic",
        symptomQuestions: [
          { id: "anx_health_q1", textDE: "Machst du dir häufig Sorgen um deine körperliche Gesundheit?", order: 1 },
          { id: "anx_health_q2", textDE: "Hast du Angst ernsthaft krank zu sein oder zu werden?", order: 2 },
          { id: "anx_health_q3", textDE: "Nimmst du körperliche Veränderungen als intensiv wahr? Kontrollierst und beobachtest du deinen Körper regelmäßig?", order: 3 },
          { id: "anx_health_q4", textDE: "Suchst du häufig ärztliche Rückversicherung oder recherchierst Symptome im Internet?", order: 4 },
        ],
      },
      {
        id: "panic",
        labelDE: "Panik",
        parentCategoryId: "anxiety_panic",
        symptomQuestions: [
          { id: "anx_panic_q1", textDE: "Hattest du schon einmal eine plötzliche, starke Angstattacke?", order: 1 },
          { id: "anx_panic_q2", textDE: "Begleiten die Attacken oft körperliche Symptome wie Herzrasen, Zittern oder Atemschwierigkeiten?", order: 2 },
          { id: "anx_panic_q3", textDE: "Hast du Angst erneut eine Attacke zu erleben?", order: 3 },
          { id: "anx_panic_q4", textDE: "Fühlst du dich durch die Panikattacken stark belastet?", order: 4 },
        ],
      },
      {
        id: "phobias",
        labelDE: "Phobien",
        parentCategoryId: "anxiety_panic",
        symptomQuestions: [
          { id: "anx_phob_q1", textDE: "Hast du starke Angst vor bestimmten Situationen oder Objekten?", order: 1 },
          { id: "anx_phob_q2", textDE: "Tritt die Angst sofort auf, wenn du dem Objekt oder der Situation begegnest?", order: 2 },
          { id: "anx_phob_q3", textDE: "Vermeidest du bestimmte Situationen oder Orte wegen dieser Angst?", order: 3 },
          { id: "anx_phob_q4", textDE: "Begleiten diese Situationen körperliche Reaktionen wie Schweißausbrüche, Unwohlsein, Herzklopfen oder Zittern?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 7. Stress & Burnout
  // -------------------------------------------------------------------------
  {
    id: "stress_burnout",
    labelDE: "Stress & Burnout",
    iconName: "Flame",
    imageUrl: "https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=400&h=300&fit=crop",
    mappedSpecialties: ["burnout", "stress"],
    subcategories: [
      {
        id: "burnout",
        labelDE: "Burnout",
        parentCategoryId: "stress_burnout",
        symptomQuestions: [
          { id: "burn_q1", textDE: "Fühlst du dich oft überfordert von deinen Aufgaben?", order: 1 },
          { id: "burn_q2", textDE: "Fällt es dir schwer Aufgaben zu beginnen oder abzuschließen?", order: 2 },
          { id: "burn_q3", textDE: "Fühlst du dich häufig emotional ausgelaugt und erschöpft?", order: 3 },
          { id: "burn_q4", textDE: "Fällt es dir schwer dich zu konzentrieren und Entscheidungen zu treffen?", order: 4 },
        ],
      },
      {
        id: "stress",
        labelDE: "Stress",
        parentCategoryId: "stress_burnout",
        symptomQuestions: [
          { id: "stress_q1", textDE: "Fühlst du dich häufig gestresst?", order: 1 },
          { id: "stress_q2", textDE: "Fällt es dir schwer Stress loszulassen oder abzuschalten?", order: 2 },
          { id: "stress_q3", textDE: "Macht dir dein Alltag häufig Stress und Druck?", order: 3 },
          { id: "stress_q4", textDE: "Fühlst du dich oft gereizt oder ungeduldig?", order: 4 },
        ],
      },
      {
        id: "emotional_exhaustion",
        labelDE: "Emotionale / Mentale Erschöpfung",
        parentCategoryId: "stress_burnout",
        symptomQuestions: [
          { id: "emo_exh_q1", textDE: "Hast du das Gefühl dass du häufig emotional/mental erschöpft bist?", order: 1 },
          { id: "emo_exh_q2", textDE: "Fällt es dir schwer positive Gefühle zu empfinden?", order: 2 },
          { id: "emo_exh_q3", textDE: "Macht es dir Sorgen dass du Aufgaben oder soziale Kontakte emotional nur schwer bewältigen kannst?", order: 3 },
          { id: "emo_exh_q4", textDE: "Nimmst du Verantwortung als emotional erschöpfend wahr?", order: 4 },
        ],
      },
      {
        id: "physical_exhaustion",
        labelDE: "Körperliche Erschöpfung",
        parentCategoryId: "stress_burnout",
        symptomQuestions: [
          { id: "phys_exh_q1", textDE: "Hast du das Gefühl trotz Schlaf körperlich nicht erholt zu sein?", order: 1 },
          { id: "phys_exh_q2", textDE: "Leidest du häufig unter Verspannungen, Kopf- oder Rückenschmerzen?", order: 2 },
          { id: "phys_exh_q3", textDE: "Begleiten körperliche Beschwerden deine Erschöpfung?", order: 3 },
          { id: "phys_exh_q4", textDE: "Vermeidest du körperliche Aktivitäten aus Angst vor Erschöpfung?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 8. Trauer & Verlust
  // -------------------------------------------------------------------------
  {
    id: "grief_loss",
    labelDE: "Trauer & Verlust",
    iconName: "Heart",
    imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b40?w=400&h=300&fit=crop",
    mappedSpecialties: ["grief"],
    subcategories: [
      {
        id: "loss_person",
        labelDE: "Trauer und Verlust von nahestehenden Personen",
        parentCategoryId: "grief_loss",
        symptomQuestions: [
          { id: "grief_person_q1", textDE: "Denkst du häufig an die verstorbene Person?", order: 1 },
          { id: "grief_person_q2", textDE: "Fühlst du dich traurig und niedergeschlagen wegen des Verlusts?", order: 2 },
          { id: "grief_person_q3", textDE: "Hast du Schuldgefühle und Selbstvorwürfe im Zusammenhang mit dem Verlust?", order: 3 },
          { id: "grief_person_q4", textDE: "Erlebst du emotionale Ausbrüche wie Weinen oder Traurigkeit?", order: 4 },
        ],
      },
      {
        id: "loss_relationship",
        labelDE: "Trauer und Verlust von Beziehungen",
        parentCategoryId: "grief_loss",
        symptomQuestions: [
          { id: "grief_rel_q1", textDE: "Fühlst du dich traurig und niedergeschlagen wegen des Verlusts?", order: 1 },
          { id: "grief_rel_q2", textDE: "Hast du Schuldgefühle und Selbstvorwürfe im Zusammenhang mit dem Verlust?", order: 2 },
          { id: "grief_rel_q3", textDE: "Grübelst du über mögliche Fehler oder Ursachen des Verlusts?", order: 3 },
          { id: "grief_rel_q4", textDE: "Meidest du soziale Kontakte oder Orte, weil sie dich an den Verlust erinnern?", order: 4 },
        ],
      },
      {
        id: "loss_career",
        labelDE: "Trauer und Verlust von Beruf oder Besitz",
        parentCategoryId: "grief_loss",
        symptomQuestions: [
          { id: "grief_career_q1", textDE: "Hast du deinen Job oder eine Stelle verloren?", order: 1 },
          { id: "grief_career_q2", textDE: "Hast du durch Krankheit oder Misserfolg etwas Wichtiges in deinem Leben verloren?", order: 2 },
          { id: "grief_career_q3", textDE: "Hast du materielle Gegenstände die dir wichtig waren verloren (Haus, Wohnung, Geld etc)?", order: 3 },
          { id: "grief_career_q4", textDE: "Hast du durch einen Unfall oder Diebstahl etwas wichtiges verloren?", order: 4 },
        ],
      },
      {
        id: "spiritual_aspects",
        labelDE: "Spirituelle Aspekte",
        parentCategoryId: "grief_loss",
        symptomQuestions: [
          { id: "grief_spirit_q1", textDE: "Beschäftigt dich nach dem Verlust die Frage nach dem Sinn im Leben?", order: 1 },
          { id: "grief_spirit_q2", textDE: "Hast du das Gefühl dass dein Leben ohne den Verlust nicht mehr dasselbe ist?", order: 2 },
          { id: "grief_spirit_q3", textDE: "Findest du Trost im Glauben oder spirituellen Praktiken?", order: 3 },
          { id: "grief_spirit_q4", textDE: "Hast du das Gefühl, dass der/die Verstorbene oder der Verlust auf einer spirituellen Ebene weiterhin bei dir präsent ist?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 9. Trauma & PTBS
  // -------------------------------------------------------------------------
  {
    id: "trauma_ptsd",
    labelDE: "Trauma & PTBS",
    iconName: "Shield",
    imageUrl: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&h=300&fit=crop",
    mappedSpecialties: ["trauma"],
    subcategories: [
      {
        id: "acute_trauma",
        labelDE: "Akutes Trauma",
        parentCategoryId: "trauma_ptsd",
        symptomQuestions: [
          { id: "trauma_acute_q1", textDE: "Hast du ein plötzlich aufgetretenes belastendes Ereignis erlebt, das dich stark verängstigt hat?", order: 1 },
          { id: "trauma_acute_q2", textDE: "Hattest du während des Ereignisses oder unmittelbar danach Angst um dein Leben oder deine Sicherheit?", order: 2 },
          { id: "trauma_acute_q3", textDE: "Hast du nach dem Ereignis häufig Angst oder Panik gespürt?", order: 3 },
          { id: "trauma_acute_q4", textDE: "Tauchen plötzlich Bilder oder Erinnerungen an das Ereignis auf?", order: 4 },
        ],
      },
      {
        id: "ptsd",
        labelDE: "Post Traumatische Belastungsreaktion",
        parentCategoryId: "trauma_ptsd",
        symptomQuestions: [
          { id: "trauma_ptsd_q1", textDE: "Erlebst du wiederholt belastende Erinnerungen an ein traumatisches Ereignis?", order: 1 },
          { id: "trauma_ptsd_q2", textDE: "Fühlst du dich manchmal, als würdest du das Ereignis erneut erleben?", order: 2 },
          { id: "trauma_ptsd_q3", textDE: "Fühlst du dich durch die Symptome oft überfordert und belasten sie deine Alltagsaktivitäten?", order: 3 },
          { id: "trauma_ptsd_q4", textDE: "Haben sich deine Beziehungen zu anderen Menschen verändert (Distanz, Misstrauen)?", order: 4 },
        ],
      },
      {
        id: "cumulative_trauma",
        labelDE: "Kumulierte Trauma",
        parentCategoryId: "trauma_ptsd",
        symptomQuestions: [
          { id: "trauma_cum_q1", textDE: "Hast du über längere Zeit wiederholt belastende oder traumatische Ereignisse erlebt?", order: 1 },
          { id: "trauma_cum_q2", textDE: "Fühlst du dich häufig niedergeschlagen oder traurig?", order: 2 },
          { id: "trauma_cum_q3", textDE: "Denkst du häufig an vergangene belastende Ereignisse?", order: 3 },
          { id: "trauma_cum_q4", textDE: "Beeinträchtigen die Symptome deine Arbeit, Schule oder alltägliche Aufgaben?", order: 4 },
        ],
      },
      {
        id: "relationship_trauma",
        labelDE: "Verlust- und Beziehungstrauma",
        parentCategoryId: "trauma_ptsd",
        symptomQuestions: [
          { id: "trauma_rel_q1", textDE: "Fühlst du dich häufig traurig oder niedergeschlagen durch den Verlust einer nahestehenden Person oder Beziehung?", order: 1 },
          { id: "trauma_rel_q2", textDE: "Denkst du häufig über vergangene Verluste oder Beziehungsabbrüche nach?", order: 2 },
          { id: "trauma_rel_q3", textDE: "Meidest du soziale Kontakte aus Angst vor neuen Verlusten oder Enttäuschungen?", order: 3 },
          { id: "trauma_rel_q4", textDE: "Hast du Schwierigkeiten, neue Beziehungen aufzubauen oder Nähe zuzulassen?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 10. Psychosomatik
  // -------------------------------------------------------------------------
  {
    id: "psychosomatic",
    labelDE: "Psychosomatik",
    iconName: "Activity",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    mappedSpecialties: ["psychosomatic"],
    subcategories: [
      {
        id: "psyche_to_body",
        labelDE: "Psychosomatik – Psyche wirkt auf Körper",
        parentCategoryId: "psychosomatic",
        symptomQuestions: [
          { id: "psycho_pb_q1", textDE: "Hast du häufig körperliche Beschwerden ohne klare medizinische Ursache?", order: 1 },
          { id: "psycho_pb_q2", textDE: "Verstärken sich deine körperlichen Beschwerden in Stresssituationen?", order: 2 },
          { id: "psycho_pb_q3", textDE: "Hast du öfter Kopfschmerzen, Schwindel, Magen-Darm-Beschwerden, Verspannungen oder Schmerzen an Muskeln und Gelenken?", order: 3 },
          { id: "psycho_pb_q4", textDE: "Beeinträchtigen die körperlichen Beschwerden deinen Alltag oder deine Leistungsfähigkeit?", order: 4 },
        ],
      },
      {
        id: "body_to_psyche",
        labelDE: "Somatopsyche – Körper wirkt auf Psyche",
        parentCategoryId: "psychosomatic",
        symptomQuestions: [
          { id: "psycho_bp_q1", textDE: "Spürst du häufig Schmerz der dazu führt, dass du dich häufig traurig oder niedergeschlagen fühlst?", order: 1 },
          { id: "psycho_bp_q2", textDE: "Hast du durch den Schmerz oder der Einschränkung Angst oder Sorgen um deine Gesundheit?", order: 2 },
          { id: "psycho_bp_q3", textDE: "Grübelst du häufig über deine körperliche Belastung oder Einschränkung?", order: 3 },
          { id: "psycho_bp_q4", textDE: "Fühlst du dich oft hilflos oder überwältigt durch den Schmerz oder der Einschränkung?", order: 4 },
        ],
      },
      {
        id: "stress_physical",
        labelDE: "Stressbedingte körperliche Beschwerden",
        parentCategoryId: "psychosomatic",
        symptomQuestions: [
          { id: "psycho_stress_q1", textDE: "Hast du unter Stress häufiger Muskelverspannungen, Kopf oder Rückenschmerzen?", order: 1 },
          { id: "psycho_stress_q2", textDE: "Verstärken sich körperliche Beschwerden in belastenden Situationen?", order: 2 },
          { id: "psycho_stress_q3", textDE: "Machst du dir Sorgen über die körperlichen Beschwerden, die durch Stress entstehen?", order: 3 },
          { id: "psycho_stress_q4", textDE: "Beeinträchtigen die stressbedingten Beschwerden deinen Alltag, Arbeit oder soziale Aktivitäten?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 11. Sucht & Abhängigkeit
  // -------------------------------------------------------------------------
  {
    id: "addiction",
    labelDE: "Sucht & Abhängigkeit",
    iconName: "Wine",
    imageUrl: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=400&h=300&fit=crop",
    mappedSpecialties: ["addiction"],
    subcategories: [
      {
        id: "substance_alcohol",
        labelDE: "Substanzabhängig (Alkohol, Nikotin)",
        parentCategoryId: "addiction",
        symptomQuestions: [
          { id: "addict_alc_q1", textDE: "Hast du häufig starkes Verlangen (Craving) nach der Substanz?", order: 1 },
          { id: "addict_alc_q2", textDE: "Vernachlässigst du Arbeit, Schule, Hobbys oder Familie wegen des Konsums?", order: 2 },
          { id: "addict_alc_q3", textDE: "Hast du bemerkt, dass du höhere Mengen brauchst, um die gleiche Wirkung zu spüren?", order: 3 },
          { id: "addict_alc_q4", textDE: "Treten körperliche oder psychische Beschwerden auf, wenn du den Konsum reduzierst oder absetzt?", order: 4 },
        ],
      },
      {
        id: "substance_drugs",
        labelDE: "Substanzabhängig (Drogen, Medikamente)",
        parentCategoryId: "addiction",
        symptomQuestions: [
          { id: "addict_drug_q1", textDE: "Hast du häufig starkes Verlangen (Craving) nach der Substanz?", order: 1 },
          { id: "addict_drug_q2", textDE: "Vernachlässigst du Arbeit, Schule, Hobbys oder Familie wegen des Konsums?", order: 2 },
          { id: "addict_drug_q3", textDE: "Hast du bemerkt, dass du höhere Mengen brauchst, um die gleiche Wirkung zu spüren?", order: 3 },
          { id: "addict_drug_q4", textDE: "Treten körperliche oder psychische Beschwerden auf, wenn du den Konsum reduzierst oder absetzt?", order: 4 },
        ],
      },
      {
        id: "behavioral_gambling",
        labelDE: "Verhaltensabhängig (Glückspiel, Internet, Smartphone etc.)",
        parentCategoryId: "addiction",
        symptomQuestions: [
          { id: "addict_gamb_q1", textDE: "Hast du häufig starkes Verlangen (Craving) nach dem Verhalten?", order: 1 },
          { id: "addict_gamb_q2", textDE: "Vernachlässigst du Arbeit, Schule, Hobbys oder Familie wegen des Verhaltens?", order: 2 },
          { id: "addict_gamb_q3", textDE: "Hat die Abhängigkeit Konflikte mit Familie oder Partner verursacht?", order: 3 },
          { id: "addict_gamb_q4", textDE: "Treten körperliche oder psychische Beschwerden auf, wenn du das Verhalten reduzierst oder absetzt?", order: 4 },
        ],
      },
      {
        id: "behavioral_other",
        labelDE: "Verhaltensabhängig (Einkaufen, Essen, Sport, Sex etc.)",
        parentCategoryId: "addiction",
        symptomQuestions: [
          { id: "addict_other_q1", textDE: "Hast du häufig starkes Verlangen (Craving) nach dem Verhalten?", order: 1 },
          { id: "addict_other_q2", textDE: "Vernachlässigst du Arbeit, Schule, Hobbys oder Familie wegen des Verhaltens?", order: 2 },
          { id: "addict_other_q3", textDE: "Hat die Abhängigkeit Konflikte mit Familie oder Partner verursacht?", order: 3 },
          { id: "addict_other_q4", textDE: "Treten körperliche oder psychische Beschwerden auf, wenn du das Verhalten reduzierst oder absetzt?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 12. Zwangsgedanken und -handlungen
  // -------------------------------------------------------------------------
  {
    id: "ocd",
    labelDE: "Zwangsgedanken und -handlungen",
    iconName: "RefreshCw",
    imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop",
    mappedSpecialties: ["ocd"],
    subcategories: [
      {
        id: "compulsive_actions",
        labelDE: "Zwangshandlungen",
        parentCategoryId: "ocd",
        symptomQuestions: [
          { id: "ocd_act_q1", textDE: "Hast du wiederkehrende Handlungen, die du ausführen musst, um Angst oder Unruhe zu reduzieren?", order: 1 },
          { id: "ocd_act_q2", textDE: "Beeinträchtigen die Zwangshandlungen deine Arbeit, Schule oder Alltagstätigkeiten?", order: 2 },
          { id: "ocd_act_q3", textDE: "Verspürst du Angst oder Unruhe, wenn du die Handlungen nicht ausführst?", order: 3 },
          { id: "ocd_act_q4", textDE: "Fühlst du dich nach Durchführung der Zwangshandlungen kurzzeitig beruhigt oder erleichtert?", order: 4 },
        ],
      },
      {
        id: "obsessive_thoughts",
        labelDE: "Zwangsgedanken",
        parentCategoryId: "ocd",
        symptomQuestions: [
          { id: "ocd_thought_q1", textDE: "Hast du wiederkehrende Gedanken, die du als aufdringlich oder belastend empfindest?", order: 1 },
          { id: "ocd_thought_q2", textDE: "Tauchen diese Gedanken täglich oder mehrmals täglich auf und halten länger an?", order: 2 },
          { id: "ocd_thought_q3", textDE: "Beeinträchtigen die Gedanken deine Arbeit, Schule oder alltägliche Aufgaben?", order: 3 },
          { id: "ocd_thought_q4", textDE: "Fühlst du dich oft unfähig, die Gedanken zu unterbrechen oder zu stoppen?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 13. Schwierigkeiten mit dem Essen
  // -------------------------------------------------------------------------
  {
    id: "eating_disorders",
    labelDE: "Schwierigkeiten mit dem Essen",
    iconName: "UtensilsCrossed",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
    mappedSpecialties: ["eating_disorders"],
    subcategories: [
      {
        id: "anorexia",
        labelDE: "Magersucht (Anorexie)",
        parentCategoryId: "eating_disorders",
        symptomQuestions: [
          { id: "eat_anor_q1", textDE: "Verzichtest du häufig auf Mahlzeiten oder isst nur sehr wenig?", order: 1 },
          { id: "eat_anor_q2", textDE: "Hast du Angst vor Gewichtszunahme, auch wenn dein Gewicht normal oder niedrig ist?", order: 2 },
          { id: "eat_anor_q3", textDE: "Fühlst du dich trotz Untergewicht zu dick oder unzufrieden mit deinem Körper?", order: 3 },
          { id: "eat_anor_q4", textDE: "Fühlst du Schuld- oder Schamgefühle nach dem Essen oder bei Mahlzeiten?", order: 4 },
        ],
      },
      {
        id: "bulimia",
        labelDE: "Ess-Brech-Sucht (Bulimie)",
        parentCategoryId: "eating_disorders",
        symptomQuestions: [
          { id: "eat_bul_q1", textDE: "Hast du wiederkehrende Essanfälle, bei denen du große Mengen Nahrung in kurzer Zeit isst?", order: 1 },
          { id: "eat_bul_q2", textDE: "Betreibst du anschließend Maßnahmen, um eine Gewichtszunahme zu verhindern (Erbrechen, Abführmittel, exzessiver Sport)?", order: 2 },
          { id: "eat_bul_q3", textDE: "Fühlst du dich trotz normalem Gewicht oder Untergewicht zu dick oder unzufrieden mit deinem Körper?", order: 3 },
          { id: "eat_bul_q4", textDE: "Fühlst du Schuld- oder Schamgefühle nach Essanfällen oder kompensatorischem Verhalten?", order: 4 },
        ],
      },
      {
        id: "binge_eating",
        labelDE: "Binge-Eating-Störung",
        parentCategoryId: "eating_disorders",
        symptomQuestions: [
          { id: "eat_binge_q1", textDE: "Hast du wiederholt Essanfälle, bei denen du große Mengen Nahrung in kurzer Zeit isst?", order: 1 },
          { id: "eat_binge_q2", textDE: "Fühlst du dich nach den Essanfällen unwohl oder übermäßig voll?", order: 2 },
          { id: "eat_binge_q3", textDE: "Fühlst du dich trotz normalem Gewicht oder Untergewicht zu dick oder unzufrieden mit deinem Körper?", order: 3 },
          { id: "eat_binge_q4", textDE: "Fühlst du Schuld- oder Schamgefühle nach Essanfällen oder kompensatorischem Verhalten?", order: 4 },
        ],
      },
      {
        id: "orthorexia_arfid",
        labelDE: "Sonstiges abnormes Essverhalten (Orthorexie, ARFID)",
        parentCategoryId: "eating_disorders",
        symptomQuestions: [
          { id: "eat_ortho_q1", textDE: "Kontrollierst du streng, welche Lebensmittel du isst, um sie als \"gesund\" zu bewerten?", order: 1 },
          { id: "eat_ortho_q2", textDE: "Vermeidest du bestimmte Lebensmittelgruppen oder -texturen stark?", order: 2 },
          { id: "eat_ortho_q3", textDE: "Fühlst du dich trotz normalem Gewicht oder Untergewicht zu dick oder unzufrieden mit deinem Körper?", order: 3 },
          { id: "eat_ortho_q4", textDE: "Fühlst du Schuld- oder Schamgefühle nach Essanfällen oder kompensatorischem Verhalten?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 14. Themen zur Sexualität
  // -------------------------------------------------------------------------
  {
    id: "sexuality",
    labelDE: "Themen zur Sexualität",
    iconName: "Heart",
    imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop",
    mappedSpecialties: ["couples"],
    subcategories: [
      {
        id: "libido",
        labelDE: "Sexuelle Funktion (Libido)",
        parentCategoryId: "sexuality",
        symptomQuestions: [
          { id: "sex_lib_q1", textDE: "Hast du in letzter Zeit ein deutlich vermindertes oder gesteigertes sexuelles Verlangen erlebt?", order: 1 },
          { id: "sex_lib_q2", textDE: "Erlebst du dein sexuelles Verlangen als problematisch oder belastend?", order: 2 },
          { id: "sex_lib_q3", textDE: "Erlebst du Angst, Stress oder Leistungsdruck in sexuellen Situationen?", order: 3 },
          { id: "sex_lib_q4", textDE: "Führt Sexualität in deinen Beziehungen häufiger zu Konflikten oder Rückzug?", order: 4 },
        ],
      },
      {
        id: "arousal",
        labelDE: "Sexuelles Verlangen (Erregung)",
        parentCategoryId: "sexuality",
        symptomQuestions: [
          { id: "sex_arousal_q1", textDE: "Hast du Schwierigkeiten, sexuelle Erregung zu empfinden oder bist überregt?", order: 1 },
          { id: "sex_arousal_q2", textDE: "Vermeidest du sexuelle Situationen aufgrund fehlenden Verlangens?", order: 2 },
          { id: "sex_arousal_q3", textDE: "Bleibt die körperliche Erregung aus, obwohl du dir Nähe oder Sexualität wünschst?", order: 3 },
          { id: "sex_arousal_q4", textDE: "Führt dein geringes Verlangen oder deine Erregungsprobleme zu Konflikten oder Rückzug?", order: 4 },
        ],
      },
      {
        id: "orgasm",
        labelDE: "Orgasmus",
        parentCategoryId: "sexuality",
        symptomQuestions: [
          { id: "sex_org_q1", textDE: "Hast du Schwierigkeiten, einen Orgasmus zu erreichen oder erlebst du ihn deutlich verzögert?", order: 1 },
          { id: "sex_org_q2", textDE: "Erlebst du deine Orgasmusfähigkeit als belastend oder frustrierend?", order: 2 },
          { id: "sex_org_q3", textDE: "Erlebst du Leistungsdruck oder Angst in Bezug auf den Orgasmus?", order: 3 },
          { id: "sex_org_q4", textDE: "Nimmst du Medikamente oder Nahrungsergänzungsmittel ein, die deine Orgasmusfähigkeit beeinflussen könnten?", order: 4 },
        ],
      },
      {
        id: "pain_sex",
        labelDE: "Schmerzen bei Sex",
        parentCategoryId: "sexuality",
        symptomQuestions: [
          { id: "sex_pain_q1", textDE: "Erlebst du Schmerzen während sexueller Aktivität?", order: 1 },
          { id: "sex_pain_q2", textDE: "Erlebst du Schmerzen auch nach dem Sex?", order: 2 },
          { id: "sex_pain_q3", textDE: "Treten die Schmerzen regelmäßig bei sexueller Aktivität auf?", order: 3 },
          { id: "sex_pain_q4", textDE: "Vermeidest du sexuelle Aktivitäten aus Angst vor Schmerzen?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 15. Schule und Lernen
  // -------------------------------------------------------------------------
  {
    id: "school_learning",
    labelDE: "Schule und Lernen",
    iconName: "GraduationCap",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    mappedSpecialties: ["children"],
    subcategories: [
      {
        id: "emotional_school",
        labelDE: "Emotionale Schwierigkeiten (Ängste, Niedergeschlagenheit etc.)",
        parentCategoryId: "school_learning",
        symptomQuestions: [
          { id: "school_emo_q1", textDE: "Hast du Angst oder bist Niedergeschlagen vor der Schule oder dem Schulbesuch?", order: 1 },
          { id: "school_emo_q2", textDE: "Hast du Angst vor Klassenarbeiten, Tests oder Prüfungen?", order: 2 },
          { id: "school_emo_q3", textDE: "Hast du Angst, den Lernstoff nicht zu verstehen oder Angst dass er dich überfordert?", order: 3 },
          { id: "school_emo_q4", textDE: "Fühlst du dich wegen Schule oder Lernen häufig traurig oder niedergeschlagen?", order: 4 },
        ],
      },
      {
        id: "learning_difficulties",
        labelDE: "Lernschwierigkeiten",
        parentCategoryId: "school_learning",
        symptomQuestions: [
          { id: "school_learn_q1", textDE: "Verstehst du Anweisungen oder Erklärungen in der Schule oft nicht?", order: 1 },
          { id: "school_learn_q2", textDE: "Hast du Probleme, dir Gelerntes zu merken?", order: 2 },
          { id: "school_learn_q3", textDE: "Kannst du dich beim Lernen leicht ablenken lassen?", order: 3 },
          { id: "school_learn_q4", textDE: "Denkst du oft, dass du weniger begabt bist als andere?", order: 4 },
        ],
      },
      {
        id: "social_bullying",
        labelDE: "Soziale Schwierigkeiten (Mobbing)",
        parentCategoryId: "school_learning",
        symptomQuestions: [
          { id: "school_bully_q1", textDE: "Wirst du in der Schule gehänselt oder verspottet?", order: 1 },
          { id: "school_bully_q2", textDE: "Wirst du absichtlich von Mitschüler*innen ausgeschlossen oder wirst körperlich/emotional angegriffen oder bedroht?", order: 2 },
          { id: "school_bully_q3", textDE: "Hast du Angst vor bestimmten Mitschüler*innen oder Gruppen?", order: 3 },
          { id: "school_bully_q4", textDE: "Vermeidest du bestimmte Pausen, Orte oder Gruppen wegen Konflikten?", order: 4 },
        ],
      },
      {
        id: "family_school_conflict",
        labelDE: "Konflikte mit Familie und Eltern",
        parentCategoryId: "school_learning",
        symptomQuestions: [
          { id: "school_fam_q1", textDE: "Hast du häufig Streit mit deinen Eltern wegen der Schule oder Hausaufgaben oder fühlst du dich unter Druck deswegen?", order: 1 },
          { id: "school_fam_q2", textDE: "Fühlst du dich traurig oder niedergeschlagen wegen Konflikten mit deinen Eltern in der Schule?", order: 2 },
          { id: "school_fam_q3", textDE: "Machen dir Konflikte mit deinen Eltern vor oder nach der Schule Stress oder innere Unruhe?", order: 3 },
          { id: "school_fam_q4", textDE: "Machen dich Konflikte mit Eltern über die Schule traurig oder mutlos?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 16. Aggressivität und Gewalt
  // -------------------------------------------------------------------------
  {
    id: "aggression_violence",
    labelDE: "Aggressivität und Gewalt",
    iconName: "Zap",
    imageUrl: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&h=300&fit=crop",
    mappedSpecialties: ["trauma"],
    subcategories: [
      {
        id: "physical_violence",
        labelDE: "Körperliche, sexuelle Gewalt",
        parentCategoryId: "aggression_violence",
        symptomQuestions: [
          { id: "viol_phys_q1", textDE: "Hast du Angst vor körperlicher Gewalt durch andere Personen oder fühlst du dich bedroht oder unsicher?", order: 1 },
          { id: "viol_phys_q2", textDE: "Erlebst du körperliche Gewalt regelmäßig oder wiederholt?", order: 2 },
          { id: "viol_phys_q3", textDE: "Hast du sexuelle Kontakte erlebt, die du nicht wolltest?", order: 3 },
          { id: "viol_phys_q4", textDE: "Meidest du Menschen oder Situationen aus Angst vor Gewalt?", order: 4 },
        ],
      },
      {
        id: "emotional_violence",
        labelDE: "Emotionale, Psychische Gewalt",
        parentCategoryId: "aggression_violence",
        symptomQuestions: [
          { id: "viol_emo_q1", textDE: "Wirst du von anderen absichtlich beleidigt, beschimpft, herabgesetzt, bedroht oder eingeschüchtert?", order: 1 },
          { id: "viol_emo_q2", textDE: "Hast du das Gefühl, dass andere dich absichtlich ignorieren oder ausschließen?", order: 2 },
          { id: "viol_emo_q3", textDE: "Fühlst du dich durch psychische Gewalt häufig gestresst oder angespannt?", order: 3 },
          { id: "viol_emo_q4", textDE: "Meidest du Menschen oder Situationen aus Angst vor psychischer Gewalt?", order: 4 },
        ],
      },
      {
        id: "cyber_violence",
        labelDE: "Gewalt in der digitalen Welt (Cyber-Gewalt)",
        parentCategoryId: "aggression_violence",
        symptomQuestions: [
          { id: "viol_cyber_q1", textDE: "Wurdest du online beleidigt, beschimpft, verspottet, bedroht oder erniedrigt?", order: 1 },
          { id: "viol_cyber_q2", textDE: "Wurden private Fotos oder Informationen ohne dein Einverständnis geteilt?", order: 2 },
          { id: "viol_cyber_q3", textDE: "Hast du Cyber-Gewalt über soziale Medien, Chat-Apps oder Foren erlebt?", order: 3 },
          { id: "viol_cyber_q4", textDE: "Fühlst du dich gestresst, isoliert oder ausgeschlossen aufgrund von Online-Konflikten?", order: 4 },
        ],
      },
      {
        id: "self_harm",
        labelDE: "Selbstzugefügte Gewalt",
        parentCategoryId: "aggression_violence",
        symptomQuestions: [
          { id: "viol_self_q1", textDE: "Hast du dir selbst absichtlich körperlichen Schaden zugefügt bzw. dich einmal selbst verletzt (z.B. Schneiden, Schlagen, Verbrennen etc.)?", order: 1 },
          { id: "viol_self_q2", textDE: "Zeigst du selbstschädigendes Verhalten ohne direkte Verletzung (z.B. extremes Hungern, Schlafentzug)?", order: 2 },
          { id: "viol_self_q3", textDE: "Tritt selbstzugefügte Gewalt bei starken Gefühlen wie Wut, Traurigkeit oder Leere auf bzw. verletzt du dich um innere Anspannung zu reduzieren?", order: 3 },
          { id: "viol_self_q4", textDE: "Hast du selbstabwertende Gedanken über dich bzw. denkst du dass du Strafe oder Schmerz verdient hast?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 17. Chronische Erkrankungen & chronische Schmerzen
  // -------------------------------------------------------------------------
  {
    id: "chronic_illness",
    labelDE: "Chronische Erkrankungen & chronische Schmerzen",
    iconName: "Stethoscope",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
    mappedSpecialties: ["psychosomatic"],
    subcategories: [
      {
        id: "organic_chronic",
        labelDE: "Organisch bedingte chronische Erkrankungen",
        parentCategoryId: "chronic_illness",
        symptomQuestions: [
          { id: "chron_org_q1", textDE: "Wurde bei dir eine chronische Erkrankung diagnostiziert?", order: 1 },
          { id: "chron_org_q2", textDE: "Hast du das Gefühl, dass deine Erkrankung deine Lebensqualität mindert?", order: 2 },
          { id: "chron_org_q3", textDE: "Hast du regelmäßig körperliche Beschwerden durch die Erkrankung?", order: 3 },
          { id: "chron_org_q4", textDE: "Fühlst du dich aufgrund der Erkrankung oft traurig, niedergeschlagen oder ängstlich?", order: 4 },
        ],
      },
      {
        id: "chronic_pain",
        labelDE: "Chronische Schmerzen",
        parentCategoryId: "chronic_illness",
        symptomQuestions: [
          { id: "chron_pain_q1", textDE: "Sind die Schmerzen häufig oder dauerhaft vorhanden und schon länger als 3 Monate vorhanden?", order: 1 },
          { id: "chron_pain_q2", textDE: "Treten die Schmerzen unabhängig von körperlicher Belastung auf?", order: 2 },
          { id: "chron_pain_q3", textDE: "Fühlst du dich wegen der Schmerzen oft traurig, niedergeschlagen oder ängstlich?", order: 3 },
          { id: "chron_pain_q4", textDE: "Beeinträchtigen die Schmerzen deine Fähigkeit, alltägliche Aufgaben zu erledigen?", order: 4 },
        ],
      },
      {
        id: "autoimmune",
        labelDE: "Autoimmunerkrankungen",
        parentCategoryId: "chronic_illness",
        symptomQuestions: [
          { id: "chron_auto_q1", textDE: "Fühlst du dich durch die Erkrankung im Alltag eingeschränkt?", order: 1 },
          { id: "chron_auto_q2", textDE: "Hast du das Gefühl, dass die Erkrankung deine Lebensqualität beeinträchtigt?", order: 2 },
          { id: "chron_auto_q3", textDE: "Hast du regelmäßig körperliche Beschwerden fühlst dich müde oder erschöpft durch die Autoimmunerkrankung?", order: 3 },
          { id: "chron_auto_q4", textDE: "Fühlst du dich wegen der Erkrankung oft traurig, niedergeschlagen oder ängstlich?", order: 4 },
        ],
      },
      {
        id: "chronic_mental",
        labelDE: "Chronische psychische Erkrankungen",
        parentCategoryId: "chronic_illness",
        symptomQuestions: [
          { id: "chron_mental_q1", textDE: "Wurde bei dir eine chronische psychische Erkrankung diagnostiziert die schon länger als 6 Monate besteht?", order: 1 },
          { id: "chron_mental_q2", textDE: "Hast du das Gefühl, dass die Erkrankung deinen Alltag beeinflusst?", order: 2 },
          { id: "chron_mental_q3", textDE: "Fühlst du dich oft traurig, niedergeschlagen oder ängstlich?", order: 3 },
          { id: "chron_mental_q4", textDE: "Beeinträchtigt die Erkrankung deine Beziehungen zu Familie oder Freund*innen?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 18. Migration und Kultur
  // -------------------------------------------------------------------------
  {
    id: "migration_culture",
    labelDE: "Migration und Kultur",
    iconName: "Globe",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",
    mappedSpecialties: ["migration"],
    subcategories: [
      {
        id: "migration_adaptation",
        labelDE: "Schwierigkeiten in der Migration (Anpassung, Kultur und Religion)",
        parentCategoryId: "migration_culture",
        symptomQuestions: [
          { id: "migr_adapt_q1", textDE: "Fällt es dir schwer, dich an die neue Umgebung oder Kultur anzupassen?", order: 1 },
          { id: "migr_adapt_q2", textDE: "Fühlst du dich aufgrund kultureller Unterschiede oft missverstanden?", order: 2 },
          { id: "migr_adapt_q3", textDE: "Fühlst du dich in der neuen Umgebung oft unsicher oder fehl am Platz?", order: 3 },
          { id: "migr_adapt_q4", textDE: "Hast du das Gefühl, dass dein Alltag durch die Migration belastender geworden ist?", order: 4 },
        ],
      },
      {
        id: "cultural_identity",
        labelDE: "Kulturelle identitätsbezogene Schwierigkeiten (Entfremdung, Identität)",
        parentCategoryId: "migration_culture",
        symptomQuestions: [
          { id: "migr_ident_q1", textDE: "Hast du das Gefühl, dass du weder zur Herkunftskultur noch zur neuen Kultur vollständig gehörst?", order: 1 },
          { id: "migr_ident_q2", textDE: "Erlebst du Konflikte zwischen kulturellen Werten oder Normen verschiedener Lebensbereiche?", order: 2 },
          { id: "migr_ident_q3", textDE: "Fühlst du dich \"hin- und hergerissen\" zwischen zwei oder mehr Kulturen?", order: 3 },
          { id: "migr_ident_q4", textDE: "Hast du das Gefühl, nicht vollständig in der Gesellschaft oder Gemeinschaft akzeptiert zu sein und fühlst dich isoliert?", order: 4 },
        ],
      },
      {
        id: "family_culture",
        labelDE: "Familiäre Schwierigkeiten in Bezug auf Kultur (Trennung von Familie, Konflikte bei der Integration)",
        parentCategoryId: "migration_culture",
        symptomQuestions: [
          { id: "migr_fam_q1", textDE: "Lebst du derzeit getrennt von deiner Familie aufgrund von Migration oder Umzug und das belastet dich stark?", order: 1 },
          { id: "migr_fam_q2", textDE: "Fühlst du dich einsam oder isoliert durch die Trennung von deiner Familie und das macht dir Sorgen?", order: 2 },
          { id: "migr_fam_q3", textDE: "Erlebst du Spannungen zwischen deinen eigenen Anpassungsbemühungen und den Erwartungen der Familie?", order: 3 },
          { id: "migr_fam_q4", textDE: "Gibt es Konflikte in deiner Familie wegen unterschiedlicher kultureller Werte oder Traditionen?", order: 4 },
        ],
      },
      {
        id: "social_intercultural",
        labelDE: "Soziale, interkulturelle Probleme (Sprache, Schule, Sexualität etc.)",
        parentCategoryId: "migration_culture",
        symptomQuestions: [
          { id: "migr_social_q1", textDE: "Fällt es dir schwer, die Sprache des neuen Landes zu verstehen oder zu sprechen und das macht dir Sorgen?", order: 1 },
          { id: "migr_social_q2", textDE: "Hast du Schwierigkeiten, den schulischen oder beruflichen Anforderungen im neuen Land zu folgen?", order: 2 },
          { id: "migr_social_q3", textDE: "Fühlst du dich im Unterricht oder bei der Arbeit unsicher wegen kultureller Unterschiede?", order: 3 },
          { id: "migr_social_q4", textDE: "Fällt es dir schwer, Freundschaften oder soziale Kontakte im neuen Land aufzubauen?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 19. Mobbing und Diskriminierung
  // -------------------------------------------------------------------------
  {
    id: "bullying_discrimination",
    labelDE: "Mobbing und Diskriminierung",
    iconName: "UserX",
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
    mappedSpecialties: ["trauma", "identity"],
    subcategories: [
      {
        id: "mobbing_work_school",
        labelDE: "Mobbing in Schule oder Arbeit",
        parentCategoryId: "bullying_discrimination",
        symptomQuestions: [
          { id: "mob_work_q1", textDE: "Fühlst du dich durch das Verhalten von Schul- oder ArbeitskollegInnen oft gestresst oder angespannt?", order: 1 },
          { id: "mob_work_q2", textDE: "Fühlst du dich traurig oder niedergeschlagen wegen Mobbing innerhalb der Schule oder Arbeit?", order: 2 },
          { id: "mob_work_q3", textDE: "Fühlst du dich hilflos oder ohnmächtig bei Konflikten in der Arbeit oder Schule?", order: 3 },
          { id: "mob_work_q4", textDE: "Vermeidest du bestimmte Treffen oder Sitzungen, um Mobbing zu umgehen?", order: 4 },
        ],
      },
      {
        id: "mobbing_family",
        labelDE: "Mobbing in der Familie oder Freunden",
        parentCategoryId: "bullying_discrimination",
        symptomQuestions: [
          { id: "mob_fam_q1", textDE: "Fühlst du dich durch das Verhalten von Familienmitgliedern oft gestresst oder angespannt?", order: 1 },
          { id: "mob_fam_q2", textDE: "Fühlst du dich traurig oder niedergeschlagen wegen Mobbing innerhalb der Familie?", order: 2 },
          { id: "mob_fam_q3", textDE: "Fühlst du dich hilflos oder ohnmächtig in familiären Konflikten?", order: 3 },
          { id: "mob_fam_q4", textDE: "Vermeidest du bestimmte Familienangelegenheiten oder Treffen, um Mobbing zu umgehen?", order: 4 },
        ],
      },
      {
        id: "discrimination_personal",
        labelDE: "Diskriminierung aufgrund Alter, Geschlecht, ethnischer Herkunft etc.",
        parentCategoryId: "bullying_discrimination",
        symptomQuestions: [
          { id: "discr_pers_q1", textDE: "Fühlst du dich durch subtile oder versteckte Diskriminierung gestresst oder angespannt?", order: 1 },
          { id: "discr_pers_q2", textDE: "Fühlst du dich niedergeschlagen oder traurig, weil du diskriminiert wurdest?", order: 2 },
          { id: "discr_pers_q3", textDE: "Fühlst du dich hilflos oder ohnmächtig, wenn du Diskriminierung erfährst?", order: 3 },
          { id: "discr_pers_q4", textDE: "Vermeidest du bestimmte Situationen oder Orte, um Diskriminierung zu umgehen?", order: 4 },
        ],
      },
      {
        id: "discrimination_structural",
        labelDE: "Diskriminierung aufgrund von Bildung, Institutionen etc.",
        parentCategoryId: "bullying_discrimination",
        symptomQuestions: [
          { id: "discr_struct_q1", textDE: "Fühlst du dich durch indirekte oder strukturelle Diskriminierung gestresst oder angespannt?", order: 1 },
          { id: "discr_struct_q2", textDE: "Fühlst du dich hilflos oder ohnmächtig gegenüber struktureller Benachteiligung?", order: 2 },
          { id: "discr_struct_q3", textDE: "Machst du dir Sorgen, dass indirekte Diskriminierung deine Chancen oder Möglichkeiten einschränkt?", order: 3 },
          { id: "discr_struct_q4", textDE: "Hast du Schwierigkeiten, über Benachteiligung oder Ungerechtigkeit zu sprechen oder dich zu wehren?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 20. Genderidentität & Sexuelle Orientierung
  // -------------------------------------------------------------------------
  {
    id: "gender_sexuality",
    labelDE: "Genderidentität & Sexuelle Orientierung",
    iconName: "Rainbow",
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop",
    mappedSpecialties: ["lgbtq", "identity"],
    subcategories: [
      {
        id: "sexual_orientation",
        labelDE: "Sexuelle Orientierung (Hetero, Homo, Bi, Pan etc.)",
        parentCategoryId: "gender_sexuality",
        symptomQuestions: [
          { id: "gender_orient_q1", textDE: "Fühlst du inneren Stress oder Unsicherheit wegen deiner sexuellen Orientierung?", order: 1 },
          { id: "gender_orient_q2", textDE: "Hast du Schwierigkeiten, deine sexuelle Orientierung zu akzeptieren?", order: 2 },
          { id: "gender_orient_q3", textDE: "Erlebst du Gefühle von Schuld oder Scham in Bezug auf deine sexuelle Orientierung?", order: 3 },
          { id: "gender_orient_q4", textDE: "Hast du Schwierigkeiten, über deine sexuelle Orientierung mit Familie oder Freunden zu sprechen?", order: 4 },
        ],
      },
      {
        id: "gender_identity",
        labelDE: "Gender Identität (Cis, Trans, Non-Binary etc.)",
        parentCategoryId: "gender_sexuality",
        symptomQuestions: [
          { id: "gender_ident_q1", textDE: "Fühlst du inneren Stress oder Unwohlsein wegen deiner Genderidentität?", order: 1 },
          { id: "gender_ident_q2", textDE: "Hast du das Gefühl, dass deine Genderidentität im Widerspruch zu gesellschaftlichen Erwartungen steht?", order: 2 },
          { id: "gender_ident_q3", textDE: "Fühlst du dich traurig oder niedergeschlagen wegen deiner Genderidentität?", order: 3 },
          { id: "gender_ident_q4", textDE: "Hast du Angst, dass andere deine Genderidentität nicht akzeptieren oder anerkennen?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 21. Kinderwunsch, Schwangerschaft, Geburt
  // -------------------------------------------------------------------------
  {
    id: "fertility_pregnancy",
    labelDE: "Kinderwunsch, Schwangerschaft, Geburt",
    iconName: "Baby",
    imageUrl: "https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=400&h=300&fit=crop",
    mappedSpecialties: ["family"],
    subcategories: [
      {
        id: "fertility",
        labelDE: "Kinderwunsch",
        parentCategoryId: "fertility_pregnancy",
        symptomQuestions: [
          { id: "fert_wish_q1", textDE: "Fühlst du dich traurig oder niedergeschlagen, wenn es mit dem Kinderwunsch nicht klappt?", order: 1 },
          { id: "fert_wish_q2", textDE: "Fühlst du dich durch den Kinderwunsch im Alltag gestresst?", order: 2 },
          { id: "fert_wish_q3", textDE: "Gibt es Konflikte mit deinem Partner aufgrund des Kinderwunsches?", order: 3 },
          { id: "fert_wish_q4", textDE: "Hast du manchmal das Gefühl von Schuld oder Versagen wegen des Kinderwunsches?", order: 4 },
        ],
      },
      {
        id: "pregnancy",
        labelDE: "Schwangerschaft",
        parentCategoryId: "fertility_pregnancy",
        symptomQuestions: [
          { id: "fert_preg_q1", textDE: "Fühlst du dich oft traurig, niedergeschlagen oder hast starke Stimmungsschwankungen während der Schwangerschaft?", order: 1 },
          { id: "fert_preg_q2", textDE: "Fühlst du dich überfordert von den Veränderungen in deinem Körper oder Alltag?", order: 2 },
          { id: "fert_preg_q3", textDE: "Machen dir Gedanken über die Geburt oder die Zukunft als Elternteil Stress?", order: 3 },
          { id: "fert_preg_q4", textDE: "Sorgst du dich über Komplikationen bei Geburt oder über die Gesundheit deines Babys?", order: 4 },
        ],
      },
      {
        id: "birth",
        labelDE: "Geburt",
        parentCategoryId: "fertility_pregnancy",
        symptomQuestions: [
          { id: "fert_birth_q1", textDE: "Hast du Angst vor Schmerzen oder Komplikationen während der Geburt?", order: 1 },
          { id: "fert_birth_q2", textDE: "Hast du Angst, die Kontrolle zu verlieren oder dass etwas schiefgeht?", order: 2 },
          { id: "fert_birth_q3", textDE: "Machst du dir Sorgen, wie du mit der Geburtssituation umgehen wirst?", order: 3 },
          { id: "fert_birth_q4", textDE: "Hast du wiederkehrende Gedanken oder Grübeleien über die Geburt und machen dich diese nervös?", order: 4 },
        ],
      },
      {
        id: "postnatal_depression",
        labelDE: "Postnatale Depression",
        parentCategoryId: "fertility_pregnancy",
        symptomQuestions: [
          { id: "fert_postnatal_q1", textDE: "Fühlst du dich seit der Geburt oft traurig oder niedergeschlagen?", order: 1 },
          { id: "fert_postnatal_q2", textDE: "Fühlst du dich überwältigt, gestresst oder hilflos im Umgang mit deinem Baby?", order: 2 },
          { id: "fert_postnatal_q3", textDE: "Hast du Angst, als Elternteil nicht gut genug zu sein?", order: 3 },
          { id: "fert_postnatal_q4", textDE: "Belastet die Geburt oder die Elternrolle eure Partnerschaft?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 22. Aufmerksamkeitsthemen
  // -------------------------------------------------------------------------
  {
    id: "attention",
    labelDE: "Aufmerksamkeitsthemen",
    iconName: "Focus",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
    mappedSpecialties: ["adhd"],
    subcategories: [
      {
        id: "add",
        labelDE: "ADS",
        parentCategoryId: "attention",
        symptomQuestions: [
          { id: "att_add_q1", textDE: "Hast du Schwierigkeiten, bei Aufgaben oder Gesprächen aufmerksam zu bleiben?", order: 1 },
          { id: "att_add_q2", textDE: "Vergisst du häufig Termine, Aufgaben oder Gegenstände?", order: 2 },
          { id: "att_add_q3", textDE: "Fällt es dir schwer, Aufgaben zu planen oder zu organisieren?", order: 3 },
          { id: "att_add_q4", textDE: "Hast du Probleme, Ordnung in Haushalt, Arbeit oder Studium zu halten?", order: 4 },
        ],
      },
      {
        id: "adhd",
        labelDE: "ADHS",
        parentCategoryId: "attention",
        symptomQuestions: [
          { id: "att_adhd_q1", textDE: "Hast du Schwierigkeiten, dich über längere Zeit auf Aufgaben zu konzentrieren?", order: 1 },
          { id: "att_adhd_q2", textDE: "Fühlst du dich häufig innerlich unruhig oder getrieben?", order: 2 },
          { id: "att_adhd_q3", textDE: "Hast du Schwierigkeiten, längere Zeit still zu sitzen?", order: 3 },
          { id: "att_adhd_q4", textDE: "Triffst du häufig schnelle Entscheidungen, ohne die Folgen abzuschätzen?", order: 4 },
        ],
      },
      {
        id: "adult_adhd",
        labelDE: "Adultes",
        parentCategoryId: "attention",
        symptomQuestions: [
          { id: "att_adult_q1", textDE: "Fällt es dir schwer, bei der Arbeit oder bei Projekten über längere Zeit konzentriert zu bleiben?", order: 1 },
          { id: "att_adult_q2", textDE: "Fühlst du dich innerlich häufig unruhig oder getrieben?", order: 2 },
          { id: "att_adult_q3", textDE: "Fällt es dir schwer, Impulse im Alltag zu bremsen (z.B. beim Einkaufen, Autofahren oder Arbeiten)?", order: 3 },
          { id: "att_adult_q4", textDE: "Hast du Probleme, Ordnung in Wohnung, Arbeit oder Finanzen zu halten?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 23. Autismus Spektrum
  // -------------------------------------------------------------------------
  {
    id: "autism_spectrum",
    labelDE: "Autismus Spektrum",
    iconName: "Puzzle",
    imageUrl: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop",
    mappedSpecialties: ["autism"],
    subcategories: [
      {
        id: "early_childhood_autism",
        labelDE: "Frühkindlicher Autismus (Kanner-Autismus)",
        parentCategoryId: "autism_spectrum",
        symptomQuestions: [
          { id: "aut_kanner_q1", textDE: "Hat dein Kind Schwierigkeiten, Blickkontakt herzustellen oder aufrechtzuerhalten?", order: 1 },
          { id: "aut_kanner_q2", textDE: "Zeigt dein Kind selten Freude oder emotionale Reaktionen anderen gegenüber?", order: 2 },
          { id: "aut_kanner_q3", textDE: "Spricht dein Kind deutlich verspätet oder gar nicht?", order: 3 },
          { id: "aut_kanner_q4", textDE: "Besteht dein Kind auf festen Routinen oder Ritualen und reagiert stark auf Veränderungen?", order: 4 },
        ],
      },
      {
        id: "asperger",
        labelDE: "Asperger-Syndrom",
        parentCategoryId: "autism_spectrum",
        symptomQuestions: [
          { id: "aut_asp_q1", textDE: "Fällt es dir schwer, Blickkontakt zu halten oder Körpersprache anderer zu lesen?", order: 1 },
          { id: "aut_asp_q2", textDE: "Fällt es dir schwer, Freundschaften zu knüpfen oder aufrechtzuerhalten oder fühlst du dich in Gruppen oft unsicher?", order: 2 },
          { id: "aut_asp_q3", textDE: "Sprichst du sehr direkt oder wortwörtlich, ohne versteckte Bedeutungen zu erkennen oder hast du Probleme bei Small-Talk?", order: 3 },
          { id: "aut_asp_q4", textDE: "Hast du sehr intensive Interessen oder Spezialgebiete, in denen du dich stark vertiefst?", order: 4 },
        ],
      },
      {
        id: "atypical_autism",
        labelDE: "Atypischer Autismus / PDD-NOS",
        parentCategoryId: "autism_spectrum",
        symptomQuestions: [
          { id: "aut_atyp_q1", textDE: "Hast du manchmal Probleme, soziale Signale wie Mimik oder Gestik richtig zu deuten?", order: 1 },
          { id: "aut_atyp_q2", textDE: "Nutzt du selten Gestik oder Mimik zur Unterstützung deiner Kommunikation?", order: 2 },
          { id: "aut_atyp_q3", textDE: "Reagierst du manchmal gestresst auf Veränderungen in Abläufen oder Plänen?", order: 3 },
          { id: "aut_atyp_q4", textDE: "Bist du empfindlich gegenüber Geräuschen, Licht, Berührungen oder Gerüchen?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 24. Tic-Störungen
  // -------------------------------------------------------------------------
  {
    id: "tic_disorders",
    labelDE: "Tic-Störungen",
    iconName: "Zap",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    mappedSpecialties: ["children", "adhd"],
    subcategories: [
      {
        id: "transient_tics",
        labelDE: "Vorübergehende Tic-Störung",
        parentCategoryId: "tic_disorders",
        symptomQuestions: [
          { id: "tic_trans_q1", textDE: "Bestehen die Tics seit weniger als 12 Monaten und treten zeitweilig oder in Schüben auf?", order: 1 },
          { id: "tic_trans_q2", textDE: "Hast du plötzliche, schnelle Bewegungen wie Blinzeln, Grimassieren oder Schulterzucken bemerkt?", order: 2 },
          { id: "tic_trans_q3", textDE: "Treten die Tics besonders unter Stress, Aufregung oder Müdigkeit auf?", order: 3 },
          { id: "tic_trans_q4", textDE: "Beeinträchtigen die Tics deine Aktivitäten oder sozialen Kontakte nur geringfügig?", order: 4 },
        ],
      },
      {
        id: "chronic_tics",
        labelDE: "Chronische motorische oder vokale Tic-Störung",
        parentCategoryId: "tic_disorders",
        symptomQuestions: [
          { id: "tic_chron_q1", textDE: "Hattest du eine Phase von mindestens 12 Monaten mit kontinuierlichen Tics und treten die Tics in Schüben auf?", order: 1 },
          { id: "tic_chron_q2", textDE: "Hast du wiederholte, unwillkürliche Bewegungen (motorische Tics), wie Blinzeln, Grimassieren oder Schulterzucken?", order: 2 },
          { id: "tic_chron_q3", textDE: "Machst du unwillkürliche Geräusche oder Laute (vokale Tics), wie Räuspern, Schnaufen oder kurze Laute?", order: 3 },
          { id: "tic_chron_q4", textDE: "Hast du nur motorische oder nur vokale Tics, aber nicht beides gleichzeitig?", order: 4 },
        ],
      },
      {
        id: "tourette",
        labelDE: "Tourette-Syndrom",
        parentCategoryId: "tic_disorders",
        symptomQuestions: [
          { id: "tic_tour_q1", textDE: "Hast du sowohl motorische als auch vokale Tics, die seit mindestens einem Jahr bestehen?", order: 1 },
          { id: "tic_tour_q2", textDE: "Wechseln Art, Häufigkeit oder Intensität deiner Tics im Laufe der Zeit?", order: 2 },
          { id: "tic_tour_q3", textDE: "Beeinträchtigen die Tics deinen Alltag, deine Arbeit oder sozialen Kontakte erheblich?", order: 3 },
          { id: "tic_tour_q4", textDE: "Hast du Schwierigkeiten, die Tics in bestimmten Situationen zu unterdrücken?", order: 4 },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // CRISIS CATEGORY - Triggers crisis screen immediately
  // -------------------------------------------------------------------------
  {
    id: "crisis",
    labelDE: "Suizid, akute Selbstverletzung, Fremdgefährdung",
    iconName: "AlertOctagon",
    imageUrl: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=400&h=300&fit=crop",
    isCrisis: true,
    mappedSpecialties: [],
    subcategories: [], // No subcategories - immediately shows crisis screen
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get category by ID
 */
export function getCategoryById(id: string): WizardCategory | undefined {
  return WIZARD_CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Get subcategory by ID
 */
export function getSubcategoryById(id: string): WizardSubcategory | undefined {
  for (const category of WIZARD_CATEGORIES) {
    const subcategory = category.subcategories.find((sub) => sub.id === id);
    if (subcategory) return subcategory;
  }
  return undefined;
}

/**
 * Get all subcategories for a category
 */
export function getSubcategoriesForCategory(categoryId: string): WizardSubcategory[] {
  const category = getCategoryById(categoryId);
  return category?.subcategories || [];
}

/**
 * Check if category is a crisis category
 */
export function isCrisisCategory(categoryId: string): boolean {
  const category = getCategoryById(categoryId);
  return category?.isCrisis === true;
}

/**
 * Get symptom questions for a subcategory
 */
export function getSymptomQuestions(subcategoryId: string): SymptomQuestion[] {
  const subcategory = getSubcategoryById(subcategoryId);
  return subcategory?.symptomQuestions || [];
}

/**
 * Calculate severity score from symptom answers (0-12)
 * Only includes answered questions
 */
export function calculateSeverityScore(answers: {
  q1: SeverityLevel | null;
  q2?: SeverityLevel | null;
  q3?: SeverityLevel | null;
  q4: SeverityLevel | null;
}): number {
  let score = 0;
  if (answers.q1 !== null) score += answers.q1;
  if (answers.q2 !== null && answers.q2 !== undefined) score += answers.q2;
  if (answers.q3 !== null && answers.q3 !== undefined) score += answers.q3;
  if (answers.q4 !== null) score += answers.q4;
  return score;
}

/**
 * Determine if adaptive mode should show full questions
 * Full mode: Q1 >= 2 -> show Q2, Q3, Q4
 * Short mode: Q1 <= 1 -> show only Q4
 */
export function shouldShowFullQuestions(q1Answer: SeverityLevel | null): boolean {
  if (q1Answer === null) return false;
  return q1Answer >= 2;
}

/**
 * Get mapped specialties for a category
 */
export function getSpecialtiesForCategory(categoryId: string): Specialty[] {
  const category = getCategoryById(categoryId);
  return category?.mappedSpecialties || [];
}

/**
 * Get all non-crisis categories
 */
export function getNonCrisisCategories(): WizardCategory[] {
  return WIZARD_CATEGORIES.filter((cat) => !cat.isCrisis);
}

/**
 * Get crisis category
 */
export function getCrisisCategory(): WizardCategory | undefined {
  return WIZARD_CATEGORIES.find((cat) => cat.isCrisis);
}

/**
 * Get label for a category ID (German)
 */
export function getCategoryLabel(categoryId: string): string {
  const category = getCategoryById(categoryId);
  return category?.labelDE || categoryId;
}

/**
 * Get label for a subcategory ID (German)
 */
export function getSubcategoryLabel(subcategoryId: string): string {
  const subcategory = getSubcategoryById(subcategoryId);
  return subcategory?.labelDE || subcategoryId;
}
