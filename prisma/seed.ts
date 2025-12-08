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

const therapists = [
  {
    userId: 'seed-user-1',
    title: 'Dr. Anna Müller',
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Erfahrene Psychotherapeutin mit Schwerpunkt auf Angststörungen und Depression. Ich biete einen sicheren Raum für Ihre persönliche Entwicklung.',
    city: 'Berlin',
    postalCode: '10115',
    specializations: ['Angststörungen', 'Depression', 'Burnout'],
    therapyTypes: ['Verhaltenstherapie', 'Tiefenpsychologie'],
    languages: ['Deutsch', 'Englisch'],
    insurance: ['Gesetzliche Krankenkasse', 'Private Krankenversicherung'],
    pricePerSession: 120,
    sessionType: 'both' as const,
    availability: 'this_week' as const,
    gender: 'female' as const,
    rating: 4.8,
    reviewCount: 24,
    isPublished: true,
  },
  {
    userId: 'seed-user-2',
    title: 'Dr. Thomas Schmidt',
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Spezialist für Paartherapie und Beziehungsprobleme. Gemeinsam finden wir Wege zu einer erfüllteren Partnerschaft.',
    city: 'München',
    postalCode: '80331',
    specializations: ['Paartherapie', 'Beziehungsprobleme', 'Kommunikation'],
    therapyTypes: ['Systemische Therapie', 'Paartherapie'],
    languages: ['Deutsch'],
    insurance: ['Selbstzahler', 'Private Krankenversicherung'],
    pricePerSession: 150,
    sessionType: 'in_person' as const,
    availability: 'flexible' as const,
    gender: 'male' as const,
    rating: 4.9,
    reviewCount: 42,
    isPublished: true,
  },
  {
    userId: 'seed-user-3',
    title: 'Lisa Weber, M.Sc.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Kinder- und Jugendtherapeutin. Ich helfe jungen Menschen, ihre Stärken zu entdecken und Herausforderungen zu meistern.',
    city: 'Hamburg',
    postalCode: '20095',
    specializations: ['Kinder & Jugendliche', 'ADHS', 'Schulprobleme'],
    therapyTypes: ['Verhaltenstherapie', 'Spieltherapie'],
    languages: ['Deutsch', 'Türkisch'],
    insurance: ['Gesetzliche Krankenkasse'],
    pricePerSession: 100,
    sessionType: 'both' as const,
    availability: 'immediately' as const,
    gender: 'female' as const,
    rating: 4.7,
    reviewCount: 18,
    isPublished: true,
  },
  {
    userId: 'seed-user-4',
    title: 'Dr. Michael Braun',
    imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Online-Therapie für Berufstätige. Flexible Termine auch abends und am Wochenende möglich.',
    city: 'Frankfurt',
    postalCode: '60311',
    specializations: ['Stress', 'Work-Life-Balance', 'Burnout'],
    therapyTypes: ['Kognitive Verhaltenstherapie', 'Coaching'],
    languages: ['Deutsch', 'Englisch', 'Französisch'],
    insurance: ['Selbstzahler'],
    pricePerSession: 130,
    sessionType: 'online' as const,
    availability: 'flexible' as const,
    gender: 'male' as const,
    rating: 4.6,
    reviewCount: 31,
    isPublished: true,
  },
  {
    userId: 'seed-user-5',
    title: 'Sarah Klein',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    shortDescription: 'Traumatherapeutin mit EMDR-Zertifizierung. Behutsame Begleitung bei der Verarbeitung belastender Erfahrungen.',
    city: 'Köln',
    postalCode: '50667',
    specializations: ['Trauma', 'PTBS', 'Angststörungen'],
    therapyTypes: ['EMDR', 'Traumatherapie'],
    languages: ['Deutsch'],
    insurance: ['Gesetzliche Krankenkasse', 'Private Krankenversicherung', 'Selbstzahler'],
    pricePerSession: 140,
    sessionType: 'in_person' as const,
    availability: 'this_week' as const,
    gender: 'female' as const,
    rating: 4.9,
    reviewCount: 56,
    isPublished: true,
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
  console.log(`\nSeeding complete! Total therapists: ${count}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
