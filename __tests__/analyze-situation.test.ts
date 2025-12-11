import { describe, it, expect } from "vitest";
import {
  detectCrisis,
  detectTopics,
  detectSubTopics,
  detectLanguage,
  type CrisisType,
} from "@/lib/actions/analyze-situation";

// ============================================================================
// CRISIS DETECTION TESTS - Suicide, Self-Harm, Acute Danger
// ============================================================================

describe("Crisis Detection", () => {
  describe("Suicidal ideation detection (German)", () => {
    it("should detect direct suicidal expressions", () => {
      const testCases = [
        "Ich will nicht mehr leben",
        "Ich möchte sterben",
        "Ich denke an Suizid",
        "Ich möchte mich umbringen",
        "Ich will mir das Leben nehmen",
        "Dem Leben ein Ende setzen",
      ];

      for (const text of testCases) {
        const result = detectCrisis(text, "de");
        expect(result.crisisDetected, `Should detect crisis in: "${text}"`).toBe(true);
        expect(result.crisisType).toBe("suicidal");
      }
    });

    it("should detect passive suicidal expressions", () => {
      const testCases = [
        "Ich möchte nicht mehr aufwachen",
        "Ich wäre besser tot",
        "Die Welt wäre besser ohne mich",
        "Ich bin allen eine Last",
        "Einschlafen und nicht mehr aufwachen",
      ];

      for (const text of testCases) {
        const result = detectCrisis(text, "de");
        expect(result.crisisDetected, `Should detect crisis in: "${text}"`).toBe(true);
        expect(result.crisisType).toBe("suicidal");
      }
    });

    it("should detect planning indicators", () => {
      const testCases = [
        "Ich schreibe gerade einen abschiedsbrief",
        "Ich will meine sachen verschenken bevor es zu spät ist",
        "Ich informiere mich über methoden um zu sterben",
      ];

      for (const text of testCases) {
        const result = detectCrisis(text, "de");
        expect(result.crisisDetected, `Should detect crisis in: "${text}"`).toBe(true);
        expect(result.crisisType).toBe("suicidal");
      }
    });
  });

  describe("Suicidal ideation detection (English)", () => {
    it("should detect direct suicidal expressions", () => {
      const testCases = [
        "I want to kill myself",
        "I don't want to live anymore",
        "I want to end my life",
        "I'm thinking about suicide",
        "I wish I was dead",
      ];

      for (const text of testCases) {
        const result = detectCrisis(text, "en");
        expect(result.crisisDetected, `Should detect crisis in: "${text}"`).toBe(true);
        expect(result.crisisType).toBe("suicidal");
      }
    });

    it("should detect passive suicidal expressions", () => {
      const testCases = [
        "I want to not wake up tomorrow",
        "I'm better off dead",
        "The world without me would be better",
        "I'm a burden to everyone",
        "I wish I could fall asleep and never wake up",
      ];

      for (const text of testCases) {
        const result = detectCrisis(text, "en");
        expect(result.crisisDetected, `Should detect crisis in: "${text}"`).toBe(true);
        expect(result.crisisType).toBe("suicidal");
      }
    });
  });

  describe("Self-harm detection (German)", () => {
    it("should detect self-harm expressions", () => {
      const testCases = [
        "Ich muss mich ritzen",
        "Ich will mich selbst verletzen",
        "Ich muss mir weh tun",
        "Ich muss mir selbst weh tun",
        "Ich will mir schmerzen zufügen",
        "Ich muss mich bestrafen",
      ];

      for (const text of testCases) {
        const result = detectCrisis(text, "de");
        expect(result.crisisDetected, `Should detect crisis in: "${text}"`).toBe(true);
        expect(result.crisisType).toBe("self_harm");
      }
    });
  });

  describe("Self-harm detection (English)", () => {
    it("should detect self-harm expressions", () => {
      const testCases = [
        "I cut myself",
        "I'm cutting myself",
        "I hurt myself",
        "I want to hurt myself",
        "I need to punish myself",
        "I burn myself",
      ];

      for (const text of testCases) {
        const result = detectCrisis(text, "en");
        expect(result.crisisDetected, `Should detect crisis in: "${text}"`).toBe(true);
        expect(result.crisisType).toBe("self_harm");
      }
    });
  });

  describe("Acute danger detection (German)", () => {
    it("should detect acute danger expressions", () => {
      const testCases = [
        "Ich will mir heute noch was antun",
        "Ich halte es nicht mehr aus",
        "Ich kann nicht mehr weitermachen",
        "Ich bin völlig am Ende",
        "Ich sehe keinen Ausweg mehr",
        "Es ist völlig hoffnungslos",
      ];

      for (const text of testCases) {
        const result = detectCrisis(text, "de");
        expect(result.crisisDetected, `Should detect crisis in: "${text}"`).toBe(true);
        expect(result.crisisType).toBe("acute_danger");
      }
    });
  });

  describe("Acute danger detection (English)", () => {
    it("should detect acute danger expressions", () => {
      const testCases = [
        "I can't take it anymore and see no way out",
        "I can't bear it anymore",
        "I can't go on with this life",
        "I'm completely done, there's no escape",
        "There's no way out for me",
        "I'm completely hopeless now",
      ];

      for (const text of testCases) {
        const result = detectCrisis(text, "en");
        expect(result.crisisDetected, `Should detect crisis in: "${text}"`).toBe(true);
        expect(result.crisisType).toBe("acute_danger");
      }
    });
  });

  describe("Non-crisis inputs should not trigger false positives", () => {
    it("should not detect crisis in normal mental health discussions (German)", () => {
      const testCases = [
        "Ich fühle mich manchmal traurig",
        "Ich habe Stress bei der Arbeit",
        "Meine Beziehung macht mir Sorgen",
        "Ich schlafe schlecht in letzter Zeit",
        "Ich fühle mich manchmal überfordert",
        "Ich bin oft müde und erschöpft",
      ];

      for (const text of testCases) {
        const result = detectCrisis(text, "de");
        expect(result.crisisDetected, `Should NOT detect crisis in: "${text}"`).toBe(false);
      }
    });

    it("should not detect crisis in normal mental health discussions (English)", () => {
      const testCases = [
        "I feel sad sometimes",
        "I have stress at work",
        "My relationship is making me worried",
        "I've been sleeping poorly lately",
        "I feel overwhelmed sometimes",
        "I'm often tired and exhausted",
      ];

      for (const text of testCases) {
        const result = detectCrisis(text, "en");
        expect(result.crisisDetected, `Should NOT detect crisis in: "${text}"`).toBe(false);
      }
    });
  });
});

// ============================================================================
// MULTIPLE TOPICS DETECTION TESTS
// ============================================================================

describe("Multiple Topics Detection", () => {
  describe("Detecting multiple different topics (German)", () => {
    it("should detect depression AND anxiety together", () => {
      const text = "Ich bin ständig traurig und hoffnungslos, aber ich habe auch Panikattacken und starke Angst";
      const topics = detectTopics(text, "de");

      expect(topics).toContain("depression");
      expect(topics).toContain("anxiety");
    });

    it("should detect depression AND relationship issues together", () => {
      const text = "Seit der Trennung von meinem Partner bin ich sehr niedergeschlagen und habe keine Motivation mehr";
      const topics = detectTopics(text, "de");

      expect(topics).toContain("depression");
      expect(topics).toContain("relationships");
    });

    it("should detect burnout AND sleep issues together", () => {
      const text = "Ich bin bei der Arbeit völlig ausgebrannt und kann nachts nicht mehr schlafen, habe ständig Albträume";
      const topics = detectTopics(text, "de");

      expect(topics).toContain("burnout");
      expect(topics).toContain("sleep");
    });

    it("should detect anxiety AND addiction together", () => {
      const text = "Ich habe starke Angst und Panik, und trinke deshalb viel Alkohol um das zu betäuben";
      const topics = detectTopics(text, "de");

      expect(topics).toContain("anxiety");
      expect(topics).toContain("addiction");
    });

    it("should detect trauma AND family issues together", () => {
      const text = "Ich habe Flashbacks von dem Missbrauch in meiner Kindheit und habe Konflikte mit meinen Eltern";
      const topics = detectTopics(text, "de");

      expect(topics).toContain("trauma");
      expect(topics).toContain("family");
    });

    it("should detect three topics: depression, anxiety, and relationships", () => {
      const text = "Ich bin traurig und depressiv, habe Panikattacken, und mein Partner und ich streiten ständig";
      const topics = detectTopics(text, "de");

      expect(topics).toContain("depression");
      expect(topics).toContain("anxiety");
      expect(topics).toContain("relationships");
    });

    it("should detect ADHD AND stress together", () => {
      const text = "Ich kann mich nie konzentrieren und bin ständig abgelenkt, und der Prüfungsdruck macht es noch schlimmer";
      const topics = detectTopics(text, "de");

      expect(topics).toContain("adhd");
      expect(topics).toContain("stress");
    });

    it("should detect eating disorders AND self-care issues together", () => {
      const text = "Ich kontrolliere mein Essen und zähle Kalorien, und habe ein schlechtes Selbstwertgefühl";
      const topics = detectTopics(text, "de");

      expect(topics).toContain("eating_disorders");
      expect(topics).toContain("self_care");
    });
  });

  describe("Detecting multiple different topics (English)", () => {
    it("should detect depression AND anxiety together", () => {
      const text = "I feel sad and hopeless all the time, and I also have panic attacks and severe anxiety";
      const topics = detectTopics(text, "en");

      expect(topics).toContain("depression");
      expect(topics).toContain("anxiety");
    });

    it("should detect burnout AND relationships together", () => {
      const text = "I'm completely burned out from work and my marriage is falling apart, we keep fighting";
      const topics = detectTopics(text, "en");

      expect(topics).toContain("burnout");
      expect(topics).toContain("relationships");
    });

    it("should detect trauma AND addiction together", () => {
      const text = "I have PTSD flashbacks from the accident and I've been drinking heavily to cope";
      const topics = detectTopics(text, "en");

      expect(topics).toContain("trauma");
      expect(topics).toContain("addiction");
    });
  });
});

// ============================================================================
// MULTIPLE SUBTOPICS DETECTION TESTS
// ============================================================================

describe("Multiple SubTopics Detection", () => {
  describe("Detecting multiple anxiety subtopics (German)", () => {
    it("should detect social anxiety AND panic attacks together", () => {
      const text = "Ich habe Angst unter Menschen zu sein und bekomme Panikattacken mit Herzrasen";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("social_anxiety");
      expect(subTopics).toContain("panic_attacks");
    });

    it("should detect phobias AND generalized anxiety together", () => {
      const text = "Ich habe Höhenangst und mache mir ständig Sorgen, grüble über alles nach";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("phobias");
      expect(subTopics).toContain("generalized_anxiety");
    });
  });

  describe("Detecting multiple depression subtopics (German)", () => {
    it("should detect chronic sadness AND lack of motivation together", () => {
      const text = "Ich bin immer traurig und habe keine Motivation, kann nicht aufstehen";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("chronic_sadness");
      expect(subTopics).toContain("lack_motivation");
    });

    it("should detect grief AND loneliness together", () => {
      const text = "Seit mein Vater gestorben ist, fühle ich mich so einsam, niemand versteht mich";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("grief");
      expect(subTopics).toContain("loneliness");
    });
  });

  describe("Detecting multiple relationship subtopics (German)", () => {
    it("should detect couple conflicts AND intimacy issues together", () => {
      const text = "Wir streiten ständig und haben keine Nähe mehr, keinen Sex";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("couple_conflicts");
      expect(subTopics).toContain("intimacy");
    });

    it("should detect breakup AND dating issues together", () => {
      const text = "Nach der Trennung habe ich Liebeskummer und schaffe es nicht, beim Dating jemanden zu finden";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("breakup");
      expect(subTopics).toContain("dating_issues");
    });
  });

  describe("Detecting multiple trauma subtopics (German)", () => {
    it("should detect PTSD AND childhood trauma together", () => {
      const text = "Ich habe Flashbacks von meiner Kindheit, wurde als Kind missbraucht";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("ptsd");
      expect(subTopics).toContain("childhood_trauma");
    });
  });

  describe("Detecting multiple burnout subtopics (German)", () => {
    it("should detect work stress AND exhaustion AND work-life balance together", () => {
      const text = "Ich habe so viel Arbeitsstress, bin völlig erschöpft und habe keine Zeit für meine Familie oder Freizeit";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("work_stress");
      expect(subTopics).toContain("exhaustion");
      expect(subTopics).toContain("work_life_balance");
    });
  });

  describe("Detecting multiple addiction subtopics (German)", () => {
    it("should detect alcohol AND drugs together", () => {
      const text = "Ich trinke viel Alkohol und kiffen tue ich auch oft";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("alcohol");
      expect(subTopics).toContain("drugs");
    });

    it("should detect gambling AND gaming addiction together", () => {
      const text = "Ich bin spielsüchtig beim Casino und bin süchtig nach Videospielen, spiele online spiele die ganze Nacht";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("behavioral_addiction");
      expect(subTopics).toContain("gaming");
    });
  });

  describe("Detecting multiple sleep subtopics (German)", () => {
    it("should detect insomnia AND nightmares together", () => {
      const text = "Ich kann nicht einschlafen und wenn dann habe ich Albträume";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("insomnia");
      expect(subTopics).toContain("nightmares");
    });
  });

  describe("Detecting subtopics across different categories (German)", () => {
    it("should detect subtopics from anxiety AND depression categories", () => {
      const text = "Ich habe Panikattacken und fühle mich völlig einsam, niemand ist für mich da";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("panic_attacks");
      expect(subTopics).toContain("loneliness");
    });

    it("should detect subtopics from burnout AND self-care categories", () => {
      const text = "Ich bin bei der Arbeit erschöpft und habe ein schlechtes Selbstwertgefühl, fühle mich wertlos";
      const subTopics = detectSubTopics(text, "de");

      expect(subTopics).toContain("exhaustion");
      expect(subTopics).toContain("self_esteem");
    });
  });
});

// ============================================================================
// LANGUAGE DETECTION TESTS
// ============================================================================

describe("Language Detection", () => {
  it("should detect German text", () => {
    const germanTexts = [
      "Ich fühle mich traurig und hoffnungslos",
      "Mein Partner und ich haben Beziehungsprobleme",
      "Die Arbeit macht mich völlig fertig",
    ];

    for (const text of germanTexts) {
      expect(detectLanguage(text)).toBe("de");
    }
  });

  it("should detect English text", () => {
    const englishTexts = [
      "I feel sad and hopeless",
      "My partner and I have relationship problems",
      "Work is completely exhausting me",
    ];

    for (const text of englishTexts) {
      expect(detectLanguage(text)).toBe("en");
    }
  });

  it("should detect German text with umlauts", () => {
    const text = "Ich fühle mich überfordert und ängstlich";
    expect(detectLanguage(text)).toBe("de");
  });
});

// ============================================================================
// EDGE CASES AND SPECIAL SCENARIOS
// ============================================================================

describe("Edge Cases", () => {
  describe("Mixed language input", () => {
    it("should handle mixed German/English text", () => {
      const text = "Ich habe work-life balance Probleme und bin stressed";
      // Should still detect as German due to more German indicators
      const topics = detectTopics(text, "de");
      expect(topics.length).toBeGreaterThan(0);
    });
  });

  describe("Case insensitivity", () => {
    it("should detect crisis keywords regardless of case", () => {
      const uppercaseResult = detectCrisis("ICH WILL NICHT MEHR LEBEN", "de");
      const lowercaseResult = detectCrisis("ich will nicht mehr leben", "de");
      const mixedResult = detectCrisis("Ich Will Nicht Mehr Leben", "de");

      expect(uppercaseResult.crisisDetected).toBe(true);
      expect(lowercaseResult.crisisDetected).toBe(true);
      expect(mixedResult.crisisDetected).toBe(true);
    });
  });

  describe("Partial keyword matches", () => {
    it("should detect topics with keywords in longer sentences", () => {
      const text = "Vor einigen Monaten hat sich bei mir eine Depression entwickelt und ich fühle mich sehr hoffnungslos";
      const topics = detectTopics(text, "de");
      expect(topics).toContain("depression");
    });
  });

  describe("Empty or minimal input", () => {
    it("should handle empty text gracefully", () => {
      const crisisResult = detectCrisis("", "de");
      expect(crisisResult.crisisDetected).toBe(false);

      const topics = detectTopics("", "de");
      expect(topics.length).toBe(0);

      const subTopics = detectSubTopics("", "de");
      expect(subTopics.length).toBe(0);
    });

    it("should handle very short text", () => {
      const topics = detectTopics("hallo", "de");
      expect(Array.isArray(topics)).toBe(true);
    });
  });

  describe("Priority of crisis types", () => {
    it("should prioritize suicidal over self_harm in order of severity", () => {
      // Text that contains both suicidal and self-harm keywords
      const text = "Ich will mich umbringen und mich ritzen";
      const result = detectCrisis(text, "de");

      // Should detect suicidal first as it's checked first (more severe)
      expect(result.crisisDetected).toBe(true);
      expect(result.crisisType).toBe("suicidal");
    });
  });
});

// ============================================================================
// COMPREHENSIVE SCENARIO TESTS
// ============================================================================

describe("Real-world Scenarios", () => {
  it("should handle a complex multi-issue description", () => {
    const text = `
      Ich bin seit Monaten depressiv und habe keine Motivation mehr.
      Mein Partner hat mich verlassen und ich fühle mich so einsam.
      Bei der Arbeit bin ich völlig überfordert und kann mich nicht konzentrieren.
      Nachts kann ich nicht schlafen und habe Albträume.
    `;

    const topics = detectTopics(text, "de");
    expect(topics.length).toBeGreaterThanOrEqual(3);
    expect(topics).toContain("depression");
    expect(topics).toContain("relationships");
    expect(topics).toContain("sleep");

    const subTopics = detectSubTopics(text, "de");
    expect(subTopics.length).toBeGreaterThanOrEqual(2);
  });

  it("should immediately flag a crisis in complex text", () => {
    const text = `
      Ich hatte schon länger Probleme mit Depressionen und Beziehungen.
      Aber jetzt möchte ich nicht mehr leben.
      Alles ist hoffnungslos.
    `;

    const result = detectCrisis(text, "de");
    expect(result.crisisDetected).toBe(true);
    expect(result.crisisType).toBe("suicidal");
  });

  it("should correctly identify anxiety without detecting crisis", () => {
    const text = "Ich habe Angst vor Prüfungen und bin nervös wenn ich vor anderen reden muss";

    const crisisResult = detectCrisis(text, "de");
    expect(crisisResult.crisisDetected).toBe(false);

    const topics = detectTopics(text, "de");
    expect(topics).toContain("anxiety");
  });
});
