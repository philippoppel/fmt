"use server";

import Groq from "groq-sdk";
import { auth } from "@/lib/auth";

// Lazy init Groq client
let groq: Groq | null = null;
function getGroqClient(): Groq {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

// Strip HTML tags for AI processing
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Suggest relevant tags for a blog post
 */
export async function suggestTags(content: string): Promise<{
  tags: string[];
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { tags: [], error: "Nicht authentifiziert" };
  }

  const plainText = stripHtml(content);
  if (plainText.length < 50) {
    return { tags: [], error: "Zu wenig Inhalt für Tag-Vorschläge" };
  }

  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Du bist ein SEO-Experte für psychologische und therapeutische Inhalte.
Analysiere den folgenden Blog-Artikel und schlage 3-5 relevante Tags vor.
Die Tags sollten:
- Kurz und prägnant sein (1-3 Wörter)
- Relevant für Therapie, Psychologie oder Gesundheit sein
- Suchmaschinenoptimiert sein
- Auf Deutsch sein

Antworte NUR mit einem JSON-Objekt im Format: {"tags": ["Tag1", "Tag2", "Tag3"]}`,
        },
        {
          role: "user",
          content: plainText.slice(0, 3000),
        },
      ],
      temperature: 0.3,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      return { tags: [], error: "Keine Antwort vom AI-Service" };
    }

    const parsed = JSON.parse(responseContent);
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.filter((t: unknown) => typeof t === "string").slice(0, 5)
      : [];

    return { tags };
  } catch (error) {
    console.error("Tag suggestion error:", error);
    return { tags: [], error: "Fehler bei der Tag-Generierung" };
  }
}

/**
 * Generate key takeaways from a blog post
 */
export async function generateTakeaways(content: string): Promise<{
  takeaways: string[];
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { takeaways: [], error: "Nicht authentifiziert" };
  }

  const plainText = stripHtml(content);
  if (plainText.length < 100) {
    return { takeaways: [], error: "Zu wenig Inhalt für Takeaways" };
  }

  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für therapeutische Inhalte und hilfst dabei, die wichtigsten Erkenntnisse aus Fachartikeln zusammenzufassen.
Erstelle 3-5 prägnante Key Takeaways aus dem folgenden Artikel.
Die Takeaways sollten:
- Die wichtigsten Erkenntnisse zusammenfassen
- Für Laien verständlich sein
- Handlungsorientiert formuliert sein, wo möglich
- Auf Deutsch sein
- Jeweils 1-2 Sätze lang sein

Antworte NUR mit einem JSON-Objekt im Format: {"takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]}`,
        },
        {
          role: "user",
          content: plainText.slice(0, 4000),
        },
      ],
      temperature: 0.4,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      return { takeaways: [], error: "Keine Antwort vom AI-Service" };
    }

    const parsed = JSON.parse(responseContent);
    const takeaways = Array.isArray(parsed.takeaways)
      ? parsed.takeaways.filter((t: unknown) => typeof t === "string").slice(0, 5)
      : [];

    return { takeaways };
  } catch (error) {
    console.error("Takeaway generation error:", error);
    return { takeaways: [], error: "Fehler bei der Takeaway-Generierung" };
  }
}

/**
 * Generate SEO meta description for a blog post
 */
export async function generateMetaDescription(
  content: string,
  title: string
): Promise<{
  metaDescription: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { metaDescription: "", error: "Nicht authentifiziert" };
  }

  const plainText = stripHtml(content);
  if (plainText.length < 50) {
    return { metaDescription: "", error: "Zu wenig Inhalt für Meta-Description" };
  }

  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Du bist ein SEO-Experte für therapeutische und psychologische Inhalte.
Erstelle eine optimierte Meta-Description für den folgenden Artikel.
Die Meta-Description sollte:
- Zwischen 120-155 Zeichen lang sein
- Das Hauptthema klar kommunizieren
- Zum Klicken anregen
- Das Haupt-Keyword natürlich einbinden
- Auf Deutsch sein

Antworte NUR mit einem JSON-Objekt im Format: {"metaDescription": "Die Meta-Description hier"}`,
        },
        {
          role: "user",
          content: `Titel: ${title}\n\nInhalt: ${plainText.slice(0, 2000)}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 150,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      return { metaDescription: "", error: "Keine Antwort vom AI-Service" };
    }

    const parsed = JSON.parse(responseContent);
    const metaDescription =
      typeof parsed.metaDescription === "string" ? parsed.metaDescription : "";

    return { metaDescription };
  } catch (error) {
    console.error("Meta description generation error:", error);
    return { metaDescription: "", error: "Fehler bei der Meta-Description-Generierung" };
  }
}

/**
 * Generate alternative title suggestions
 */
export async function suggestTitles(
  content: string,
  currentTitle: string
): Promise<{
  titles: string[];
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { titles: [], error: "Nicht authentifiziert" };
  }

  const plainText = stripHtml(content);
  if (plainText.length < 100) {
    return { titles: [], error: "Zu wenig Inhalt für Titel-Vorschläge" };
  }

  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für SEO-optimierte und ansprechende Überschriften im Bereich Psychologie und Therapie.
Erstelle 3 alternative Titelvorschläge für den folgenden Artikel.
Die Titel sollten:
- Aufmerksamkeitsstark sein
- Das Thema klar kommunizieren
- SEO-optimiert sein (50-60 Zeichen ideal)
- Unterschiedliche Ansätze verfolgen (z.B. Frage, Nutzenversprechen, How-to)
- Auf Deutsch sein

Antworte NUR mit einem JSON-Objekt im Format: {"titles": ["Titel 1", "Titel 2", "Titel 3"]}`,
        },
        {
          role: "user",
          content: `Aktueller Titel: ${currentTitle}\n\nInhalt: ${plainText.slice(0, 2000)}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      return { titles: [], error: "Keine Antwort vom AI-Service" };
    }

    const parsed = JSON.parse(responseContent);
    const titles = Array.isArray(parsed.titles)
      ? parsed.titles.filter((t: unknown) => typeof t === "string").slice(0, 3)
      : [];

    return { titles };
  } catch (error) {
    console.error("Title suggestion error:", error);
    return { titles: [], error: "Fehler bei der Titel-Generierung" };
  }
}

/**
 * Simplify complex text for better readability
 */
export async function simplifyText(text: string): Promise<{
  simplifiedText: string;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { simplifiedText: "", error: "Nicht authentifiziert" };
  }

  const plainText = stripHtml(text);
  if (plainText.length < 20) {
    return { simplifiedText: "", error: "Zu wenig Text zum Vereinfachen" };
  }

  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Du bist ein Experte für verständliche Kommunikation im Bereich Psychologie und Therapie.
Vereinfache den folgenden Text, ohne den fachlichen Inhalt zu verfälschen.
Der vereinfachte Text sollte:
- Für Laien verständlich sein
- Fachbegriffe erklären oder ersetzen
- Kurze, klare Sätze verwenden
- Die Kernaussage erhalten
- Auf Deutsch sein

Antworte NUR mit einem JSON-Objekt im Format: {"simplifiedText": "Der vereinfachte Text hier"}`,
        },
        {
          role: "user",
          content: plainText.slice(0, 1500),
        },
      ],
      temperature: 0.4,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      return { simplifiedText: "", error: "Keine Antwort vom AI-Service" };
    }

    const parsed = JSON.parse(responseContent);
    const simplifiedText =
      typeof parsed.simplifiedText === "string" ? parsed.simplifiedText : "";

    return { simplifiedText };
  } catch (error) {
    console.error("Text simplification error:", error);
    return { simplifiedText: "", error: "Fehler bei der Textvereinfachung" };
  }
}

/**
 * Check if Groq API is configured and working
 */
export async function checkAIAvailability(): Promise<boolean> {
  if (!process.env.GROQ_API_KEY) {
    return false;
  }

  try {
    const client = getGroqClient();
    await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 5,
    });
    return true;
  } catch {
    return false;
  }
}
