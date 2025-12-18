import type { Therapist, BlogPost } from "@/types/therapist";

export const demoTherapists: Therapist[] = [
  {
    id: "1",
    slug: "dr-maria-schneider",
    name: "Dr. Maria Schneider",
    title: "Psychologische Psychotherapeutin",
    imageUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    specializations: ["depression", "anxiety", "burnout"],
    therapyTypes: ["cbt", "humanistic"],
    languages: ["de", "en"],
    location: { city: "Berlin", postalCode: "10115" },
    pricePerSession: 120,
    rating: 4.9,
    reviewCount: 47,
    shortDescription:
      "Spezialisiert auf Depressionen und Angststörungen mit über 15 Jahren Erfahrung. Einfühlsame Begleitung in schwierigen Lebensphasen.",
    sessionType: "both",
    insurance: ["public", "private"],
    availability: "this_week",
    gender: "female",
  },
  {
    id: "2",
    slug: "thomas-weber",
    name: "Thomas Weber",
    title: "Psychotherapeut (HPG)",
    imageUrl:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    specializations: ["trauma", "relationships", "addiction"],
    therapyTypes: ["psychoanalysis", "systemic"],
    languages: ["de", "tr"],
    location: { city: "München", postalCode: "80331" },
    pricePerSession: 100,
    rating: 4.7,
    reviewCount: 32,
    shortDescription:
      "Traumatherapie und Beziehungsberatung in vertrauensvoller Atmosphäre. Spezialisiert auf EMDR und tiefenpsychologische Verfahren.",
    sessionType: "in_person",
    insurance: ["private"],
    availability: "flexible",
    gender: "male",
  },
  {
    id: "3",
    slug: "dr-sarah-klein",
    name: "Dr. Sarah Klein",
    title: "Fachärztin für Psychiatrie und Psychotherapie",
    imageUrl:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
    specializations: ["adhd", "eating_disorders", "anxiety"],
    therapyTypes: ["cbt", "gestalt"],
    languages: ["de", "en", "ar"],
    location: { city: "Hamburg", postalCode: "20095" },
    pricePerSession: 140,
    rating: 4.8,
    reviewCount: 56,
    shortDescription:
      "Ganzheitliche Behandlung von ADHS und Essstörungen. Kombination aus medikamentöser Therapie und Psychotherapie möglich.",
    sessionType: "both",
    insurance: ["public", "private"],
    availability: "immediately",
    gender: "female",
  },
  {
    id: "4",
    slug: "michael-hoffmann",
    name: "Michael Hoffmann",
    title: "Psychologischer Psychotherapeut",
    imageUrl:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
    specializations: ["burnout", "depression", "relationships"],
    therapyTypes: ["systemic", "humanistic"],
    languages: ["de"],
    location: { city: "Frankfurt", postalCode: "60311" },
    pricePerSession: 110,
    rating: 4.6,
    reviewCount: 28,
    shortDescription:
      "Spezialist für Burnout-Prävention und berufsbezogene Krisen. Langjährige Erfahrung in der Arbeit mit Führungskräften.",
    sessionType: "online",
    insurance: ["private"],
    availability: "this_week",
    gender: "male",
  },
  {
    id: "5",
    slug: "dr-elena-petrova",
    name: "Dr. Elena Petrova",
    title: "Psychoanalytikerin",
    imageUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face",
    specializations: ["trauma", "anxiety", "depression"],
    therapyTypes: ["psychoanalysis"],
    languages: ["de", "en"],
    location: { city: "Köln", postalCode: "50667" },
    pricePerSession: 130,
    rating: 4.9,
    reviewCount: 41,
    shortDescription:
      "Tiefenpsychologisch fundierte Therapie mit Fokus auf frühe Bindungserfahrungen. Auch Langzeittherapie möglich.",
    sessionType: "in_person",
    insurance: ["public", "private"],
    availability: "flexible",
    gender: "female",
  },
  {
    id: "6",
    slug: "jan-fischer",
    name: "Jan Fischer",
    title: "Kinder- und Jugendlichenpsychotherapeut",
    imageUrl:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
    specializations: ["adhd", "anxiety", "trauma"],
    therapyTypes: ["cbt", "gestalt"],
    languages: ["de", "en"],
    location: { city: "Stuttgart", postalCode: "70173" },
    pricePerSession: 95,
    rating: 4.8,
    reviewCount: 63,
    shortDescription:
      "Spezialisiert auf die Arbeit mit Kindern und Jugendlichen. Spieltherapeutische Ansätze und Elternberatung.",
    sessionType: "both",
    insurance: ["public"],
    availability: "this_week",
    gender: "male",
  },
  {
    id: "7",
    slug: "lisa-mueller",
    name: "Lisa Müller",
    title: "Systemische Therapeutin",
    imageUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    specializations: ["relationships", "addiction", "burnout"],
    therapyTypes: ["systemic"],
    languages: ["de", "tr"],
    location: { city: "Düsseldorf", postalCode: "40213" },
    pricePerSession: 90,
    rating: 4.5,
    reviewCount: 24,
    shortDescription:
      "Systemische Einzel-, Paar- und Familientherapie. Lösungsorientierter Ansatz für nachhaltige Veränderungen.",
    sessionType: "both",
    insurance: ["private"],
    availability: "immediately",
    gender: "female",
  },
  {
    id: "8",
    slug: "dr-ahmed-hassan",
    name: "Dr. Ahmed Hassan",
    title: "Psychiater und Psychotherapeut",
    imageUrl:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
    specializations: ["depression", "anxiety", "trauma"],
    therapyTypes: ["cbt", "psychoanalysis"],
    languages: ["de", "ar", "en"],
    location: { city: "Berlin", postalCode: "10999" },
    pricePerSession: 150,
    rating: 4.7,
    reviewCount: 38,
    shortDescription:
      "Kultursensibler Ansatz mit besonderem Fokus auf interkulturelle Therapie. Medikamentöse Behandlung möglich.",
    sessionType: "both",
    insurance: ["public", "private"],
    availability: "this_week",
    gender: "male",
  },
  {
    id: "9",
    slug: "claudia-berger",
    name: "Claudia Berger",
    title: "Gestalttherapeutin",
    imageUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    specializations: ["eating_disorders", "relationships", "anxiety"],
    therapyTypes: ["gestalt", "humanistic"],
    languages: ["de"],
    location: { city: "Leipzig", postalCode: "04109" },
    pricePerSession: 85,
    rating: 4.6,
    reviewCount: 19,
    shortDescription:
      "Körperorientierte Gestalttherapie für ein ganzheitliches Wohlbefinden. Spezialisiert auf Essstörungen.",
    sessionType: "in_person",
    insurance: ["private"],
    availability: "flexible",
    gender: "female",
  },
  {
    id: "10",
    slug: "dr-robert-schuster",
    name: "Dr. Robert Schuster",
    title: "Verhaltenstherapeut",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    specializations: ["addiction", "depression", "adhd"],
    therapyTypes: ["cbt"],
    languages: ["de", "en"],
    location: { city: "Wien", postalCode: "1010" },
    pricePerSession: 135,
    rating: 4.8,
    reviewCount: 52,
    shortDescription:
      "Evidenzbasierte Verhaltenstherapie mit Schwerpunkt Suchterkrankungen. Auch Online-Intensivprogramme verfügbar.",
    sessionType: "online",
    insurance: ["private"],
    availability: "immediately",
    gender: "male",
  },
];

export const demoBlogPosts: BlogPost[] = [
  {
    id: "blog-1",
    title: "5 Anzeichen für Burnout und was Sie dagegen tun können",
    slug: "burnout-anzeichen-tipps",
    featuredImage:
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=450&fit=crop",
    excerpt:
      "Burnout ist mehr als nur Müdigkeit. Erfahren Sie, wie Sie die Warnsignale frühzeitig erkennen und welche Strategien wirklich helfen, bevor es zu spät ist.",
    author: {
      id: "1",
      name: "Dr. Maria Schneider",
      imageUrl:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    },
    category: "burnout",
    tags: ["Burnout", "Stressbewältigung", "Selbstfürsorge", "Prävention"],
    readingTimeMinutes: 8,
    publishedAt: "2024-12-01",
  },
  {
    id: "blog-2",
    title: "Angststörungen verstehen: Ein Leitfaden für Betroffene",
    slug: "angststoerungen-verstehen",
    featuredImage:
      "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&h=450&fit=crop",
    excerpt:
      "Angst ist eine natürliche Reaktion, doch wann wird sie zur Störung? Dieser Artikel erklärt die verschiedenen Formen und zeigt Wege aus der Angstspirale.",
    author: {
      id: "3",
      name: "Dr. Sarah Klein",
      imageUrl:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    },
    category: "anxiety",
    tags: ["Angststörung", "Panikattacken", "Therapie", "Selbsthilfe"],
    readingTimeMinutes: 12,
    publishedAt: "2024-11-28",
  },
  {
    id: "blog-3",
    title: "Trauma-Bewältigung im Alltag: Praktische Übungen",
    slug: "trauma-bewaeltigung-alltag",
    featuredImage:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=450&fit=crop",
    excerpt:
      "Nach einem traumatischen Erlebnis kann der Alltag zur Herausforderung werden. Diese bewährten Techniken helfen Ihnen, Schritt für Schritt zurück ins Leben zu finden.",
    author: {
      id: "2",
      name: "Thomas Weber",
      imageUrl:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    },
    category: "trauma",
    tags: ["Trauma", "PTBS", "Selbstregulation", "Achtsamkeit"],
    readingTimeMinutes: 10,
    publishedAt: "2024-11-25",
  },
  {
    id: "blog-4",
    title: "ADHS im Erwachsenenalter: Diagnose und Behandlung",
    slug: "adhs-erwachsene-diagnose",
    featuredImage:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop",
    excerpt:
      "ADHS betrifft nicht nur Kinder. Viele Erwachsene erhalten ihre Diagnose erst spät. Erfahren Sie mehr über Symptome, Diagnostik und moderne Behandlungsansätze.",
    author: {
      id: "3",
      name: "Dr. Sarah Klein",
      imageUrl:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    },
    category: "adhd",
    tags: ["ADHS", "Erwachsene", "Diagnose", "Konzentration"],
    readingTimeMinutes: 15,
    publishedAt: "2024-11-20",
  },
  {
    id: "blog-5",
    title: "Beziehungsprobleme lösen: Kommunikation als Schlüssel",
    slug: "beziehungsprobleme-kommunikation",
    featuredImage:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=450&fit=crop",
    excerpt:
      "Die meisten Beziehungsprobleme haben ihre Wurzel in mangelnder Kommunikation. Lernen Sie die wichtigsten Techniken für ein besseres Miteinander.",
    author: {
      id: "7",
      name: "Lisa Müller",
      imageUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    },
    category: "relationships",
    tags: ["Beziehung", "Kommunikation", "Paartherapie", "Konflikte"],
    readingTimeMinutes: 9,
    publishedAt: "2024-11-15",
  },
  {
    id: "blog-6",
    title: "Depression erkennen: Mehr als nur schlechte Laune",
    slug: "depression-erkennen-symptome",
    featuredImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop",
    excerpt:
      "Depression ist eine ernstzunehmende Erkrankung, die sich von normaler Traurigkeit unterscheidet. Dieser Artikel hilft bei der Unterscheidung und zeigt Behandlungsmöglichkeiten.",
    author: {
      id: "5",
      name: "Dr. Elena Petrova",
      imageUrl:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop&crop=face",
    },
    category: "depression",
    tags: ["Depression", "Symptome", "Behandlung", "Hilfe"],
    readingTimeMinutes: 11,
    publishedAt: "2024-11-10",
  },
  {
    id: "blog-7",
    title: "Essstörungen: Wenn Essen zur Qual wird",
    slug: "essstoerungen-verstehen",
    featuredImage:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop",
    excerpt:
      "Magersucht, Bulimie, Binge-Eating – Essstörungen haben viele Gesichter. Erfahren Sie, wie Sie Warnsignale erkennen und welche Hilfsangebote es gibt.",
    author: {
      id: "9",
      name: "Claudia Berger",
      imageUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    },
    category: "eating_disorders",
    tags: ["Essstörung", "Magersucht", "Bulimie", "Therapie"],
    readingTimeMinutes: 13,
    publishedAt: "2024-11-08",
  },
  {
    id: "blog-8",
    title: "Sucht überwinden: Der erste Schritt zur Freiheit",
    slug: "sucht-ueberwinden-erster-schritt",
    featuredImage:
      "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=800&h=450&fit=crop",
    excerpt:
      "Der Weg aus der Sucht beginnt mit dem Erkennen des Problems. Dieser Artikel zeigt Ihnen, wie Sie den ersten Schritt wagen und welche Unterstützung verfügbar ist.",
    author: {
      id: "10",
      name: "Dr. Robert Schuster",
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    category: "addiction",
    tags: ["Sucht", "Abhängigkeit", "Entwöhnung", "Selbsthilfe"],
    readingTimeMinutes: 10,
    publishedAt: "2024-11-05",
  },
  {
    id: "blog-9",
    title: "Besser schlafen: Tipps gegen Schlafstörungen",
    slug: "besser-schlafen-tipps",
    featuredImage:
      "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=450&fit=crop",
    excerpt:
      "Schlafprobleme belasten Körper und Psyche. Entdecken Sie bewährte Strategien für erholsamen Schlaf und wann professionelle Hilfe sinnvoll ist.",
    author: {
      id: "1",
      name: "Dr. Maria Schneider",
      imageUrl:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    },
    category: "depression",
    tags: ["Schlaf", "Schlafstörung", "Insomnie", "Schlafhygiene"],
    readingTimeMinutes: 7,
    publishedAt: "2024-11-02",
  },
  {
    id: "blog-10",
    title: "Selbstfürsorge lernen: Warum Sie sich selbst wichtig nehmen sollten",
    slug: "selbstfuersorge-lernen",
    featuredImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=450&fit=crop",
    excerpt:
      "Selbstfürsorge ist kein Luxus, sondern notwendig für die psychische Gesundheit. Praktische Tipps, wie Sie mehr auf sich selbst achten können.",
    author: {
      id: "7",
      name: "Lisa Müller",
      imageUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    },
    category: "burnout",
    tags: ["Selbstfürsorge", "Achtsamkeit", "Wohlbefinden", "Balance"],
    readingTimeMinutes: 6,
    publishedAt: "2024-10-30",
  },
  {
    id: "blog-11",
    title: "Panikattacken stoppen: Sofort-Hilfe für den Notfall",
    slug: "panikattacken-stoppen-soforthilfe",
    featuredImage:
      "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=800&h=450&fit=crop",
    excerpt:
      "Eine Panikattacke kann überwältigend sein. Lernen Sie Techniken, die Ihnen im akuten Moment helfen können, die Kontrolle zurückzugewinnen.",
    author: {
      id: "3",
      name: "Dr. Sarah Klein",
      imageUrl:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    },
    category: "anxiety",
    tags: ["Panikattacke", "Angst", "Soforthilfe", "Atemtechnik"],
    readingTimeMinutes: 5,
    publishedAt: "2024-10-28",
  },
  {
    id: "blog-12",
    title: "Familie und Konflikte: Wege zur besseren Kommunikation",
    slug: "familie-konflikte-kommunikation",
    featuredImage:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=450&fit=crop",
    excerpt:
      "Familiäre Konflikte belasten alle Beteiligten. Erfahren Sie, wie Sie konstruktiv streiten und zu Lösungen finden, die für alle funktionieren.",
    author: {
      id: "7",
      name: "Lisa Müller",
      imageUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face",
    },
    category: "relationships",
    tags: ["Familie", "Konflikte", "Kommunikation", "Systemisch"],
    readingTimeMinutes: 8,
    publishedAt: "2024-10-25",
  },
  {
    id: "blog-13",
    title: "Kindheitstrauma verarbeiten: Heilung ist möglich",
    slug: "kindheitstrauma-verarbeiten",
    featuredImage:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=450&fit=crop",
    excerpt:
      "Traumatische Erfahrungen in der Kindheit können das ganze Leben prägen. Doch mit der richtigen Unterstützung ist Heilung möglich.",
    author: {
      id: "5",
      name: "Dr. Elena Petrova",
      imageUrl:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop&crop=face",
    },
    category: "trauma",
    tags: ["Kindheitstrauma", "Heilung", "Therapie", "Inneres Kind"],
    readingTimeMinutes: 14,
    publishedAt: "2024-10-22",
  },
  {
    id: "blog-14",
    title: "Work-Life-Balance: So schaffen Sie den Ausgleich",
    slug: "work-life-balance-ausgleich",
    featuredImage:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=450&fit=crop",
    excerpt:
      "Die Balance zwischen Arbeit und Privatleben zu finden ist eine der größten Herausforderungen unserer Zeit. Praktische Strategien für mehr Gleichgewicht.",
    author: {
      id: "4",
      name: "Michael Hoffmann",
      imageUrl:
        "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face",
    },
    category: "burnout",
    tags: ["Work-Life-Balance", "Stress", "Grenzen setzen", "Zeitmanagement"],
    readingTimeMinutes: 9,
    publishedAt: "2024-10-18",
  },
  {
    id: "blog-15",
    title: "Achtsamkeitsübungen für den Alltag",
    slug: "achtsamkeitsuebungen-alltag",
    featuredImage:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&h=450&fit=crop",
    excerpt:
      "Achtsamkeit muss nicht kompliziert sein. Diese einfachen Übungen lassen sich problemlos in Ihren Alltag integrieren und verbessern Ihr Wohlbefinden.",
    author: {
      id: "9",
      name: "Claudia Berger",
      imageUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    },
    category: "anxiety",
    tags: ["Achtsamkeit", "Meditation", "Übungen", "Entspannung"],
    readingTimeMinutes: 6,
    publishedAt: "2024-10-15",
  },
  {
    id: "blog-16",
    title: "Digitale Sucht: Wenn das Smartphone zur Falle wird",
    slug: "digitale-sucht-smartphone",
    featuredImage:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop",
    excerpt:
      "Social Media, Gaming, ständige Erreichbarkeit – digitale Abhängigkeit ist ein wachsendes Problem. Erkennen Sie die Zeichen und finden Sie zurück zur Balance.",
    author: {
      id: "10",
      name: "Dr. Robert Schuster",
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    category: "addiction",
    tags: ["Digitale Sucht", "Smartphone", "Social Media", "Abhängigkeit"],
    readingTimeMinutes: 11,
    publishedAt: "2024-10-12",
  },
];
