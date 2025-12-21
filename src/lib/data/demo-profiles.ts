import type { TherapistProfileData, ThemeName } from "@/types/profile";

/**
 * Extended demo profiles for the profile page feature
 * All images are from Unsplash (open source)
 */
export const demoProfiles: Partial<TherapistProfileData>[] = [
  {
    id: "demo-1",
    slug: "dr-maria-schneider",
    userId: "user-1",
    name: "Dr. Maria Schneider",
    title: "Psychologische Psychotherapeutin",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    headline: "Ihre einfühlsame Begleitung auf dem Weg zu mehr Lebensfreude",
    shortDescription: "Spezialisiert auf Depressionen und Angststörungen mit über 15 Jahren Erfahrung. Einfühlsame Begleitung in schwierigen Lebensphasen.",
    longDescription: `Als Psychologische Psychotherapeutin begleite ich Sie mit Empathie und fachlicher Kompetenz auf Ihrem persönlichen Weg zu mehr Wohlbefinden und Lebensqualität.

In meiner über 15-jährigen Tätigkeit habe ich Menschen in verschiedensten Lebenssituationen unterstützt – sei es bei Depressionen, Angststörungen, Burnout oder in persönlichen Krisen. Mein Ansatz ist dabei stets individuell und ganzheitlich.

Ich glaube daran, dass jeder Mensch die Ressourcen in sich trägt, um Veränderungen zu bewirken. Meine Aufgabe sehe ich darin, diese Ressourcen gemeinsam mit Ihnen zu entdecken und zu stärken.

In einer vertrauensvollen Atmosphäre biete ich Ihnen einen sicheren Raum, in dem Sie sich öffnen und neue Perspektiven entwickeln können.`,

    // Location
    city: "Berlin",
    postalCode: "10115",
    street: "Friedrichstraße 123",
    practiceName: "Praxis für Psychotherapie Dr. Schneider",

    // Professional
    specializations: ["depression", "anxiety", "burnout"],
    specializationRanks: { depression: 1, anxiety: 2, burnout: 3 },
    therapyTypes: ["cbt", "humanistic"],
    therapySettings: ["individual", "group"],
    languages: ["de", "en"],
    insurance: ["public", "private"],

    // Qualifications
    education: [
      "Studium der Psychologie, Freie Universität Berlin (Diplom)",
      "Approbation als Psychologische Psychotherapeutin",
      "Weiterbildung Kognitive Verhaltenstherapie (DGVT)",
    ],
    certifications: [
      "Zertifizierte EMDR-Therapeutin (EMDRIA)",
      "Achtsamkeitsbasierte Stressreduktion (MBSR)",
      "Schematherapie (IST-Zertifikat)",
    ],
    memberships: [
      "Deutsche Gesellschaft für Psychologie (DGPs)",
      "Bundesverband Deutscher Psychologinnen und Psychologen (BDP)",
      "Deutsche Gesellschaft für Verhaltenstherapie (DGVT)",
    ],
    experienceYears: 15,

    // Pricing
    pricePerSession: 120,
    sessionType: "both",
    availability: "this_week",
    gender: "female",

    // Ratings
    rating: 4.9,
    reviewCount: 47,

    // Images - Open Source from Unsplash
    galleryImages: [
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800&h=600&fit=crop",
    ],
    officeImages: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
    ],

    // Contact
    phone: "+49 30 123 456 78",
    email: "kontakt@dr-schneider-psychotherapie.de",
    website: "https://dr-schneider-psychotherapie.de",
    linkedIn: "https://linkedin.com/in/dr-maria-schneider",
    instagram: "",

    // Theme
    themeColor: "#8B7355",
    themeName: "warm" as ThemeName,

    // Additional
    consultationInfo: `Das Erstgespräch dient dem gegenseitigen Kennenlernen und der Klärung Ihrer Anliegen.

Gemeinsam besprechen wir:
- Ihre aktuelle Situation und Ihre Beschwerden
- Ihre Ziele und Erwartungen an die Therapie
- Mögliche Therapieansätze und -methoden
- Organisatorisches (Termine, Kosten, Versicherung)

Das Erstgespräch ist unverbindlich und kostet 50€ (wird bei Folgebehandlung angerechnet).`,
    offersTrialSession: true,
    trialSessionPrice: 50,

    // Therapy Style
    communicationStyle: "empathetic",
    usesHomework: true,
    therapyFocus: "holistic",
    clientTalkRatio: 60,
    therapyDepth: "deep_change",

    // Account
    accountType: "premium",
    isVerified: true,
  },
  {
    id: "demo-2",
    slug: "thomas-weber",
    userId: "user-2",
    name: "Thomas Weber",
    title: "Psychotherapeut (HPG)",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    headline: "Traumasensible Begleitung für Ihren Heilungsweg",
    shortDescription: "Traumatherapie und Beziehungsberatung in vertrauensvoller Atmosphäre. Spezialisiert auf EMDR und tiefenpsychologische Verfahren.",
    longDescription: `Als Heilpraktiker für Psychotherapie habe ich mich auf die Behandlung von Traumata und Beziehungsproblemen spezialisiert.

Meine Arbeit basiert auf der Überzeugung, dass vergangene Erfahrungen uns prägen, aber nicht definieren müssen. Mit den richtigen Werkzeugen und einer vertrauensvollen therapeutischen Beziehung ist tiefgreifende Heilung möglich.

Ich arbeite vorwiegend mit EMDR (Eye Movement Desensitization and Reprocessing) und tiefenpsychologischen Methoden. Diese Kombination hat sich in meiner Praxis als besonders wirksam erwiesen.

In unserer gemeinsamen Arbeit ist mir eine respektvolle, wertschätzende Atmosphäre wichtig, in der Sie sich sicher fühlen können.`,

    // Location
    city: "München",
    postalCode: "80331",
    street: "Maximilianstraße 45",
    practiceName: "Praxis Weber - Traumatherapie München",

    // Professional
    specializations: ["trauma", "relationships", "addiction"],
    specializationRanks: { trauma: 1, relationships: 2, addiction: 3 },
    therapyTypes: ["psychoanalysis", "systemic"],
    therapySettings: ["individual", "couples"],
    languages: ["de", "tr"],
    insurance: ["private"],

    // Qualifications
    education: [
      "Heilpraktiker für Psychotherapie (HPG)",
      "Studium der Sozialpädagogik, LMU München",
      "Ausbildung Tiefenpsychologische Psychotherapie",
    ],
    certifications: [
      "EMDR-Therapeut (HAP Deutschland)",
      "Traumatherapie (DeGPT)",
      "Paartherapie (EFT-Zertifikat)",
    ],
    memberships: [
      "Deutsche Gesellschaft für Trauma und Dissoziation (DGTD)",
      "Verband Freier Psychotherapeuten (VFP)",
    ],
    experienceYears: 10,

    // Pricing
    pricePerSession: 100,
    sessionType: "in_person",
    availability: "flexible",
    gender: "male",

    // Ratings
    rating: 4.7,
    reviewCount: 32,

    // Images
    galleryImages: [
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop",
    ],
    officeImages: [
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop",
    ],

    // Contact
    phone: "+49 89 234 567 89",
    email: "praxis@thomasweber.de",
    website: "https://thomasweber-psychotherapie.de",
    linkedIn: "",
    instagram: "https://instagram.com/thomasweber.therapie",

    // Theme
    themeColor: "#5B7B8C",
    themeName: "cool" as ThemeName,

    // Additional
    consultationInfo: `In unserem ersten Gespräch möchte ich Sie kennenlernen und verstehen, was Sie zu mir führt.

Wir klären gemeinsam:
- Ihre Beschwerden und deren Geschichte
- Was Sie sich von einer Therapie erhoffen
- Ob wir zusammenarbeiten möchten

Das Erstgespräch ist für Sie kostenfrei.`,
    offersTrialSession: true,
    trialSessionPrice: 0,

    // Therapy Style
    communicationStyle: "balanced",
    usesHomework: false,
    therapyFocus: "past",
    clientTalkRatio: 50,
    therapyDepth: "deep_change",

    // Account
    accountType: "mittel",
    isVerified: true,
  },
  {
    id: "demo-3",
    slug: "dr-sarah-klein",
    userId: "user-3",
    name: "Dr. Sarah Klein",
    title: "Fachärztin für Psychiatrie und Psychotherapie",
    imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
    headline: "Ganzheitliche Behandlung für Körper und Seele",
    shortDescription: "Ganzheitliche Behandlung von ADHS und Essstörungen. Kombination aus medikamentöser Therapie und Psychotherapie möglich.",
    longDescription: `Als Fachärztin für Psychiatrie und Psychotherapie verbinde ich medizinisches Wissen mit psychotherapeutischer Expertise.

Mein Schwerpunkt liegt auf der Behandlung von ADHS im Erwachsenenalter und Essstörungen. Bei diesen Erkrankungen ist häufig ein ganzheitlicher Ansatz wichtig, der sowohl körperliche als auch seelische Aspekte berücksichtigt.

In meiner Praxis biete ich Ihnen eine umfassende Diagnostik und individuelle Behandlungsplanung. Je nach Bedarf kann die Behandlung rein psychotherapeutisch erfolgen oder durch medikamentöse Unterstützung ergänzt werden.

Mir ist wichtig, dass Sie als Patient*in informierte Entscheidungen treffen können. Deshalb nehme ich mir Zeit für ausführliche Aufklärung und gemeinsame Therapieplanung.`,

    // Location
    city: "Hamburg",
    postalCode: "20095",
    street: "Jungfernstieg 50",
    practiceName: "Psychiatrische Praxis Dr. Klein",

    // Professional
    specializations: ["adhd", "eating_disorders", "anxiety"],
    specializationRanks: { adhd: 1, eating_disorders: 2, anxiety: 3 },
    therapyTypes: ["cbt", "gestalt"],
    therapySettings: ["individual", "group"],
    languages: ["de", "en", "ar"],
    insurance: ["public", "private"],

    // Qualifications
    education: [
      "Studium der Medizin, Universität Hamburg",
      "Facharztausbildung Psychiatrie und Psychotherapie, UKE Hamburg",
      "Zusatzqualifikation Psychosomatische Medizin",
    ],
    certifications: [
      "ADHS-Spezialistin (DGPPN-Zertifikat)",
      "Essstörungstherapie (BZgA)",
      "DBT-Therapeutin (Linehan Institute)",
    ],
    memberships: [
      "Deutsche Gesellschaft für Psychiatrie und Psychotherapie (DGPPN)",
      "Ärztekammer Hamburg",
      "AG ADHS im Erwachsenenalter",
    ],
    experienceYears: 12,

    // Pricing
    pricePerSession: 140,
    sessionType: "both",
    availability: "immediately",
    gender: "female",

    // Ratings
    rating: 4.8,
    reviewCount: 56,

    // Images
    galleryImages: [
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop",
    ],
    officeImages: [
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop",
    ],

    // Contact
    phone: "+49 40 345 678 90",
    email: "praxis@dr-sarah-klein.de",
    website: "https://psychiatrie-hamburg-klein.de",
    linkedIn: "https://linkedin.com/in/dr-sarah-klein",
    instagram: "",

    // Theme
    themeColor: "#667EEA",
    themeName: "professional" as ThemeName,

    // Additional
    consultationInfo: `Im Erstgespräch führe ich eine ausführliche Anamnese durch und erstelle eine erste diagnostische Einschätzung.

Das Gespräch umfasst:
- Ihre Beschwerden und Krankengeschichte
- Diagnostische Einschätzung
- Besprechung möglicher Behandlungsoptionen
- Klärung organisatorischer Fragen

Das Erstgespräch dauert ca. 50 Minuten und wird über Ihre Krankenversicherung abgerechnet.`,
    offersTrialSession: false,
    trialSessionPrice: 0,

    // Therapy Style
    communicationStyle: "directive",
    usesHomework: true,
    therapyFocus: "present",
    clientTalkRatio: 40,
    therapyDepth: "flexible",

    // Account
    accountType: "premium",
    isVerified: true,
  },
  {
    id: "demo-4",
    slug: "lisa-mueller",
    userId: "user-7",
    name: "Lisa Müller",
    title: "Systemische Therapeutin",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    headline: "Lösungen finden – Beziehungen stärken",
    shortDescription: "Systemische Einzel-, Paar- und Familientherapie. Lösungsorientierter Ansatz für nachhaltige Veränderungen.",
    longDescription: `Als Systemische Therapeutin betrachte ich den Menschen immer im Kontext seiner Beziehungen und Systeme – sei es Familie, Partnerschaft oder Arbeitsumfeld.

Mein Ansatz ist lösungs- und ressourcenorientiert: Statt lange nach Problemen zu suchen, fokussieren wir auf das, was bereits funktioniert, und bauen darauf auf.

Besonders am Herzen liegt mir die Arbeit mit Paaren und Familien. Hier erlebe ich immer wieder, wie kraftvoll Veränderungen sein können, wenn alle Beteiligten einbezogen werden.

In Einzeltherapie arbeite ich ebenfalls systemisch – denn auch wenn Sie alleine kommen, sind Ihre Beziehungen immer "mit im Raum".`,

    // Location
    city: "Düsseldorf",
    postalCode: "40213",
    street: "Königsallee 92",
    practiceName: "Systemische Praxis Müller",

    // Professional
    specializations: ["relationships", "addiction", "burnout"],
    specializationRanks: { relationships: 1, burnout: 2, addiction: 3 },
    therapyTypes: ["systemic"],
    therapySettings: ["individual", "couples", "group"],
    languages: ["de", "tr"],
    insurance: ["private"],

    // Qualifications
    education: [
      "Studium Soziale Arbeit (B.A.), FH Düsseldorf",
      "Weiterbildung Systemische Therapie und Beratung (SG)",
      "Heilpraktikerin für Psychotherapie (HPG)",
    ],
    certifications: [
      "Systemische Therapeutin (DGSF)",
      "Systemische Paartherapeutin (DGSF)",
      "Supervisorin (SG)",
    ],
    memberships: [
      "Deutsche Gesellschaft für Systemische Therapie (DGSF)",
      "Systemische Gesellschaft (SG)",
    ],
    experienceYears: 8,

    // Pricing
    pricePerSession: 90,
    sessionType: "both",
    availability: "immediately",
    gender: "female",

    // Ratings
    rating: 4.5,
    reviewCount: 24,

    // Images
    galleryImages: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=600&fit=crop",
    ],
    officeImages: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop",
    ],

    // Contact
    phone: "+49 211 456 789 01",
    email: "kontakt@lisamueller-therapie.de",
    website: "https://systemische-therapie-duesseldorf.de",
    linkedIn: "",
    instagram: "https://instagram.com/lisamueller.systemisch",

    // Theme
    themeColor: "#6B8E5A",
    themeName: "nature" as ThemeName,

    // Additional
    consultationInfo: `Unser erstes Treffen dient dem Kennenlernen und der Auftragsklärung.

Wir besprechen:
- Was führt Sie zu mir?
- Was möchten Sie verändern?
- Was soll am Ende anders sein?
- Wie können wir zusammenarbeiten?

Das Erstgespräch kostet 80€ und dauert 60-90 Minuten.`,
    offersTrialSession: true,
    trialSessionPrice: 80,

    // Therapy Style
    communicationStyle: "balanced",
    usesHomework: true,
    therapyFocus: "future",
    clientTalkRatio: 55,
    therapyDepth: "flexible",

    // Account
    accountType: "mittel",
    isVerified: false,
  },
  {
    id: "demo-5",
    slug: "dr-elena-petrova",
    userId: "user-5",
    name: "Dr. Elena Petrova",
    title: "Psychoanalytikerin",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face",
    headline: "Den Wurzeln auf der Spur – für tiefgreifende Veränderung",
    shortDescription: "Tiefenpsychologisch fundierte Therapie mit Fokus auf frühe Bindungserfahrungen. Auch Langzeittherapie möglich.",
    longDescription: `Als Psychoanalytikerin arbeite ich tiefenpsychologisch fundiert mit dem Ziel, nicht nur Symptome zu lindern, sondern deren unbewusste Wurzeln zu verstehen und aufzulösen.

Meine Arbeit basiert auf der Überzeugung, dass viele unserer heutigen Probleme ihre Ursprünge in frühen Beziehungserfahrungen haben. In der therapeutischen Beziehung können diese Muster bewusst werden und sich verändern.

Ich biete sowohl Kurzzeit- als auch Langzeittherapie an. Die Dauer richtet sich nach Ihren individuellen Bedürfnissen und Zielen.

Mein Therapiestil ist einfühlsam und beziehungsorientiert. Ich glaube, dass Heilung vor allem durch eine sichere, vertrauensvolle therapeutische Beziehung geschieht.`,

    // Location
    city: "Köln",
    postalCode: "50667",
    street: "Domkloster 3",
    practiceName: "Psychoanalytische Praxis Dr. Petrova",

    // Professional
    specializations: ["trauma", "anxiety", "depression"],
    specializationRanks: { trauma: 1, depression: 2, anxiety: 3 },
    therapyTypes: ["psychoanalysis"],
    therapySettings: ["individual"],
    languages: ["de", "en"],
    insurance: ["public", "private"],

    // Qualifications
    education: [
      "Studium der Psychologie, Universität zu Köln (Diplom)",
      "Psychoanalytische Ausbildung (DPV)",
      "Promotion über Bindungsforschung",
    ],
    certifications: [
      "Psychoanalytikerin (DPV/IPA)",
      "Lehranalytikerin",
      "Traumatherapie (DeGPT)",
    ],
    memberships: [
      "Deutsche Psychoanalytische Vereinigung (DPV)",
      "International Psychoanalytical Association (IPA)",
      "Deutsche Gesellschaft für Trauma und Dissoziation",
    ],
    experienceYears: 20,

    // Pricing
    pricePerSession: 130,
    sessionType: "in_person",
    availability: "flexible",
    gender: "female",

    // Ratings
    rating: 4.9,
    reviewCount: 41,

    // Images
    galleryImages: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop",
    ],
    officeImages: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    ],

    // Contact
    phone: "+49 221 567 890 12",
    email: "praxis@dr-petrova.de",
    website: "https://psychoanalyse-koeln.de",
    linkedIn: "https://linkedin.com/in/dr-elena-petrova",
    instagram: "",

    // Theme
    themeColor: "#1A1A1A",
    themeName: "minimal" as ThemeName,

    // Additional
    consultationInfo: `Die ersten Stunden dienen der ausführlichen Diagnostik und dem Aufbau einer tragfähigen therapeutischen Beziehung.

In dieser Phase klären wir:
- Ihre Lebensgeschichte und aktuellen Beschwerden
- Die Entstehung Ihrer Problematik
- Ihre Therapiemotivation und -ziele
- Den Rahmen unserer Zusammenarbeit

Die Erstgespräche werden von der Krankenkasse übernommen.`,
    offersTrialSession: false,
    trialSessionPrice: 0,

    // Therapy Style
    communicationStyle: "empathetic",
    usesHomework: false,
    therapyFocus: "past",
    clientTalkRatio: 70,
    therapyDepth: "deep_change",

    // Account
    accountType: "premium",
    isVerified: true,
  },
];

/**
 * Get a demo profile by slug
 */
export function getDemoProfileBySlug(slug: string): Partial<TherapistProfileData> | undefined {
  return demoProfiles.find((p) => p.slug === slug);
}

/**
 * Get all demo profile slugs
 */
export function getAllDemoProfileSlugs(): string[] {
  return demoProfiles.map((p) => p.slug).filter((slug): slug is string => !!slug);
}
