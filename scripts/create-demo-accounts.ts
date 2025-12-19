/**
 * Create real database accounts for demo therapists
 * Run with: npx tsx scripts/create-demo-accounts.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEMO_THERAPISTS = [
  {
    slug: "dr-maria-schneider",
    email: "maria.schneider@demo.fmt.at",
    name: "Dr. Maria Schneider",
    title: "Psychologische Psychotherapeutin",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    headline: "Ihre einfühlsame Begleitung auf dem Weg zu mehr Lebensfreude",
    shortDescription: "Spezialisiert auf Depressionen und Angststörungen mit über 15 Jahren Erfahrung. Einfühlsame Begleitung in schwierigen Lebensphasen.",
    longDescription: `Als Psychologische Psychotherapeutin begleite ich Sie mit Empathie und fachlicher Kompetenz auf Ihrem persönlichen Weg zu mehr Wohlbefinden und Lebensqualität.

In meiner über 15-jährigen Tätigkeit habe ich Menschen in verschiedensten Lebenssituationen unterstützt – sei es bei Depressionen, Angststörungen, Burnout oder in persönlichen Krisen. Mein Ansatz ist dabei stets individuell und ganzheitlich.

Ich glaube daran, dass jeder Mensch die Ressourcen in sich trägt, um Veränderungen zu bewirken. Meine Aufgabe sehe ich darin, diese Ressourcen gemeinsam mit Ihnen zu entdecken und zu stärken.

In einer vertrauensvollen Atmosphäre biete ich Ihnen einen sicheren Raum, in dem Sie sich öffnen und neue Perspektiven entwickeln können.`,
    city: "Berlin",
    postalCode: "10115",
    street: "Friedrichstraße 123",
    practiceName: "Praxis für Psychotherapie Dr. Schneider",
    specializations: ["depression", "anxiety", "burnout"],
    specializationRanks: { depression: 1, anxiety: 2, burnout: 3 },
    therapyTypes: ["cbt", "humanistic"],
    languages: ["de", "en"],
    insurance: ["public", "private"],
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
    pricePerSession: 120,
    sessionType: "both",
    availability: "this_week",
    gender: "female",
    rating: 4.9,
    reviewCount: 47,
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
    phone: "+49 30 123 456 78",
    contactEmail: "kontakt@dr-schneider-psychotherapie.de",
    website: "https://dr-schneider-psychotherapie.de",
    linkedIn: "https://linkedin.com/in/dr-maria-schneider",
    instagram: "",
    themeColor: "#8B7355",
    themeName: "warm",
    consultationInfo: `Das Erstgespräch dient dem gegenseitigen Kennenlernen und der Klärung Ihrer Anliegen.

Gemeinsam besprechen wir:
- Ihre aktuelle Situation und Ihre Beschwerden
- Ihre Ziele und Erwartungen an die Therapie
- Mögliche Therapieansätze und -methoden
- Organisatorisches (Termine, Kosten, Versicherung)

Das Erstgespräch ist unverbindlich und kostet 50€ (wird bei Folgebehandlung angerechnet).`,
    offersTrialSession: true,
    trialSessionPrice: 50,
    communicationStyle: "empathetic",
    usesHomework: true,
    therapyFocus: "holistic",
    clientTalkRatio: 60,
    therapyDepth: "deep_change",
    accountType: "premium",
    isVerified: true,
  },
  {
    slug: "thomas-weber",
    email: "thomas.weber@demo.fmt.at",
    name: "Thomas Weber",
    title: "Psychotherapeut (HPG)",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    headline: "Traumasensible Begleitung für Ihren Heilungsweg",
    shortDescription: "Traumatherapie und Beziehungsberatung in vertrauensvoller Atmosphäre. Spezialisiert auf EMDR und tiefenpsychologische Verfahren.",
    longDescription: `Als Heilpraktiker für Psychotherapie habe ich mich auf die Behandlung von Traumata und Beziehungsproblemen spezialisiert.

Meine Arbeit basiert auf der Überzeugung, dass vergangene Erfahrungen uns prägen, aber nicht definieren müssen. Mit den richtigen Werkzeugen und einer vertrauensvollen therapeutischen Beziehung ist tiefgreifende Heilung möglich.

Ich arbeite vorwiegend mit EMDR (Eye Movement Desensitization and Reprocessing) und tiefenpsychologischen Methoden. Diese Kombination hat sich in meiner Praxis als besonders wirksam erwiesen.

In unserer gemeinsamen Arbeit ist mir eine respektvolle, wertschätzende Atmosphäre wichtig, in der Sie sich sicher fühlen können.`,
    city: "München",
    postalCode: "80331",
    street: "Maximilianstraße 45",
    practiceName: "Praxis Weber - Traumatherapie München",
    specializations: ["trauma", "relationships", "addiction"],
    specializationRanks: { trauma: 1, relationships: 2, addiction: 3 },
    therapyTypes: ["psychoanalysis", "systemic"],
    languages: ["de", "tr"],
    insurance: ["private"],
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
    pricePerSession: 100,
    sessionType: "in_person",
    availability: "flexible",
    gender: "male",
    rating: 4.7,
    reviewCount: 32,
    galleryImages: [
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop",
    ],
    officeImages: [
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop",
    ],
    phone: "+49 89 234 567 89",
    contactEmail: "praxis@thomasweber.de",
    website: "https://thomasweber-psychotherapie.de",
    linkedIn: "",
    instagram: "https://instagram.com/thomasweber.therapie",
    themeColor: "#5B7B8C",
    themeName: "cool",
    consultationInfo: `In unserem ersten Gespräch möchte ich Sie kennenlernen und verstehen, was Sie zu mir führt.

Wir klären gemeinsam:
- Ihre Beschwerden und deren Geschichte
- Was Sie sich von einer Therapie erhoffen
- Ob wir zusammenarbeiten möchten

Das Erstgespräch ist für Sie kostenfrei.`,
    offersTrialSession: true,
    trialSessionPrice: 0,
    communicationStyle: "balanced",
    usesHomework: false,
    therapyFocus: "past",
    clientTalkRatio: 50,
    therapyDepth: "deep_change",
    accountType: "mittel",
    isVerified: true,
  },
  {
    slug: "dr-sarah-klein",
    email: "sarah.klein@demo.fmt.at",
    name: "Dr. Sarah Klein",
    title: "Fachärztin für Psychiatrie und Psychotherapie",
    imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
    headline: "Ganzheitliche Behandlung für Körper und Seele",
    shortDescription: "Ganzheitliche Behandlung von ADHS und Essstörungen. Kombination aus medikamentöser Therapie und Psychotherapie möglich.",
    longDescription: `Als Fachärztin für Psychiatrie und Psychotherapie verbinde ich medizinisches Wissen mit psychotherapeutischer Expertise.

Mein Schwerpunkt liegt auf der Behandlung von ADHS im Erwachsenenalter und Essstörungen. Bei diesen Erkrankungen ist häufig ein ganzheitlicher Ansatz wichtig, der sowohl körperliche als auch seelische Aspekte berücksichtigt.

In meiner Praxis biete ich Ihnen eine umfassende Diagnostik und individuelle Behandlungsplanung. Je nach Bedarf kann die Behandlung rein psychotherapeutisch erfolgen oder durch medikamentöse Unterstützung ergänzt werden.

Mir ist wichtig, dass Sie als Patient*in informierte Entscheidungen treffen können. Deshalb nehme ich mir Zeit für ausführliche Aufklärung und gemeinsame Therapieplanung.`,
    city: "Hamburg",
    postalCode: "20095",
    street: "Jungfernstieg 50",
    practiceName: "Psychiatrische Praxis Dr. Klein",
    specializations: ["adhd", "eating_disorders", "anxiety"],
    specializationRanks: { adhd: 1, eating_disorders: 2, anxiety: 3 },
    therapyTypes: ["cbt", "gestalt"],
    languages: ["de", "en", "ar"],
    insurance: ["public", "private"],
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
    pricePerSession: 140,
    sessionType: "both",
    availability: "immediately",
    gender: "female",
    rating: 4.8,
    reviewCount: 56,
    galleryImages: [
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop",
    ],
    officeImages: [
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop",
    ],
    phone: "+49 40 345 678 90",
    contactEmail: "praxis@dr-sarah-klein.de",
    website: "https://psychiatrie-hamburg-klein.de",
    linkedIn: "https://linkedin.com/in/dr-sarah-klein",
    instagram: "",
    themeColor: "#667EEA",
    themeName: "professional",
    consultationInfo: `Im Erstgespräch führe ich eine ausführliche Anamnese durch und erstelle eine erste diagnostische Einschätzung.

Das Gespräch umfasst:
- Ihre Beschwerden und Krankengeschichte
- Diagnostische Einschätzung
- Besprechung möglicher Behandlungsoptionen
- Klärung organisatorischer Fragen

Das Erstgespräch dauert ca. 50 Minuten und wird über Ihre Krankenversicherung abgerechnet.`,
    offersTrialSession: false,
    trialSessionPrice: 0,
    communicationStyle: "directive",
    usesHomework: true,
    therapyFocus: "present",
    clientTalkRatio: 40,
    therapyDepth: "flexible",
    accountType: "premium",
    isVerified: true,
  },
  {
    slug: "lisa-mueller",
    email: "lisa.mueller@demo.fmt.at",
    name: "Lisa Müller",
    title: "Systemische Therapeutin",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    headline: "Lösungen finden – Beziehungen stärken",
    shortDescription: "Systemische Einzel-, Paar- und Familientherapie. Lösungsorientierter Ansatz für nachhaltige Veränderungen.",
    longDescription: `Als Systemische Therapeutin betrachte ich den Menschen immer im Kontext seiner Beziehungen und Systeme – sei es Familie, Partnerschaft oder Arbeitsumfeld.

Mein Ansatz ist lösungs- und ressourcenorientiert: Statt lange nach Problemen zu suchen, fokussieren wir auf das, was bereits funktioniert, und bauen darauf auf.

Besonders am Herzen liegt mir die Arbeit mit Paaren und Familien. Hier erlebe ich immer wieder, wie kraftvoll Veränderungen sein können, wenn alle Beteiligten einbezogen werden.

In Einzeltherapie arbeite ich ebenfalls systemisch – denn auch wenn Sie alleine kommen, sind Ihre Beziehungen immer "mit im Raum".`,
    city: "Düsseldorf",
    postalCode: "40213",
    street: "Königsallee 92",
    practiceName: "Systemische Praxis Müller",
    specializations: ["relationships", "addiction", "burnout"],
    specializationRanks: { relationships: 1, burnout: 2, addiction: 3 },
    therapyTypes: ["systemic"],
    languages: ["de", "tr"],
    insurance: ["private"],
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
    pricePerSession: 90,
    sessionType: "both",
    availability: "immediately",
    gender: "female",
    rating: 4.5,
    reviewCount: 24,
    galleryImages: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=600&fit=crop",
    ],
    officeImages: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop",
    ],
    phone: "+49 211 456 789 01",
    contactEmail: "kontakt@lisamueller-therapie.de",
    website: "https://systemische-therapie-duesseldorf.de",
    linkedIn: "",
    instagram: "https://instagram.com/lisamueller.systemisch",
    themeColor: "#6B8E5A",
    themeName: "nature",
    consultationInfo: `Unser erstes Treffen dient dem Kennenlernen und der Auftragsklärung.

Wir besprechen:
- Was führt Sie zu mir?
- Was möchten Sie verändern?
- Was soll am Ende anders sein?
- Wie können wir zusammenarbeiten?

Das Erstgespräch kostet 80€ und dauert 60-90 Minuten.`,
    offersTrialSession: true,
    trialSessionPrice: 80,
    communicationStyle: "balanced",
    usesHomework: true,
    therapyFocus: "future",
    clientTalkRatio: 55,
    therapyDepth: "flexible",
    accountType: "mittel",
    isVerified: false,
  },
  {
    slug: "dr-elena-petrova",
    email: "elena.petrova@demo.fmt.at",
    name: "Dr. Elena Petrova",
    title: "Psychoanalytikerin",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face",
    headline: "Den Wurzeln auf der Spur – für tiefgreifende Veränderung",
    shortDescription: "Tiefenpsychologisch fundierte Therapie mit Fokus auf frühe Bindungserfahrungen. Auch Langzeittherapie möglich.",
    longDescription: `Als Psychoanalytikerin arbeite ich tiefenpsychologisch fundiert mit dem Ziel, nicht nur Symptome zu lindern, sondern deren unbewusste Wurzeln zu verstehen und aufzulösen.

Meine Arbeit basiert auf der Überzeugung, dass viele unserer heutigen Probleme ihre Ursprünge in frühen Beziehungserfahrungen haben. In der therapeutischen Beziehung können diese Muster bewusst werden und sich verändern.

Ich biete sowohl Kurzzeit- als auch Langzeittherapie an. Die Dauer richtet sich nach Ihren individuellen Bedürfnissen und Zielen.

Mein Therapiestil ist einfühlsam und beziehungsorientiert. Ich glaube, dass Heilung vor allem durch eine sichere, vertrauensvolle therapeutische Beziehung geschieht.`,
    city: "Köln",
    postalCode: "50667",
    street: "Domkloster 3",
    practiceName: "Psychoanalytische Praxis Dr. Petrova",
    specializations: ["trauma", "anxiety", "depression"],
    specializationRanks: { trauma: 1, depression: 2, anxiety: 3 },
    therapyTypes: ["psychoanalysis"],
    languages: ["de", "en"],
    insurance: ["public", "private"],
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
    pricePerSession: 130,
    sessionType: "in_person",
    availability: "flexible",
    gender: "female",
    rating: 4.9,
    reviewCount: 41,
    galleryImages: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop",
    ],
    officeImages: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
    ],
    phone: "+49 221 567 890 12",
    contactEmail: "praxis@dr-petrova.de",
    website: "https://psychoanalyse-koeln.de",
    linkedIn: "https://linkedin.com/in/dr-elena-petrova",
    instagram: "",
    themeColor: "#1A1A1A",
    themeName: "minimal",
    consultationInfo: `Die ersten Stunden dienen der ausführlichen Diagnostik und dem Aufbau einer tragfähigen therapeutischen Beziehung.

In dieser Phase klären wir:
- Ihre Lebensgeschichte und aktuellen Beschwerden
- Die Entstehung Ihrer Problematik
- Ihre Therapiemotivation und -ziele
- Den Rahmen unserer Zusammenarbeit

Die Erstgespräche werden von der Krankenkasse übernommen.`,
    offersTrialSession: false,
    trialSessionPrice: 0,
    communicationStyle: "empathetic",
    usesHomework: false,
    therapyFocus: "past",
    clientTalkRatio: 70,
    therapyDepth: "deep_change",
    accountType: "premium",
    isVerified: true,
  },
];

const DEFAULT_PASSWORD = "demo123";

async function main() {
  console.log("Creating demo therapist accounts...\n");

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const therapist of DEMO_THERAPISTS) {
    console.log(`Processing: ${therapist.name}`);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: therapist.email },
    });

    if (existingUser) {
      console.log(`  - User already exists, updating profile...`);

      // Update existing profile
      await db.therapistProfile.upsert({
        where: { userId: existingUser.id },
        update: {
          slug: therapist.slug,
          title: therapist.title,
          imageUrl: therapist.imageUrl,
          headline: therapist.headline,
          shortDescription: therapist.shortDescription,
          longDescription: therapist.longDescription,
          city: therapist.city,
          postalCode: therapist.postalCode,
          street: therapist.street,
          practiceName: therapist.practiceName,
          specializations: therapist.specializations,
          specializationRanks: therapist.specializationRanks,
          therapyTypes: therapist.therapyTypes,
          languages: therapist.languages,
          insurance: therapist.insurance,
          education: therapist.education,
          certifications: therapist.certifications,
          memberships: therapist.memberships,
          experienceYears: therapist.experienceYears,
          pricePerSession: therapist.pricePerSession,
          sessionType: therapist.sessionType,
          availability: therapist.availability,
          gender: therapist.gender,
          rating: therapist.rating,
          reviewCount: therapist.reviewCount,
          galleryImages: therapist.galleryImages,
          officeImages: therapist.officeImages,
          phone: therapist.phone,
          email: therapist.contactEmail,
          website: therapist.website,
          linkedIn: therapist.linkedIn,
          instagram: therapist.instagram,
          themeColor: therapist.themeColor,
          themeName: therapist.themeName,
          consultationInfo: therapist.consultationInfo,
          offersTrialSession: therapist.offersTrialSession,
          trialSessionPrice: therapist.trialSessionPrice,
          communicationStyle: therapist.communicationStyle,
          usesHomework: therapist.usesHomework,
          therapyFocus: therapist.therapyFocus,
          clientTalkRatio: therapist.clientTalkRatio,
          therapyDepth: therapist.therapyDepth,
          accountType: therapist.accountType,
          isVerified: therapist.isVerified,
          isPublished: true,
        },
        create: {
          userId: existingUser.id,
          slug: therapist.slug,
          title: therapist.title,
          imageUrl: therapist.imageUrl,
          headline: therapist.headline,
          shortDescription: therapist.shortDescription,
          longDescription: therapist.longDescription,
          city: therapist.city,
          postalCode: therapist.postalCode,
          street: therapist.street,
          practiceName: therapist.practiceName,
          specializations: therapist.specializations,
          specializationRanks: therapist.specializationRanks,
          therapyTypes: therapist.therapyTypes,
          languages: therapist.languages,
          insurance: therapist.insurance,
          education: therapist.education,
          certifications: therapist.certifications,
          memberships: therapist.memberships,
          experienceYears: therapist.experienceYears,
          pricePerSession: therapist.pricePerSession,
          sessionType: therapist.sessionType,
          availability: therapist.availability,
          gender: therapist.gender,
          rating: therapist.rating,
          reviewCount: therapist.reviewCount,
          galleryImages: therapist.galleryImages,
          officeImages: therapist.officeImages,
          phone: therapist.phone,
          email: therapist.contactEmail,
          website: therapist.website,
          linkedIn: therapist.linkedIn,
          instagram: therapist.instagram,
          themeColor: therapist.themeColor,
          themeName: therapist.themeName,
          consultationInfo: therapist.consultationInfo,
          offersTrialSession: therapist.offersTrialSession,
          trialSessionPrice: therapist.trialSessionPrice,
          communicationStyle: therapist.communicationStyle,
          usesHomework: therapist.usesHomework,
          therapyFocus: therapist.therapyFocus,
          clientTalkRatio: therapist.clientTalkRatio,
          therapyDepth: therapist.therapyDepth,
          accountType: therapist.accountType,
          isVerified: therapist.isVerified,
          isPublished: true,
        },
      });
    } else {
      console.log(`  - Creating new user and profile...`);

      // Create new user with profile
      await db.user.create({
        data: {
          email: therapist.email,
          name: therapist.name,
          password: hashedPassword,
          therapistProfile: {
            create: {
              slug: therapist.slug,
              title: therapist.title,
              imageUrl: therapist.imageUrl,
              headline: therapist.headline,
              shortDescription: therapist.shortDescription,
              longDescription: therapist.longDescription,
              city: therapist.city,
              postalCode: therapist.postalCode,
              street: therapist.street,
              practiceName: therapist.practiceName,
              specializations: therapist.specializations,
              specializationRanks: therapist.specializationRanks,
              therapyTypes: therapist.therapyTypes,
              languages: therapist.languages,
              insurance: therapist.insurance,
              education: therapist.education,
              certifications: therapist.certifications,
              memberships: therapist.memberships,
              experienceYears: therapist.experienceYears,
              pricePerSession: therapist.pricePerSession,
              sessionType: therapist.sessionType,
              availability: therapist.availability,
              gender: therapist.gender,
              rating: therapist.rating,
              reviewCount: therapist.reviewCount,
              galleryImages: therapist.galleryImages,
              officeImages: therapist.officeImages,
              phone: therapist.phone,
              email: therapist.contactEmail,
              website: therapist.website,
              linkedIn: therapist.linkedIn,
              instagram: therapist.instagram,
              themeColor: therapist.themeColor,
              themeName: therapist.themeName,
              consultationInfo: therapist.consultationInfo,
              offersTrialSession: therapist.offersTrialSession,
              trialSessionPrice: therapist.trialSessionPrice,
              communicationStyle: therapist.communicationStyle,
              usesHomework: therapist.usesHomework,
              therapyFocus: therapist.therapyFocus,
              clientTalkRatio: therapist.clientTalkRatio,
              therapyDepth: therapist.therapyDepth,
              accountType: therapist.accountType,
              isVerified: therapist.isVerified,
              isPublished: true,
            },
          },
        },
      });
    }

    console.log(`  ✓ Done: ${therapist.email} (${therapist.accountType})`);
  }

  console.log("\n========================================");
  console.log("Demo accounts created successfully!");
  console.log("========================================\n");
  console.log("Login credentials:");
  console.log("Password for all accounts: demo123\n");

  for (const t of DEMO_THERAPISTS) {
    console.log(`${t.name}`);
    console.log(`  Email: ${t.email}`);
    console.log(`  Profile: /p/${t.slug}`);
    console.log(`  Tier: ${t.accountType}\n`);
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
