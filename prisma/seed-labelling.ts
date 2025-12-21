/**
 * Seed script for the Labelling Portal
 * Creates initial taxonomy version and sample cases for testing.
 *
 * Usage: npx tsx prisma/seed-labelling.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Sample case texts for different categories (German)
const SAMPLE_CASES = [
  // Depression
  {
    text: "Seit Wochen fühle ich mich niedergeschlagen und antriebslos. Morgens komme ich kaum aus dem Bett, und selbst einfache Aufgaben kosten mich enorme Anstrengung. Ich habe das Gefühl, in einem tiefen Loch zu stecken, aus dem ich nicht herauskomme.",
    category: "depression",
  },
  {
    text: "Alles erscheint mir sinnlos geworden. Die Dinge, die mir früher Freude bereitet haben, interessieren mich nicht mehr. Ich esse kaum noch und schlafe schlecht. Meine Familie macht sich Sorgen, aber ich kann mich einfach nicht aufraffen.",
    category: "depression",
  },
  {
    text: "Ich weine oft ohne ersichtlichen Grund und fühle mich innerlich leer. Meine Gedanken kreisen ständig um negative Dinge. Manchmal frage ich mich, ob das Leben überhaupt noch einen Sinn hat.",
    category: "depression",
  },
  // Anxiety
  {
    text: "Ich habe ständig Angst, dass etwas Schlimmes passieren könnte. Mein Herz rast, ich bekomme Schweißausbrüche und manchmal denke ich, ich würde sterben. Diese Panikattacken kommen aus dem Nichts.",
    category: "anxiety",
  },
  {
    text: "Vor sozialen Situationen habe ich extreme Angst. Bei dem Gedanken, eine Präsentation zu halten oder neue Leute kennenzulernen, bekomme ich Herzrasen. Ich meide mittlerweile viele Situationen.",
    category: "anxiety",
  },
  {
    text: "Ich mache mir ständig Sorgen - um meine Gesundheit, meine Arbeit, meine Beziehungen. Diese Gedanken lassen mich nachts nicht schlafen und beeinträchtigen meinen Alltag erheblich.",
    category: "anxiety",
  },
  // Relationships
  {
    text: "Meine Beziehung ist am Ende. Wir streiten nur noch und können nicht mehr miteinander reden. Ich fühle mich unverstanden und einsam, obwohl wir zusammen sind.",
    category: "relationships",
  },
  {
    text: "Nach der Trennung von meinem Partner fühle ich mich verloren. Ich weiß nicht, wie ich alleine weitermachen soll. Die Einsamkeit ist überwältigend.",
    category: "relationships",
  },
  {
    text: "Ich habe Schwierigkeiten, Nähe zuzulassen. Sobald jemand mir zu nahe kommt, ziehe ich mich zurück. Ich verstehe nicht, warum mir das so schwer fällt.",
    category: "relationships",
  },
  // Stress
  {
    text: "Die Arbeit macht mich fertig. Ich arbeite 60 Stunden die Woche und habe trotzdem das Gefühl, nie genug zu schaffen. Mein Chef setzt mich unter enormen Druck.",
    category: "stress",
  },
  {
    text: "Ich bin völlig überfordert mit allem - Job, Familie, Haushalt. Ich habe keine Zeit mehr für mich selbst und fühle mich ausgebrannt. Körperlich merke ich es auch: Kopfschmerzen, Verspannungen.",
    category: "stress",
  },
  // Self-esteem
  {
    text: "Ich fühle mich wertlos und denke oft, dass ich nichts richtig mache. Egal was ich tue, es ist nie gut genug. Ich vergleiche mich ständig mit anderen und komme immer schlecht weg.",
    category: "self_esteem",
  },
  {
    text: "Seit meiner Kindheit habe ich ein negatives Bild von mir selbst. Ich wurde oft kritisiert und das hat tiefe Spuren hinterlassen. Ich traue mir nichts zu.",
    category: "self_esteem",
  },
  // Trauma
  {
    text: "Vor zwei Jahren hatte ich einen schweren Unfall. Seitdem habe ich Albträume und Flashbacks. Bestimmte Geräusche oder Gerüche versetzen mich sofort zurück in diese Situation.",
    category: "trauma",
  },
  {
    text: "In meiner Kindheit ist mir etwas Schlimmes passiert, über das ich nie gesprochen habe. Es beeinflusst mein Leben bis heute - meine Beziehungen, mein Vertrauen in Menschen.",
    category: "trauma",
  },
  // Grief
  {
    text: "Vor sechs Monaten ist meine Mutter gestorben. Ich komme mit dem Verlust nicht klar. Die Trauer überwältigt mich, manchmal mitten am Tag, mitten bei der Arbeit.",
    category: "grief",
  },
  {
    text: "Nach der Fehlgeburt fühle ich mich leer und unendlich traurig. Niemand versteht, wie sehr mich dieser Verlust getroffen hat. Ich weiß nicht, wie ich damit umgehen soll.",
    category: "grief",
  },
  // Sleep
  {
    text: "Ich kann nicht mehr richtig schlafen. Entweder liege ich stundenlang wach oder wache mitten in der Nacht auf und grüble. Morgens bin ich völlig erschöpft.",
    category: "sleep",
  },
  {
    text: "Mein Schlaf ist seit Monaten gestört. Ich habe Albträume und wache schweißgebadet auf. Am Tag bin ich müde und unkonzentriert.",
    category: "sleep",
  },
  // Family
  {
    text: "Die Beziehung zu meinen Eltern ist schwierig. Wir haben sehr unterschiedliche Vorstellungen vom Leben, und jedes Treffen endet im Streit.",
    category: "family",
  },
  {
    text: "Als Mutter von drei Kindern fühle ich mich völlig überfordert. Ich habe das Gefühl, es niemandem recht machen zu können - weder den Kindern noch meinem Partner.",
    category: "family",
  },
  // Work
  {
    text: "Ich weiß nicht mehr, ob mein Job der richtige für mich ist. Ich fühle mich unterfordert und sehe keine Perspektive. Aber Angst vor Veränderung hält mich zurück.",
    category: "work",
  },
  {
    text: "Mein Chef mobbt mich systematisch. Ich werde vor anderen bloßgestellt und bekomme unmögliche Aufgaben. Die Situation macht mich krank.",
    category: "work",
  },
  // Addiction
  {
    text: "Ich trinke zu viel, das weiß ich. Anfangs war es nur am Wochenende, jetzt brauche ich abends immer etwas, um runterzukommen. Ich habe Angst, die Kontrolle zu verlieren.",
    category: "addiction",
  },
  {
    text: "Seit Jahren kämpfe ich mit meiner Spielsucht. Ich habe schon viel Geld verloren und meine Familie belogen. Ich schaffe es nicht alleine, aufzuhören.",
    category: "addiction",
  },
  // Identity
  {
    text: "Ich weiß nicht mehr, wer ich bin oder wer ich sein will. Nach dem Studium fühle ich mich verloren. Alle anderen scheinen einen Plan zu haben, nur ich nicht.",
    category: "identity",
  },
  {
    text: "Mit Mitte 40 frage ich mich: Ist das alles? Habe ich die richtigen Entscheidungen getroffen? Diese Sinnkrise belastet mich sehr.",
    category: "identity",
  },
  // Multi-topic cases
  {
    text: "Seit der Trennung von meinem Mann vor einem Jahr geht es mir immer schlechter. Ich kann nicht schlafen, habe keinen Appetit und fühle mich unendlich einsam. Gleichzeitig mache ich mir große Sorgen um meine Kinder.",
    category: "multi",
  },
  {
    text: "Mein Burnout kam schleichend. Der Druck bei der Arbeit, die Pflege meiner kranken Mutter, die Probleme in der Ehe - alles zusammen war zu viel. Jetzt sitze ich zu Hause und kann nichts mehr.",
    category: "multi",
  },
  {
    text: "Ich habe Angst vor der Zukunft. Die Klimakrise, die wirtschaftliche Unsicherheit, meine eigene berufliche Situation - alles macht mir Sorgen. Ich schlafe schlecht und fühle mich oft niedergeschlagen.",
    category: "multi",
  },
];

// Taxonomy schema based on existing topics.ts and intensity.ts
const TAXONOMY_SCHEMA = {
  version: "v0.1",
  topics: [
    { id: "depression", label: "Depression", subtopics: ["chronic_sadness", "lack_motivation", "hopelessness"] },
    { id: "anxiety", label: "Angst", subtopics: ["panic", "social_anxiety", "generalized_worry"] },
    { id: "relationships", label: "Beziehungen", subtopics: ["conflict", "loneliness", "attachment"] },
    { id: "stress", label: "Stress", subtopics: ["work_stress", "burnout", "overwhelm"] },
    { id: "self_esteem", label: "Selbstwert", subtopics: ["low_confidence", "negative_self_image", "perfectionism"] },
    { id: "trauma", label: "Trauma", subtopics: ["ptsd", "childhood_trauma", "flashbacks"] },
    { id: "grief", label: "Trauer", subtopics: ["loss", "complicated_grief", "mourning"] },
    { id: "sleep", label: "Schlaf", subtopics: ["insomnia", "nightmares", "fatigue"] },
    { id: "family", label: "Familie", subtopics: ["parent_conflict", "parenting", "family_dynamics"] },
    { id: "work", label: "Arbeit", subtopics: ["career_issues", "workplace_conflict", "job_satisfaction"] },
    { id: "addiction", label: "Sucht", subtopics: ["alcohol", "gambling", "substance"] },
    { id: "identity", label: "Identität", subtopics: ["life_direction", "midlife", "self_discovery"] },
  ],
  intensityQuestions: [
    { id: "frequency_daily", question: "Ich erlebe das fast jeden Tag" },
    { id: "duration_months", question: "Das geht schon länger als 3 Monate" },
    { id: "impact_work", question: "Es beeinträchtigt meine Arbeit" },
    { id: "impact_relationships", question: "Es beeinträchtigt meine Beziehungen" },
    { id: "impact_physical", question: "Ich habe körperliche Symptome" },
  ],
};

async function main() {
  console.log("Starting labelling seed...");

  // Create or get admin user
  let adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!adminUser) {
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("AdminTest123!", 12);
    adminUser = await prisma.user.create({
      data: {
        email: "admin@labelling.local",
        name: "Admin",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });
    console.log(`Created admin user: ${adminUser.email}`);
  }

  // Create labeller user if not exists
  let labellerUser = await prisma.user.findFirst({
    where: { role: "LABELLER" },
  });

  if (!labellerUser) {
    console.log("Creating labeller user...");
    const hashedPassword = await bcrypt.hash("LabellerTest123!", 12);
    labellerUser = await prisma.user.create({
      data: {
        email: "labeller@labelling.local",
        name: "Labeller",
        password: hashedPassword,
        role: "LABELLER",
        isActive: true,
      },
    });
    console.log(`Created labeller user: ${labellerUser.email}`);
  }

  // Create taxonomy version
  let taxonomy = await prisma.taxonomyVersion.findFirst({
    where: { version: "v0.1" },
  });

  if (!taxonomy) {
    console.log("Creating taxonomy version...");
    taxonomy = await prisma.taxonomyVersion.create({
      data: {
        version: "v0.1",
        description: "Initiale Taxonomie für FindMyTherapy Matching",
        schema: TAXONOMY_SCHEMA,
        isActive: true,
      },
    });
    console.log(`Created taxonomy version: ${taxonomy.version}`);
  }

  // Create sample cases
  const existingCasesCount = await prisma.labellingCase.count();
  if (existingCasesCount === 0) {
    console.log("Creating sample cases...");
    for (const sample of SAMPLE_CASES) {
      await prisma.labellingCase.create({
        data: {
          text: sample.text,
          language: "de",
          source: "AI_SEEDED",
          status: "NEW",
          metadata: { category_hint: sample.category },
          createdById: adminUser.id,
        },
      });
    }
    console.log(`Created ${SAMPLE_CASES.length} sample cases`);
  } else {
    console.log(`Skipping case creation - ${existingCasesCount} cases already exist`);
  }

  // Add some cases to calibration pool
  const calibrationCount = await prisma.calibrationPool.count();
  if (calibrationCount === 0) {
    console.log("Adding cases to calibration pool...");
    const casesForCalibration = await prisma.labellingCase.findMany({
      take: 5,
      orderBy: { createdAt: "asc" },
    });

    for (const c of casesForCalibration) {
      await prisma.calibrationPool.create({
        data: {
          caseId: c.id,
          isActive: true,
        },
      });
    }
    console.log(`Added ${casesForCalibration.length} cases to calibration pool`);
  }

  console.log("\nSeed completed!");
  console.log("---");
  console.log("Test accounts:");
  console.log(`  Admin: admin@labelling.local / AdminTest123!`);
  console.log(`  Labeller: labeller@labelling.local / LabellerTest123!`);
  console.log("---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
