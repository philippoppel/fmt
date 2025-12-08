import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
