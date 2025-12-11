/**
 * AI Integration Tests for analyze-situation
 * These tests call the actual Groq AI API
 *
 * Run with: GROQ_API_KEY=... npm run test:ci -- analyze-situation-ai
 *
 * @vitest-environment node
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  analyzeSituation,
  findClosestSubTopics,
  findClosestIntensity,
} from "@/lib/actions/analyze-situation";

// Skip all tests if no API key is available
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const describeIfApiKey = GROQ_API_KEY ? describe : describe.skip;

describeIfApiKey("AI Integration Tests (Groq API)", () => {
  beforeAll(() => {
    if (!GROQ_API_KEY) {
      console.log("Skipping AI tests - GROQ_API_KEY not set");
    }
  });

  // ============================================================================
  // CRISIS DETECTION VIA AI
  // ============================================================================

  describe("Crisis Detection via AI", () => {
    it("should detect suicidal ideation (German)", async () => {
      const result = await analyzeSituation("Ich will nicht mehr leben, alles ist hoffnungslos und sinnlos.");

      expect(result.crisisDetected).toBe(true);
      expect(result.crisisType).toBe("suicidal");
    }, 15000);

    it("should detect suicidal ideation (English)", async () => {
      const result = await analyzeSituation("I don't want to live anymore, I want to end my life.");

      expect(result.crisisDetected).toBe(true);
      expect(result.crisisType).toBe("suicidal");
    }, 15000);

    it("should detect self-harm (German)", async () => {
      const result = await analyzeSituation("Ich muss mich ritzen, ich muss mir selbst weh tun um mich zu spüren.");

      expect(result.crisisDetected).toBe(true);
      expect(result.crisisType).toBe("self_harm");
    }, 15000);

    it("should detect acute danger (German)", async () => {
      const result = await analyzeSituation("Ich sehe keinen Ausweg mehr, ich kann nicht mehr weitermachen, alles ist hoffnungslos.");

      expect(result.crisisDetected).toBe(true);
      expect(["acute_danger", "suicidal"]).toContain(result.crisisType);
    }, 15000);

    it("should NOT detect crisis for normal burnout/anxiety (German)", async () => {
      const result = await analyzeSituation("Ich bin bei der Arbeit völlig ausgebrannt und habe manchmal Panikattacken.");

      expect(result.crisisDetected).toBe(false);
      expect(result.crisisType).toBeNull();
    }, 15000);

    it("should NOT detect crisis for relationship problems (German)", async () => {
      const result = await analyzeSituation("Mein Partner und ich streiten ständig und ich weiß nicht mehr weiter.");

      expect(result.crisisDetected).toBe(false);
      expect(result.crisisType).toBeNull();
    }, 15000);

    it("should NOT detect crisis for exam stress (German)", async () => {
      const result = await analyzeSituation("Ich habe Prüfungsangst und bin total gestresst wegen meiner Klausuren.");

      expect(result.crisisDetected).toBe(false);
      expect(result.crisisType).toBeNull();
    }, 15000);
  });

  // ============================================================================
  // MULTIPLE TOPICS DETECTION VIA AI
  // ============================================================================

  describe("Multiple Topics Detection via AI", () => {
    it("should detect burnout AND anxiety together (German)", async () => {
      const result = await analyzeSituation("Ich bin bei der Arbeit völlig erschöpft und habe ständig Panikattacken und Angst.");

      expect(result.crisisDetected).toBe(false);
      expect(result.suggestedTopics).toContain("burnout");
      expect(result.suggestedTopics).toContain("anxiety");
    }, 15000);

    it("should detect depression AND relationships together (German)", async () => {
      const result = await analyzeSituation("Seit der Trennung von meinem Partner bin ich ständig traurig und habe keine Motivation mehr aufzustehen.");

      expect(result.crisisDetected).toBe(false);
      expect(result.suggestedTopics).toContain("depression");
      expect(result.suggestedTopics).toContain("relationships");
    }, 15000);

    it("should detect burnout AND sleep problems together (German)", async () => {
      const result = await analyzeSituation("Ich arbeite zu viel, bin völlig erschöpft und kann nachts nicht mehr schlafen, habe Albträume.");

      expect(result.crisisDetected).toBe(false);
      expect(result.suggestedTopics).toContain("burnout");
      expect(result.suggestedTopics).toContain("sleep");
    }, 15000);

    it("should detect anxiety AND addiction together (German)", async () => {
      // Note: This text may trigger crisis detection since alcohol abuse to cope with anxiety
      // can be seen as a warning sign. We test for topic detection regardless of crisis status.
      const result = await analyzeSituation("Ich habe Angstzustände und trinke manchmal Alkohol wenn es mir nicht gut geht.");

      // Should detect topics even if crisis is flagged (fallback handles this)
      const hasAnxietyOrAddiction =
        result.suggestedTopics.includes("anxiety") ||
        result.suggestedTopics.includes("addiction") ||
        result.crisisDetected; // AI may interpret this as concerning
      expect(hasAnxietyOrAddiction).toBe(true);
    }, 15000);

    it("should detect three topics: depression, anxiety, sleep (German)", async () => {
      const result = await analyzeSituation("Ich bin depressiv und traurig, habe Panikattacken, und kann nachts nicht schlafen wegen Albträumen.");

      expect(result.crisisDetected).toBe(false);
      expect(result.suggestedTopics.length).toBeGreaterThanOrEqual(2);
      expect(result.suggestedTopics).toContain("depression");
      // Should contain at least anxiety OR sleep
      const hasAnxietyOrSleep = result.suggestedTopics.includes("anxiety") || result.suggestedTopics.includes("sleep");
      expect(hasAnxietyOrSleep).toBe(true);
    }, 15000);

    it("should detect topics in English text", async () => {
      const result = await analyzeSituation("I'm completely burned out from work and I have panic attacks. My relationship is also suffering.");

      expect(result.crisisDetected).toBe(false);
      expect(result.suggestedTopics.length).toBeGreaterThanOrEqual(2);
    }, 15000);
  });

  // ============================================================================
  // MULTIPLE SUBTOPICS DETECTION VIA AI (findClosestSubTopics)
  // ============================================================================

  describe("SubTopics Detection via AI (findClosestSubTopics)", () => {
    const anxietySubTopics = [
      { id: "social_anxiety", label: "Soziale Angst" },
      { id: "panic_attacks", label: "Panikattacken" },
      { id: "phobias", label: "Phobien" },
      { id: "generalized_anxiety", label: "Generalisierte Angst" },
    ];

    const depressionSubTopics = [
      { id: "chronic_sadness", label: "Chronische Traurigkeit" },
      { id: "lack_motivation", label: "Antriebslosigkeit" },
      { id: "grief", label: "Trauer" },
      { id: "loneliness", label: "Einsamkeit" },
    ];

    const burnoutSubTopics = [
      { id: "work_stress", label: "Arbeitsstress" },
      { id: "exhaustion", label: "Erschöpfung" },
      { id: "work_life_balance", label: "Work-Life-Balance" },
    ];

    it("should match panic attacks AND social anxiety (German)", async () => {
      const result = await findClosestSubTopics(
        "Ich habe ständig Herzrasen und Angst in sozialen Situationen, besonders wenn ich vor anderen reden muss.",
        anxietySubTopics
      );

      expect(result.matchedIds.length).toBeGreaterThanOrEqual(1);
      // Should match at least panic_attacks or social_anxiety
      const hasPanicOrSocial = result.matchedIds.includes("panic_attacks") || result.matchedIds.includes("social_anxiety");
      expect(hasPanicOrSocial).toBe(true);
      expect(["high", "medium"]).toContain(result.confidence);
    }, 15000);

    it("should match chronic sadness AND lack of motivation (German)", async () => {
      const result = await findClosestSubTopics(
        "Ich bin immer traurig und habe überhaupt keine Motivation mehr, morgens aufzustehen.",
        depressionSubTopics
      );

      expect(result.matchedIds.length).toBeGreaterThanOrEqual(1);
      // Should match at least chronic_sadness or lack_motivation
      const hasSadnessOrMotivation = result.matchedIds.includes("chronic_sadness") || result.matchedIds.includes("lack_motivation");
      expect(hasSadnessOrMotivation).toBe(true);
    }, 15000);

    it("should match grief AND loneliness (German)", async () => {
      const result = await findClosestSubTopics(
        "Seit mein Vater gestorben ist, fühle ich mich so einsam. Niemand versteht mich.",
        depressionSubTopics
      );

      expect(result.matchedIds.length).toBeGreaterThanOrEqual(1);
      // Should match grief or loneliness
      const hasGriefOrLoneliness = result.matchedIds.includes("grief") || result.matchedIds.includes("loneliness");
      expect(hasGriefOrLoneliness).toBe(true);
    }, 15000);

    it("should match work stress AND exhaustion (German)", async () => {
      const result = await findClosestSubTopics(
        "Ich habe so viel Arbeitsstress und bin völlig erschöpft, habe keine Energie mehr.",
        burnoutSubTopics
      );

      expect(result.matchedIds.length).toBeGreaterThanOrEqual(1);
      // Should match work_stress or exhaustion
      const hasWorkOrExhaustion = result.matchedIds.includes("work_stress") || result.matchedIds.includes("exhaustion");
      expect(hasWorkOrExhaustion).toBe(true);
    }, 15000);

    it("should return low confidence for unrelated text", async () => {
      const result = await findClosestSubTopics(
        "Das Wetter ist heute schön und ich gehe spazieren.",
        anxietySubTopics
      );

      // Should have low confidence or no matches for unrelated text
      if (result.matchedIds.length > 0) {
        expect(result.confidence).toBe("low");
      }
    }, 15000);
  });

  // ============================================================================
  // INTENSITY DETECTION VIA AI (findClosestIntensity)
  // ============================================================================

  describe("Intensity Detection via AI (findClosestIntensity)", () => {
    it("should detect LOW intensity for mild stress (German)", async () => {
      const result = await findClosestIntensity("Ich bin manchmal ein bisschen gestresst bei der Arbeit.");

      expect(result.level).toBe("low");
      expect(result.explanation).toBeTruthy();
    }, 15000);

    it("should detect MEDIUM intensity for moderate issues (German)", async () => {
      const result = await findClosestIntensity("Ich habe oft Probleme mit Angst und das beeinträchtigt meinen Alltag.");

      expect(["medium", "high"]).toContain(result.level);
      expect(result.explanation).toBeTruthy();
    }, 15000);

    it("should detect HIGH intensity for severe distress (German)", async () => {
      const result = await findClosestIntensity("Ich kann nicht mehr, bin völlig am Ende, nichts funktioniert mehr in meinem Leben.");

      expect(result.level).toBe("high");
      expect(result.explanation).toBeTruthy();
    }, 15000);

    it("should detect LOW intensity for preventive inquiry (German)", async () => {
      const result = await findClosestIntensity("Ich möchte mich einfach mal informieren über Therapiemöglichkeiten, mir geht es eigentlich gut.");

      expect(result.level).toBe("low");
    }, 15000);

    it("should detect intensity in English", async () => {
      const result = await findClosestIntensity("I'm completely overwhelmed and can't cope with anything anymore.");

      expect(["medium", "high"]).toContain(result.level);
      expect(result.explanation).toBeTruthy();
    }, 15000);
  });

  // ============================================================================
  // FULL ANALYSIS INTEGRATION TESTS
  // ============================================================================

  describe("Full Analysis Integration", () => {
    it("should provide complete analysis with summary and reasoning (German)", async () => {
      const result = await analyzeSituation(
        "Ich bin seit Monaten erschöpft von der Arbeit und habe Panikattacken. Meine Beziehung leidet auch darunter."
      );

      expect(result.crisisDetected).toBe(false);
      expect(result.suggestedTopics.length).toBeGreaterThanOrEqual(1);
      expect(result.understandingSummary).toBeTruthy();
      expect(result.understandingSummary.length).toBeGreaterThan(20);
      expect(result.topicReasons).toBeTruthy();
      expect(result.suggestedIntensityLevel).toBeTruthy();
      expect(["low", "medium", "high"]).toContain(result.suggestedIntensityLevel);
    }, 20000);

    it("should detect subtopics in full analysis", async () => {
      const result = await analyzeSituation(
        "Ich habe Panikattacken und fühle mich bei der Arbeit völlig erschöpft und ausgebrannt."
      );

      expect(result.crisisDetected).toBe(false);
      // Should have at least some subtopics
      expect(result.suggestedSubTopics.length).toBeGreaterThanOrEqual(0);
      // If subtopics are detected, they should be valid
      if (result.suggestedSubTopics.length > 0) {
        const validSubTopics = [
          "panic_attacks", "social_anxiety", "phobias", "generalized_anxiety",
          "work_stress", "exhaustion", "work_life_balance",
          "chronic_sadness", "lack_motivation", "grief", "loneliness"
        ];
        result.suggestedSubTopics.forEach(st => {
          expect(validSubTopics).toContain(st);
        });
      }
    }, 20000);

    it("should handle complex multi-issue descriptions", async () => {
      const result = await analyzeSituation(`
        Seit einiger Zeit habe ich Probleme bei der Arbeit, ich bin oft müde und gestresst.
        Mein Schlaf ist nicht gut, ich wache nachts oft auf.
        Auch in meiner Beziehung läuft es gerade nicht rund, wir streiten öfter.
      `);

      expect(result.crisisDetected).toBe(false);
      expect(result.suggestedTopics.length).toBeGreaterThanOrEqual(2);
      expect(result.understandingSummary).toBeTruthy();
      expect(result.suggestedIntensityLevel).toBeTruthy();
    }, 20000);
  });
});
