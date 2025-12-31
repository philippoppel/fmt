import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Blog Categories for psychotherapeutic topics
const blogCategories = [
  {
    slug: 'depression',
    name: 'Depression',
    nameDE: 'Depression',
    nameEN: 'Depression',
    descriptionDE: 'Artikel über Depressionen, Symptome, Behandlung und Selbsthilfe',
    descriptionEN: 'Articles about depression, symptoms, treatment and self-help',
    sortOrder: 1,
  },
  {
    slug: 'anxiety',
    name: 'Anxiety',
    nameDE: 'Angststörungen',
    nameEN: 'Anxiety Disorders',
    descriptionDE: 'Informationen über Angststörungen, Panikattacken und deren Behandlung',
    descriptionEN: 'Information about anxiety disorders, panic attacks and their treatment',
    sortOrder: 2,
  },
  {
    slug: 'stress-burnout',
    name: 'Stress & Burnout',
    nameDE: 'Stress & Burnout',
    nameEN: 'Stress & Burnout',
    descriptionDE: 'Strategien zur Stressbewältigung und Burnout-Prävention',
    descriptionEN: 'Strategies for stress management and burnout prevention',
    sortOrder: 3,
  },
  {
    slug: 'relationships',
    name: 'Relationships',
    nameDE: 'Beziehungen',
    nameEN: 'Relationships',
    descriptionDE: 'Tipps für gesunde Beziehungen, Kommunikation und Paartherapie',
    descriptionEN: 'Tips for healthy relationships, communication and couples therapy',
    sortOrder: 4,
  },
  {
    slug: 'self-care',
    name: 'Self-Care',
    nameDE: 'Selbstfürsorge',
    nameEN: 'Self-Care',
    descriptionDE: 'Praktische Tipps für mentale Gesundheit und Wohlbefinden',
    descriptionEN: 'Practical tips for mental health and wellbeing',
    sortOrder: 5,
  },
  {
    slug: 'trauma',
    name: 'Trauma',
    nameDE: 'Trauma & PTBS',
    nameEN: 'Trauma & PTSD',
    descriptionDE: 'Verständnis und Heilung von traumatischen Erfahrungen',
    descriptionEN: 'Understanding and healing from traumatic experiences',
    sortOrder: 6,
  },
  {
    slug: 'therapy-methods',
    name: 'Therapy Methods',
    nameDE: 'Therapiemethoden',
    nameEN: 'Therapy Methods',
    descriptionDE: 'Übersicht verschiedener Therapieansätze und deren Wirksamkeit',
    descriptionEN: 'Overview of different therapy approaches and their effectiveness',
    sortOrder: 7,
  },
  {
    slug: 'research',
    name: 'Research',
    nameDE: 'Forschung & Studien',
    nameEN: 'Research & Studies',
    descriptionDE: 'Aktuelle wissenschaftliche Erkenntnisse aus der Psychologie',
    descriptionEN: 'Current scientific findings from psychology',
    sortOrder: 8,
  },
]

// Sample Blog Posts
const blogPosts = [
  {
    slug: 'depression-erkennen-und-verstehen',
    title: 'Depression erkennen und verstehen: Ein Leitfaden',
    summaryShort: 'Lernen Sie die wichtigsten Anzeichen einer Depression zu erkennen und verstehen Sie, warum professionelle Hilfe wichtig ist.',
    summaryMedium: 'Depression ist mehr als nur Traurigkeit. In diesem Artikel erklären wir die häufigsten Symptome, Ursachen und warum es so wichtig ist, frühzeitig Hilfe zu suchen. Erfahren Sie, wie Sie Warnsignale bei sich oder Angehörigen erkennen können.',
    featuredImage: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=1200&h=630&fit=crop',
    featuredImageAlt: 'Person sitzt nachdenklich am Fenster',
    metaTitle: 'Depression erkennen: Symptome, Ursachen & Hilfe',
    metaDescription: 'Erfahren Sie, wie Sie Anzeichen einer Depression erkennen. Symptome, Ursachen und wann Sie professionelle Hilfe suchen sollten.',
    categorySlug: 'depression',
    tags: ['Depression', 'Symptome', 'Diagnose', 'Hilfe'],
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Depression ist eine der häufigsten psychischen Erkrankungen weltweit. Dennoch wird sie oft missverstanden oder nicht ernst genommen. In diesem Artikel möchten wir Ihnen helfen, die Anzeichen einer Depression besser zu verstehen.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Was ist eine Depression?' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Eine Depression ist weit mehr als eine vorübergehende Traurigkeit. Es handelt sich um eine ernsthafte psychische Erkrankung, die das Denken, Fühlen und Handeln beeinflusst. Sie kann jeden treffen – unabhängig von Alter, Geschlecht oder Lebenssituation.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Häufige Symptome' }]
        },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Anhaltende Traurigkeit oder Leere' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Verlust von Interesse an Aktivitäten, die früher Freude bereitet haben' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Schlafstörungen (zu viel oder zu wenig Schlaf)' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Appetitveränderungen und Gewichtsschwankungen' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Konzentrationsschwierigkeiten' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Gefühle von Wertlosigkeit oder übermäßige Schuldgefühle' }] }] }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Wann sollte man Hilfe suchen?' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Wenn Sie mehrere dieser Symptome über einen Zeitraum von mehr als zwei Wochen erleben, ist es wichtig, professionelle Hilfe zu suchen. Depression ist behandelbar, und je früher Sie Unterstützung erhalten, desto besser sind die Aussichten auf Besserung.' }
          ]
        },
        {
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Der erste Schritt zur Besserung ist oft der schwierigste – aber auch der wichtigste. Scheuen Sie sich nicht, Hilfe anzunehmen.' }] }
          ]
        }
      ]
    }
  },
  {
    slug: 'achtsamkeit-im-alltag',
    title: '5 einfache Achtsamkeitsübungen für den Alltag',
    summaryShort: 'Praktische Achtsamkeitsübungen, die Sie leicht in Ihren Alltag integrieren können.',
    summaryMedium: 'Achtsamkeit muss nicht kompliziert sein. Mit diesen fünf einfachen Übungen können Sie mehr Ruhe und Gelassenheit in Ihren Alltag bringen – ohne stundenlang meditieren zu müssen.',
    featuredImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=630&fit=crop',
    featuredImageAlt: 'Person meditiert in der Natur',
    metaTitle: '5 Achtsamkeitsübungen für jeden Tag',
    metaDescription: 'Entdecken Sie 5 einfache Achtsamkeitsübungen für mehr Ruhe und Gelassenheit im Alltag. Praktische Tipps zum sofort Ausprobieren.',
    categorySlug: 'self-care',
    tags: ['Achtsamkeit', 'Meditation', 'Selbstfürsorge', 'Entspannung'],
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'In unserer hektischen Welt fällt es oft schwer, einen Moment innezuhalten. Achtsamkeit kann helfen, wieder mehr im Hier und Jetzt anzukommen. Hier sind fünf einfache Übungen, die Sie sofort ausprobieren können.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '1. Die Atem-Anker-Übung' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Nehmen Sie sich eine Minute Zeit und konzentrieren Sie sich nur auf Ihren Atem. Spüren Sie, wie die Luft durch Ihre Nase einströmt und wieder ausströmt. Wenn Ihre Gedanken abschweifen, bringen Sie sie sanft zurück zum Atem.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '2. Achtsames Essen' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Bei Ihrer nächsten Mahlzeit: Legen Sie das Handy weg und konzentrieren Sie sich voll auf das Essen. Beobachten Sie die Farben, riechen Sie die Aromen, schmecken Sie jeden Bissen bewusst.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '3. Der Body-Scan' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Schließen Sie die Augen und wandern Sie mit Ihrer Aufmerksamkeit langsam durch Ihren Körper – von den Zehen bis zum Kopf. Nehmen Sie wahr, wo Sie Anspannung spüren, ohne sie verändern zu wollen.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '4. Die 5-4-3-2-1-Technik' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Benennen Sie: 5 Dinge, die Sie sehen, 4 Dinge, die Sie hören, 3 Dinge, die Sie fühlen können, 2 Dinge, die Sie riechen, und 1 Sache, die Sie schmecken. Diese Übung erdet Sie sofort im Moment.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '5. Dankbarkeits-Moment' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Bevor Sie abends einschlafen, denken Sie an drei Dinge, für die Sie heute dankbar sind. Es können kleine Dinge sein – ein freundliches Lächeln, eine Tasse guter Kaffee, ein Moment der Ruhe.' }
          ]
        }
      ]
    }
  },
  {
    slug: 'burnout-praevention-tipps',
    title: 'Burnout vorbeugen: 7 Strategien für mehr Balance',
    summaryShort: 'Erfahren Sie, wie Sie Burnout frühzeitig erkennen und mit effektiven Strategien vorbeugen können.',
    summaryMedium: 'Burnout entwickelt sich schleichend und wird oft zu spät erkannt. Mit diesen sieben bewährten Strategien können Sie Ihre Work-Life-Balance verbessern und einem Burnout aktiv vorbeugen.',
    featuredImage: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=1200&h=630&fit=crop',
    featuredImageAlt: 'Gestresste Person am Arbeitsplatz',
    metaTitle: 'Burnout vorbeugen: 7 effektive Strategien',
    metaDescription: 'Lernen Sie 7 bewährte Strategien zur Burnout-Prävention. Erkennen Sie Warnsignale früh und finden Sie zurück zur Balance.',
    categorySlug: 'stress-burnout',
    tags: ['Burnout', 'Prävention', 'Work-Life-Balance', 'Stress'],
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Burnout ist kein plötzliches Ereignis, sondern ein schleichender Prozess. Die gute Nachricht: Mit den richtigen Strategien können Sie aktiv vorbeugen.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Warnsignale erkennen' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Bevor wir zu den Präventionsstrategien kommen, ist es wichtig, die frühen Warnsignale zu kennen: chronische Müdigkeit, zunehmender Zynismus, das Gefühl, nicht mehr effektiv zu sein, und emotionale Erschöpfung.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '7 Strategien zur Prävention' }]
        },
        {
          type: 'orderedList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Grenzen setzen: ' }, { type: 'text', text: 'Lernen Sie, Nein zu sagen – sowohl im Beruf als auch privat.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Pausen einplanen: ' }, { type: 'text', text: 'Regelmäßige Pausen sind keine Zeitverschwendung, sondern steigern Ihre Produktivität.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Bewegung integrieren: ' }, { type: 'text', text: 'Körperliche Aktivität ist einer der effektivsten Stresspuffer.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Soziale Kontakte pflegen: ' }, { type: 'text', text: 'Investieren Sie Zeit in Beziehungen, die Ihnen Energie geben.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Schlaf priorisieren: ' }, { type: 'text', text: 'Ausreichend Schlaf ist die Basis für Stressresilienz.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Hobbys pflegen: ' }, { type: 'text', text: 'Aktivitäten, die nichts mit Arbeit zu tun haben, laden Ihre Batterien auf.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Professionelle Hilfe suchen: ' }, { type: 'text', text: 'Wenn Sie merken, dass Sie alleine nicht weiterkommen, ist das ein Zeichen von Stärke, nicht von Schwäche.' }] }] }
          ]
        }
      ]
    }
  },
  {
    slug: 'kognitive-verhaltenstherapie-erklaert',
    title: 'Kognitive Verhaltenstherapie: Was Sie wissen sollten',
    summaryShort: 'Eine verständliche Einführung in die Kognitive Verhaltenstherapie und wie sie funktioniert.',
    summaryMedium: 'Die Kognitive Verhaltenstherapie (KVT) ist eine der am besten erforschten Therapieformen. Erfahren Sie, wie sie funktioniert, bei welchen Problemen sie hilft und was Sie in einer Therapie erwartet.',
    featuredImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=630&fit=crop',
    featuredImageAlt: 'Therapeutin im Gespräch mit Patientin',
    metaTitle: 'Kognitive Verhaltenstherapie einfach erklärt',
    metaDescription: 'Was ist Kognitive Verhaltenstherapie? Erfahren Sie, wie KVT funktioniert, wann sie hilft und was Sie erwartet.',
    categorySlug: 'therapy-methods',
    tags: ['KVT', 'Therapie', 'Psychotherapie', 'Behandlung'],
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Die Kognitive Verhaltenstherapie (KVT) gehört zu den wirksamsten und am besten erforschten Psychotherapieverfahren. Aber was genau verbirgt sich dahinter?' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Das Grundprinzip' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Die KVT basiert auf der Erkenntnis, dass unsere Gedanken, Gefühle und Verhaltensweisen eng miteinander verbunden sind. Negative Denkmuster können zu belastenden Gefühlen und ungünstigen Verhaltensweisen führen – und umgekehrt.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Wie läuft eine KVT ab?' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'In der Therapie lernen Sie zunächst, Ihre automatischen Gedankenmuster zu erkennen. Dann arbeiten Sie gemeinsam mit Ihrem Therapeuten daran, diese Muster zu hinterfragen und durch hilfreichere Gedanken zu ersetzen.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Bei welchen Problemen hilft KVT?' }]
        },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Depressionen' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Angststörungen und Phobien' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Zwangsstörungen' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Essstörungen' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Schlafstörungen' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Chronische Schmerzen' }] }] }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Was macht KVT besonders?' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'KVT ist in der Regel zeitlich begrenzt (15-25 Sitzungen), stark strukturiert und lösungsorientiert. Sie erhalten konkrete Werkzeuge, die Sie auch nach der Therapie selbstständig anwenden können.' }
          ]
        }
      ]
    }
  },
  {
    slug: 'angst-vor-therapie-ueberwinden',
    title: 'Die Angst vor dem ersten Therapietermin überwinden',
    summaryShort: 'Tipps und Ermutigung für alle, die mit dem Gedanken spielen, eine Therapie zu beginnen.',
    summaryMedium: 'Der Schritt zur Therapie fällt vielen Menschen schwer. Erfahren Sie, was Sie beim ersten Termin erwartet, welche Ängste normal sind und wie Sie den Mut finden, diesen wichtigen Schritt zu gehen.',
    featuredImage: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=1200&h=630&fit=crop',
    featuredImageAlt: 'Einladende Therapiepraxis',
    metaTitle: 'Angst vor Therapie? So überwinden Sie die Hürde',
    metaDescription: 'Haben Sie Angst vor dem ersten Therapietermin? Erfahren Sie, was Sie erwartet und wie Sie den ersten Schritt wagen können.',
    categorySlug: 'therapy-methods',
    tags: ['Therapie', 'Ersttermin', 'Ängste', 'Mut'],
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Sie denken schon länger darüber nach, eine Therapie zu beginnen, aber irgendetwas hält Sie zurück? Damit sind Sie nicht allein. Die Angst vor dem ersten Schritt ist völlig normal – und überwindbar.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Häufige Ängste und Sorgen' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '\"Was wird der Therapeut von mir denken?\"' },
            { type: 'text', text: ' – Therapeuten sind ausgebildet, um ohne Urteil zuzuhören. Sie haben schon vieles gehört und sind da, um zu helfen, nicht um zu urteilen.' }
          ]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '\"Ich weiß nicht, was ich sagen soll.\"' },
            { type: 'text', text: ' – Sie müssen nichts vorbereiten. Der Therapeut wird Ihnen Fragen stellen und das Gespräch leiten.' }
          ]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '\"Therapie ist nur für Menschen mit schweren Problemen.\"' },
            { type: 'text', text: ' – Therapie ist für jeden, der sich Unterstützung wünscht. Sie müssen nicht in einer Krise sein, um von Therapie zu profitieren.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Was beim Erstgespräch passiert' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Das erste Gespräch dient dem gegenseitigen Kennenlernen. Der Therapeut wird Ihnen Fragen zu Ihrer aktuellen Situation stellen und Sie können Fragen zur Therapie stellen. Es geht darum herauszufinden, ob Sie gut zusammenarbeiten können.' }
          ]
        },
        {
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Denken Sie daran: Hilfe zu suchen ist ein Zeichen von Stärke, nicht von Schwäche. Es zeigt, dass Sie bereit sind, aktiv an Ihrem Wohlbefinden zu arbeiten.' }] }
          ]
        }
      ]
    }
  }
]

// Use correct enum values for specializations that match the Specialty type
// Extended with new matching algorithm fields - ALL AUSTRIAN CITIES
// Wizard fields mapping:
// - wizardCategories: Maps from specializations to wizard category IDs
// - wizardSubcategories: Specific subcategories for more precise matching
// - primaryStyleStructure: structured | open | mixed (based on usesHomework)
// - primaryStyleEngagement: active | receptive | situational (based on communicationStyle)
const therapists = [
  {
    userId: 'seed-user-1',
    title: 'Dr. Anna Müller',
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Erfahrene Psychotherapeutin mit Schwerpunkt auf Angststörungen und Depression. Ich biete einen sicheren Raum für Ihre persönliche Entwicklung.',
    city: 'Wien',
    postalCode: '1010',
    specializations: ['anxiety', 'depression', 'burnout'],
    therapyTypes: ['cbt', 'psychoanalysis'],
    languages: ['de', 'en'],
    insurance: ['public', 'private'],
    pricePerSession: 120,
    sessionType: 'both' as const,
    availability: 'this_week' as const,
    gender: 'female' as const,
    rating: 4.8,
    reviewCount: 24,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 15,
    isVerified: true,
    specializationRanks: { anxiety: 1, depression: 2, burnout: 3 },
    profileCompleteness: 95,
    communicationStyle: 'empathetic' as const,
    usesHomework: true,
    therapyFocus: 'present' as const,
    clientTalkRatio: 60,
    therapyDepth: 'deep_change' as const,
    therapeuticStance: ['explaining', 'holding'],
    // Wizard V2 fields
    wizardCategories: ['anxiety_panic', 'depression_emptiness', 'stress_burnout'],
    wizardSubcategories: ['generalized_anxiety', 'panic', 'feeling_down', 'burnout'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'receptive' as const,
  },
  {
    userId: 'seed-user-2',
    title: 'Dr. Thomas Schmidt',
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Spezialist für Paartherapie und Beziehungsprobleme. Gemeinsam finden wir Wege zu einer erfüllteren Partnerschaft.',
    city: 'Wien',
    postalCode: '1030',
    specializations: ['relationships'],
    therapyTypes: ['systemic'],
    languages: ['de'],
    insurance: ['private'],
    pricePerSession: 150,
    sessionType: 'in_person' as const,
    availability: 'flexible' as const,
    gender: 'male' as const,
    rating: 4.9,
    reviewCount: 42,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 20,
    isVerified: true,
    specializationRanks: { relationships: 1 },
    profileCompleteness: 100,
    communicationStyle: 'directive' as const,
    usesHomework: false,
    therapyFocus: 'holistic' as const,
    clientTalkRatio: 50,
    therapyDepth: 'deep_change' as const,
    therapeuticStance: ['challenging', 'structuring'],
    // Wizard V2 fields
    wizardCategories: ['family_relationships'],
    wizardSubcategories: ['relationship', 'parents'],
    primaryStyleStructure: 'open' as const,
    primaryStyleEngagement: 'active' as const,
  },
  {
    userId: 'seed-user-3',
    title: 'Lisa Weber, M.Sc.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Kinder- und Jugendtherapeutin. Ich helfe jungen Menschen, ihre Stärken zu entdecken und Herausforderungen zu meistern.',
    city: 'Graz',
    postalCode: '8010',
    specializations: ['adhd', 'anxiety'],
    therapyTypes: ['cbt'],
    languages: ['de', 'tr'],
    insurance: ['public'],
    pricePerSession: 100,
    sessionType: 'both' as const,
    availability: 'immediately' as const,
    gender: 'female' as const,
    rating: 4.7,
    reviewCount: 18,
    isPublished: true,
    accountType: 'mittel' as const,
    experienceYears: 3,
    isVerified: true,
    specializationRanks: { adhd: 1, anxiety: 2 },
    profileCompleteness: 80,
    communicationStyle: 'balanced' as const,
    usesHomework: true,
    therapyFocus: 'future' as const,
    clientTalkRatio: 40,
    therapyDepth: 'symptom_relief' as const,
    therapeuticStance: ['explaining', 'structuring'],
    // Wizard V2 fields
    wizardCategories: ['attention', 'anxiety_panic', 'school_learning'],
    wizardSubcategories: ['concentration', 'generalized_anxiety', 'school_stress'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'situational' as const,
  },
  {
    userId: 'seed-user-4',
    title: 'Dr. Michael Braun',
    imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Online-Therapie für Berufstätige. Flexible Termine auch abends und am Wochenende möglich.',
    city: 'Linz',
    postalCode: '4020',
    specializations: ['burnout', 'depression'],
    therapyTypes: ['cbt'],
    languages: ['de', 'en'],
    insurance: ['private'],
    pricePerSession: 130,
    sessionType: 'online' as const,
    availability: 'flexible' as const,
    gender: 'male' as const,
    rating: 4.6,
    reviewCount: 31,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 8,
    isVerified: true,
    specializationRanks: { burnout: 1, depression: 2 },
    profileCompleteness: 90,
    communicationStyle: 'directive' as const,
    usesHomework: true,
    therapyFocus: 'present' as const,
    clientTalkRatio: 30,
    therapyDepth: 'flexible' as const,
    therapeuticStance: ['structuring', 'challenging'],
    // Wizard V2 fields
    wizardCategories: ['stress_burnout', 'depression_emptiness', 'work_career'],
    wizardSubcategories: ['burnout', 'emotional_exhaustion', 'feeling_down', 'stress_overwhelm'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'active' as const,
  },
  {
    userId: 'seed-user-5',
    title: 'Sarah Klein',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Traumatherapeutin mit EMDR-Zertifizierung. Behutsame Begleitung bei der Verarbeitung belastender Erfahrungen.',
    city: 'Salzburg',
    postalCode: '5020',
    specializations: ['trauma', 'anxiety'],
    therapyTypes: ['cbt', 'gestalt'],
    languages: ['de'],
    insurance: ['public', 'private'],
    pricePerSession: 140,
    sessionType: 'in_person' as const,
    availability: 'this_week' as const,
    gender: 'female' as const,
    rating: 4.9,
    reviewCount: 56,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 12,
    isVerified: true,
    specializationRanks: { trauma: 1, anxiety: 2 },
    profileCompleteness: 100,
    communicationStyle: 'empathetic' as const,
    usesHomework: false,
    therapyFocus: 'past' as const,
    clientTalkRatio: 70,
    therapyDepth: 'deep_change' as const,
    therapeuticStance: ['holding', 'validating'],
    // Wizard V2 fields
    wizardCategories: ['trauma_ptsd', 'anxiety_panic'],
    wizardSubcategories: ['ptsd', 'acute_trauma', 'relationship_trauma', 'generalized_anxiety'],
    primaryStyleStructure: 'open' as const,
    primaryStyleEngagement: 'receptive' as const,
  },
  {
    userId: 'seed-user-6',
    title: 'Dr. Julia Hoffmann',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Expertin für Essstörungen und Körperbild. Einfühlsame Begleitung auf dem Weg zu einem gesunden Verhältnis zum eigenen Körper.',
    city: 'Wien',
    postalCode: '1070',
    specializations: ['eating_disorders', 'depression', 'anxiety'],
    therapyTypes: ['cbt', 'humanistic'],
    languages: ['de', 'en'],
    insurance: ['public', 'private'],
    pricePerSession: 135,
    sessionType: 'both' as const,
    availability: 'this_week' as const,
    gender: 'female' as const,
    rating: 4.8,
    reviewCount: 38,
    isPublished: true,
    accountType: 'mittel' as const,
    experienceYears: 7,
    isVerified: true,
    specializationRanks: { eating_disorders: 1, depression: 2, anxiety: 3 },
    profileCompleteness: 85,
    communicationStyle: 'empathetic' as const,
    usesHomework: true,
    therapyFocus: 'present' as const,
    clientTalkRatio: 55,
    therapyDepth: 'deep_change' as const,
    therapeuticStance: ['holding', 'validating'],
    // Wizard V2 fields
    wizardCategories: ['eating_disorders', 'depression_emptiness', 'selfworth_personality'],
    wizardSubcategories: ['restrictive', 'binge_eating', 'body_image', 'selfworth'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'receptive' as const,
  },
  {
    userId: 'seed-user-7',
    title: 'Markus Becker',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Suchttherapie und Abhängigkeitserkrankungen. Ich unterstütze Sie auf dem Weg in ein suchtfreies Leben.',
    city: 'Innsbruck',
    postalCode: '6020',
    specializations: ['addiction', 'depression', 'trauma'],
    therapyTypes: ['cbt', 'systemic'],
    languages: ['de'],
    insurance: ['public'],
    pricePerSession: 110,
    sessionType: 'in_person' as const,
    availability: 'immediately' as const,
    gender: 'male' as const,
    rating: 4.7,
    reviewCount: 29,
    isPublished: true,
    accountType: 'gratis' as const,
    experienceYears: 5,
    isVerified: false,
    specializationRanks: {},
    profileCompleteness: 50,
    communicationStyle: 'directive' as const,
    usesHomework: true,
    therapyFocus: 'present' as const,
    clientTalkRatio: 40,
    therapyDepth: 'symptom_relief' as const,
    therapeuticStance: ['structuring', 'challenging'],
    // Wizard V2 fields
    wizardCategories: ['addiction', 'depression_emptiness', 'trauma_ptsd'],
    wizardSubcategories: ['substance_alcohol', 'behavioral_addiction', 'feeling_down'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'active' as const,
  },
  {
    userId: 'seed-user-8',
    title: 'Dr. Claudia Richter',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Familientherapeutin und Scheidungsberaterin. Professionelle Unterstützung für Familien in schwierigen Zeiten.',
    city: 'Klagenfurt',
    postalCode: '9020',
    specializations: ['relationships', 'depression'],
    therapyTypes: ['systemic', 'humanistic'],
    languages: ['de', 'en'],
    insurance: ['private'],
    pricePerSession: 160,
    sessionType: 'both' as const,
    availability: 'flexible' as const,
    gender: 'female' as const,
    rating: 4.9,
    reviewCount: 67,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 18,
    isVerified: true,
    specializationRanks: { relationships: 1, depression: 2 },
    profileCompleteness: 98,
    communicationStyle: 'balanced' as const,
    usesHomework: false,
    therapyFocus: 'holistic' as const,
    clientTalkRatio: 60,
    therapyDepth: 'flexible' as const,
    therapeuticStance: ['validating', 'explaining'],
    // Wizard V2 fields
    wizardCategories: ['family_relationships', 'depression_emptiness'],
    wizardSubcategories: ['child', 'relationship', 'parents', 'feeling_down'],
    primaryStyleStructure: 'open' as const,
    primaryStyleEngagement: 'situational' as const,
  },
  {
    userId: 'seed-user-9',
    title: 'Alexander Vogel',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'ADHS-Spezialist für Erwachsene. Diagnose, Therapie und Coaching für ein erfolgreiches Leben mit ADHS.',
    city: 'Sankt Pölten',
    postalCode: '3100',
    specializations: ['adhd', 'burnout', 'anxiety'],
    therapyTypes: ['cbt'],
    languages: ['de'],
    insurance: ['public', 'private'],
    pricePerSession: 125,
    sessionType: 'online' as const,
    availability: 'this_week' as const,
    gender: 'male' as const,
    rating: 4.6,
    reviewCount: 22,
    isPublished: true,
    accountType: 'mittel' as const,
    experienceYears: 6,
    isVerified: true,
    specializationRanks: { adhd: 1, burnout: 2, anxiety: 3 },
    profileCompleteness: 75,
    communicationStyle: 'directive' as const,
    usesHomework: true,
    therapyFocus: 'future' as const,
    clientTalkRatio: 35,
    therapyDepth: 'symptom_relief' as const,
    therapeuticStance: ['structuring', 'explaining'],
    // Wizard V2 fields
    wizardCategories: ['attention', 'stress_burnout', 'anxiety_panic'],
    wizardSubcategories: ['concentration', 'hyperactivity', 'burnout', 'generalized_anxiety'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'active' as const,
  },
  {
    userId: 'seed-user-10',
    title: 'Nina Krause',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Angst- und Paniktherapie. Spezialisiert auf Phobien, Panikattacken und soziale Ängste.',
    city: 'Villach',
    postalCode: '9500',
    specializations: ['anxiety', 'trauma'],
    therapyTypes: ['cbt', 'gestalt'],
    languages: ['de', 'en'],
    insurance: ['public'],
    pricePerSession: 115,
    sessionType: 'both' as const,
    availability: 'immediately' as const,
    gender: 'female' as const,
    rating: 4.8,
    reviewCount: 45,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 10,
    isVerified: true,
    specializationRanks: { anxiety: 1, trauma: 2 },
    profileCompleteness: 92,
    communicationStyle: 'empathetic' as const,
    usesHomework: true,
    therapyFocus: 'present' as const,
    clientTalkRatio: 65,
    therapyDepth: 'flexible' as const,
    therapeuticStance: ['holding', 'validating'],
    // Wizard V2 fields
    wizardCategories: ['anxiety_panic', 'trauma_ptsd'],
    wizardSubcategories: ['panic', 'phobias', 'generalized_anxiety', 'acute_trauma'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'receptive' as const,
  },
  {
    userId: 'seed-user-11',
    title: 'Dr. Robert Lange',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Burnout-Prävention und Stressmanagement. Coaching für Führungskräfte und Berufstätige.',
    city: 'Wien',
    postalCode: '1090',
    specializations: ['burnout', 'anxiety', 'depression'],
    therapyTypes: ['cbt', 'systemic'],
    languages: ['de', 'en'],
    insurance: ['private'],
    pricePerSession: 180,
    sessionType: 'online' as const,
    availability: 'flexible' as const,
    gender: 'male' as const,
    rating: 4.7,
    reviewCount: 53,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 22,
    isVerified: true,
    specializationRanks: { burnout: 1, anxiety: 2, depression: 3 },
    profileCompleteness: 100,
    communicationStyle: 'directive' as const,
    usesHomework: true,
    therapyFocus: 'future' as const,
    clientTalkRatio: 30,
    therapyDepth: 'symptom_relief' as const,
    therapeuticStance: ['structuring', 'challenging'],
    // Wizard V2 fields
    wizardCategories: ['stress_burnout', 'work_career', 'anxiety_panic'],
    wizardSubcategories: ['burnout', 'emotional_exhaustion', 'stress_overwhelm', 'workload_pressure'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'active' as const,
  },
  {
    userId: 'seed-user-12',
    title: 'Maria Santos',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Trauma und PTBS bei Geflüchteten. Kultursensible Therapie in mehreren Sprachen.',
    city: 'Wien',
    postalCode: '1150',
    specializations: ['trauma', 'depression', 'anxiety'],
    therapyTypes: ['humanistic', 'gestalt'],
    languages: ['de', 'en', 'ar'],
    insurance: ['public', 'private'],
    pricePerSession: 100,
    sessionType: 'both' as const,
    availability: 'this_week' as const,
    gender: 'female' as const,
    rating: 4.9,
    reviewCount: 34,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 9,
    isVerified: true,
    specializationRanks: { trauma: 1, depression: 2, anxiety: 3 },
    profileCompleteness: 88,
    communicationStyle: 'empathetic' as const,
    usesHomework: false,
    therapyFocus: 'past' as const,
    clientTalkRatio: 75,
    therapyDepth: 'deep_change' as const,
    therapeuticStance: ['holding', 'validating'],
    // Wizard V2 fields
    wizardCategories: ['trauma_ptsd', 'migration_culture', 'depression_emptiness'],
    wizardSubcategories: ['ptsd', 'cumulative_trauma', 'cultural_identity', 'feeling_down'],
    primaryStyleStructure: 'open' as const,
    primaryStyleEngagement: 'receptive' as const,
  },
  // Additional test therapists for edge cases
  {
    userId: 'seed-user-13',
    title: 'Hans Novak',
    imageUrl: null,
    shortDescription: 'Kurze Beschreibung.',
    city: 'Salzburg',
    postalCode: '5020',
    specializations: ['depression'],
    therapyTypes: ['cbt'],
    languages: ['de'],
    insurance: ['public'],
    pricePerSession: 80,
    sessionType: 'in_person' as const,
    availability: 'flexible' as const,
    gender: 'male' as const,
    rating: 4.0,
    reviewCount: 5,
    isPublished: true,
    // GRATIS account - no image, low profile quality
    accountType: 'gratis' as const,
    experienceYears: 1,
    isVerified: false,
    specializationRanks: {},
    profileCompleteness: 30,
    communicationStyle: null,
    usesHomework: null,
    therapyFocus: null,
    clientTalkRatio: null,
    therapyDepth: null,
    therapeuticStance: [],
    // Wizard V2 fields - minimal for gratis account
    wizardCategories: ['depression_emptiness'],
    wizardSubcategories: ['feeling_down'],
    primaryStyleStructure: 'mixed' as const,
    primaryStyleEngagement: 'situational' as const,
  },
  {
    userId: 'seed-user-14',
    title: 'Dr. Yuki Tanaka',
    imageUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Spezialistin für interkulturelle Therapie. Arbeitet mit Klienten aus verschiedenen kulturellen Hintergründen.',
    city: 'Wien',
    postalCode: '1010',
    specializations: ['anxiety', 'depression', 'relationships'],
    therapyTypes: ['cbt', 'humanistic'],
    languages: ['de', 'en'],
    insurance: ['private'],
    pricePerSession: 145,
    sessionType: 'online' as const,
    availability: 'this_week' as const,
    gender: 'female' as const,
    rating: 4.7,
    reviewCount: 28,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 11,
    isVerified: true,
    specializationRanks: { anxiety: 1, depression: 2, relationships: 3 },
    profileCompleteness: 90,
    communicationStyle: 'balanced' as const,
    usesHomework: true,
    therapyFocus: 'holistic' as const,
    clientTalkRatio: 50,
    therapyDepth: 'flexible' as const,
    therapeuticStance: ['explaining', 'validating'],
    // Wizard V2 fields
    wizardCategories: ['anxiety_panic', 'depression_emptiness', 'family_relationships', 'migration_culture'],
    wizardSubcategories: ['generalized_anxiety', 'feeling_down', 'relationship', 'cultural_identity'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'situational' as const,
  },
  {
    userId: 'seed-user-15',
    title: 'Omar Al-Rashid',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Arabischsprachiger Therapeut für Trauma und Depression. Verstehe die besonderen Herausforderungen von Menschen mit Migrationshintergrund.',
    city: 'Graz',
    postalCode: '8010',
    specializations: ['trauma', 'depression'],
    therapyTypes: ['cbt', 'gestalt'],
    languages: ['ar', 'de'],
    insurance: ['public', 'private'],
    pricePerSession: 110,
    sessionType: 'both' as const,
    availability: 'immediately' as const,
    gender: 'male' as const,
    rating: 4.8,
    reviewCount: 32,
    isPublished: true,
    accountType: 'mittel' as const,
    experienceYears: 8,
    isVerified: true,
    specializationRanks: { trauma: 1, depression: 2 },
    profileCompleteness: 82,
    communicationStyle: 'empathetic' as const,
    usesHomework: false,
    therapyFocus: 'past' as const,
    clientTalkRatio: 70,
    therapyDepth: 'deep_change' as const,
    therapeuticStance: ['holding', 'validating'],
    // Wizard V2 fields
    wizardCategories: ['trauma_ptsd', 'depression_emptiness', 'migration_culture'],
    wizardSubcategories: ['ptsd', 'cumulative_trauma', 'feeling_down', 'cultural_identity', 'discrimination'],
    primaryStyleStructure: 'open' as const,
    primaryStyleEngagement: 'receptive' as const,
  },
  // Austrian therapists
  {
    userId: 'seed-user-16',
    title: 'Mag. Elisabeth Gruber',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Psychotherapeutin in Wien mit Schwerpunkt Angststörungen und Panikattacken. Langjährige Erfahrung in der Verhaltenstherapie.',
    city: 'Wien',
    postalCode: '1030',
    specializations: ['anxiety', 'depression', 'burnout'],
    therapyTypes: ['cbt', 'humanistic'],
    languages: ['de', 'en'],
    insurance: ['public', 'private'],
    pricePerSession: 130,
    sessionType: 'both' as const,
    availability: 'this_week' as const,
    gender: 'female' as const,
    rating: 4.9,
    reviewCount: 67,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 14,
    isVerified: true,
    specializationRanks: { anxiety: 1, depression: 2, burnout: 3 },
    profileCompleteness: 95,
    communicationStyle: 'empathetic' as const,
    usesHomework: true,
    therapyFocus: 'present' as const,
    clientTalkRatio: 60,
    therapyDepth: 'deep_change' as const,
    therapeuticStance: ['holding', 'explaining'],
    // Wizard V2 fields
    wizardCategories: ['anxiety_panic', 'depression_emptiness', 'stress_burnout'],
    wizardSubcategories: ['panic', 'generalized_anxiety', 'phobias', 'feeling_down', 'burnout'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'receptive' as const,
  },
  {
    userId: 'seed-user-17',
    title: 'Dr. Florian Steiner',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Klinischer Psychologe in Linz. Spezialisiert auf Burnout-Prävention und Stressmanagement für Berufstätige.',
    city: 'Linz',
    postalCode: '4020',
    specializations: ['burnout', 'anxiety', 'depression'],
    therapyTypes: ['cbt', 'systemic'],
    languages: ['de'],
    insurance: ['private'],
    pricePerSession: 140,
    sessionType: 'both' as const,
    availability: 'flexible' as const,
    gender: 'male' as const,
    rating: 4.6,
    reviewCount: 41,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 10,
    isVerified: true,
    specializationRanks: { burnout: 1, anxiety: 2, depression: 3 },
    profileCompleteness: 88,
    communicationStyle: 'directive' as const,
    usesHomework: true,
    therapyFocus: 'future' as const,
    clientTalkRatio: 40,
    therapyDepth: 'symptom_relief' as const,
    therapeuticStance: ['structuring', 'challenging'],
    // Wizard V2 fields
    wizardCategories: ['stress_burnout', 'work_career', 'anxiety_panic'],
    wizardSubcategories: ['burnout', 'stress', 'emotional_exhaustion', 'workload_pressure'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'active' as const,
  },
  {
    userId: 'seed-user-18',
    title: 'Mag. Katharina Huber',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Traumatherapeutin in Innsbruck. EMDR-zertifiziert. Behutsame Begleitung bei der Verarbeitung belastender Erlebnisse.',
    city: 'Innsbruck',
    postalCode: '6020',
    specializations: ['trauma', 'anxiety', 'depression'],
    therapyTypes: ['cbt', 'gestalt'],
    languages: ['de', 'en'],
    insurance: ['public', 'private'],
    pricePerSession: 125,
    sessionType: 'in_person' as const,
    availability: 'this_week' as const,
    gender: 'female' as const,
    rating: 4.8,
    reviewCount: 52,
    isPublished: true,
    accountType: 'premium' as const,
    experienceYears: 12,
    isVerified: true,
    specializationRanks: { trauma: 1, anxiety: 2, depression: 3 },
    profileCompleteness: 92,
    communicationStyle: 'empathetic' as const,
    usesHomework: false,
    therapyFocus: 'past' as const,
    clientTalkRatio: 70,
    therapyDepth: 'deep_change' as const,
    therapeuticStance: ['holding', 'validating'],
    // Wizard V2 fields
    wizardCategories: ['trauma_ptsd', 'anxiety_panic', 'depression_emptiness'],
    wizardSubcategories: ['ptsd', 'acute_trauma', 'relationship_trauma', 'generalized_anxiety'],
    primaryStyleStructure: 'open' as const,
    primaryStyleEngagement: 'receptive' as const,
  },
  {
    userId: 'seed-user-19',
    title: 'Mag. Stefan Pichler',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Paartherapeut und Familienberater in Graz. Systemische Therapie für Beziehungsprobleme und Familienkonflikte.',
    city: 'Graz',
    postalCode: '8020',
    specializations: ['relationships', 'depression'],
    therapyTypes: ['systemic', 'humanistic'],
    languages: ['de'],
    insurance: ['public', 'private'],
    pricePerSession: 120,
    sessionType: 'both' as const,
    availability: 'immediately' as const,
    gender: 'male' as const,
    rating: 4.7,
    reviewCount: 38,
    isPublished: true,
    accountType: 'mittel' as const,
    experienceYears: 9,
    isVerified: true,
    specializationRanks: { relationships: 1, depression: 2 },
    profileCompleteness: 85,
    communicationStyle: 'balanced' as const,
    usesHomework: false,
    therapyFocus: 'holistic' as const,
    clientTalkRatio: 55,
    therapyDepth: 'flexible' as const,
    therapeuticStance: ['explaining', 'validating'],
    // Wizard V2 fields
    wizardCategories: ['family_relationships', 'depression_emptiness'],
    wizardSubcategories: ['relationship', 'child', 'parents', 'siblings', 'feeling_down'],
    primaryStyleStructure: 'open' as const,
    primaryStyleEngagement: 'situational' as const,
  },
  {
    userId: 'seed-user-20',
    title: 'Dr. Maria Lechner',
    imageUrl: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Online-Psychotherapeutin aus Salzburg. Flexible Termine für Berufstätige. Schwerpunkt Depression und Angst.',
    city: 'Salzburg',
    postalCode: '5020',
    specializations: ['depression', 'anxiety', 'burnout'],
    therapyTypes: ['cbt'],
    languages: ['de', 'en'],
    insurance: ['private'],
    pricePerSession: 135,
    sessionType: 'online' as const,
    availability: 'flexible' as const,
    gender: 'female' as const,
    rating: 4.5,
    reviewCount: 23,
    isPublished: true,
    accountType: 'mittel' as const,
    experienceYears: 6,
    isVerified: true,
    specializationRanks: { depression: 1, anxiety: 2, burnout: 3 },
    profileCompleteness: 78,
    communicationStyle: 'empathetic' as const,
    usesHomework: true,
    therapyFocus: 'present' as const,
    clientTalkRatio: 50,
    therapyDepth: 'flexible' as const,
    therapeuticStance: ['validating', 'holding'],
    // Wizard V2 fields
    wizardCategories: ['depression_emptiness', 'anxiety_panic', 'stress_burnout'],
    wizardSubcategories: ['feeling_down', 'lack_of_drive', 'generalized_anxiety', 'burnout'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'receptive' as const,
  },
  {
    userId: 'seed-user-21',
    title: 'Mag. Andreas Bauer',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'ADHS-Spezialist in Klagenfurt. Diagnose und Therapie für Kinder, Jugendliche und Erwachsene.',
    city: 'Klagenfurt',
    postalCode: '9020',
    specializations: ['adhd', 'anxiety', 'depression'],
    therapyTypes: ['cbt'],
    languages: ['de'],
    insurance: ['public'],
    pricePerSession: 110,
    sessionType: 'in_person' as const,
    availability: 'this_week' as const,
    gender: 'male' as const,
    rating: 4.6,
    reviewCount: 29,
    isPublished: true,
    accountType: 'mittel' as const,
    experienceYears: 7,
    isVerified: true,
    specializationRanks: { adhd: 1, anxiety: 2, depression: 3 },
    profileCompleteness: 80,
    communicationStyle: 'directive' as const,
    usesHomework: true,
    therapyFocus: 'future' as const,
    clientTalkRatio: 35,
    therapyDepth: 'symptom_relief' as const,
    therapeuticStance: ['structuring', 'explaining'],
    // Wizard V2 fields
    wizardCategories: ['attention', 'anxiety_panic', 'school_learning'],
    wizardSubcategories: ['concentration', 'hyperactivity', 'impulsivity', 'generalized_anxiety'],
    primaryStyleStructure: 'structured' as const,
    primaryStyleEngagement: 'active' as const,
  },
]

async function main() {
  // Seed Blog Categories
  console.log('Seeding blog categories...')
  for (const category of blogCategories) {
    await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
    console.log(`Created category: ${category.nameDE}`)
  }
  const categoryCount = await prisma.blogCategory.count()
  console.log(`Blog categories seeded: ${categoryCount}\n`)

  // Seed Therapist Profiles
  console.log('Seeding therapist profiles...')

  for (const therapist of therapists) {
    // First create a dummy user for the therapist
    const user = await prisma.user.upsert({
      where: { id: therapist.userId },
      update: {},
      create: {
        id: therapist.userId,
        email: `${therapist.userId}@example.com`,
        name: therapist.title,
      },
    })

    // Then create or update the therapist profile
    await prisma.therapistProfile.upsert({
      where: { userId: user.id },
      update: therapist,
      create: therapist,
    })

    console.log(`Created: ${therapist.title}`)
  }

  const count = await prisma.therapistProfile.count()
  console.log(`Therapist profiles seeded: ${count}\n`)

  // Seed Blog Posts
  console.log('Seeding blog posts...')

  // Get a user to be the author (use first seed user)
  const author = await prisma.user.findFirst({ where: { id: 'seed-user-1' } })
  if (!author) {
    console.log('No author found, skipping blog posts')
    return
  }

  for (const post of blogPosts) {
    // Get the category
    const category = await prisma.blogCategory.findUnique({
      where: { slug: post.categorySlug }
    })

    if (!category) {
      console.log(`Category ${post.categorySlug} not found, skipping post: ${post.title}`)
      continue
    }

    // Generate HTML content from TipTap JSON
    const contentHtml = generateSimpleHtml(post.content)
    const plainText = extractText(post.content)
    const wordCount = plainText.split(/\s+/).filter(Boolean).length
    const readingTime = Math.ceil(wordCount / 200)

    // Check if post already exists
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
    if (existing) {
      console.log(`Post already exists: ${post.title}`)
      continue
    }

    // Create the blog post
    const createdPost = await prisma.blogPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        content: post.content,
        contentHtml,
        excerpt: plainText.substring(0, 160) + '...',
        summaryShort: post.summaryShort,
        summaryMedium: post.summaryMedium,
        featuredImage: post.featuredImage,
        featuredImageAlt: post.featuredImageAlt,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        wordCount,
        readingTimeMinutes: readingTime,
        status: 'published',
        publishedAt: new Date(),
        authorId: author.id,
      }
    })

    // Connect category
    await prisma.blogPostCategory.create({
      data: {
        postId: createdPost.id,
        categoryId: category.id
      }
    })

    // Create tags
    for (const tagName of post.tags) {
      const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      let tag = await prisma.blogTag.findUnique({ where: { slug: tagSlug } })
      if (!tag) {
        tag = await prisma.blogTag.create({
          data: { slug: tagSlug, name: tagName }
        })
      }

      await prisma.blogPostTag.create({
        data: {
          postId: createdPost.id,
          tagId: tag.id
        }
      }).catch(() => {}) // Ignore if already exists
    }

    console.log(`Created post: ${post.title}`)
  }

  const postCount = await prisma.blogPost.count()
  console.log(`\nSeeding complete! Total blog posts: ${postCount}`)
}

// Helper function to generate HTML from TipTap JSON
function generateSimpleHtml(node: any): string {
  if (!node) return ''

  if (node.text) {
    let text = node.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === 'bold') text = `<strong>${text}</strong>`
        if (mark.type === 'italic') text = `<em>${text}</em>`
      }
    }
    return text
  }

  const children = node.content?.map(generateSimpleHtml).join('') || ''

  switch (node.type) {
    case 'doc': return children
    case 'paragraph': return `<p>${children}</p>`
    case 'heading': return `<h${node.attrs?.level || 2}>${children}</h${node.attrs?.level || 2}>`
    case 'bulletList': return `<ul>${children}</ul>`
    case 'orderedList': return `<ol>${children}</ol>`
    case 'listItem': return `<li>${children}</li>`
    case 'blockquote': return `<blockquote>${children}</blockquote>`
    default: return children
  }
}

// Helper function to extract plain text
function extractText(node: any): string {
  if (!node) return ''
  if (node.text) return node.text
  if (node.content) return node.content.map(extractText).join(' ')
  return ''
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
