import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from '@/lib/logger';

const geminiLogger = createLogger('Gemini');

const getApiKey = (): string => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in .env');
  }
  return apiKey;
};

let genAI: GoogleGenerativeAI | null = null;

const getClient = (): GoogleGenerativeAI => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(getApiKey());
  }
  return genAI;
};

export interface MusicSuggestion {
  name: string;
  artist: string;
}

/**
 * Generate music recommendations based on seed tracks using Gemini AI
 */
export const generateMusicRecommendations = async (
  seedTracks: { name: string; artist: string }[],
  limit: number = 20
): Promise<MusicSuggestion[]> => {
  geminiLogger.info(
    { seedCount: seedTracks.length, limit },
    'Generating music recommendations'
  );

  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  const seedList = seedTracks
    .map((t, i) => `${i + 1}. "${t.name}" - ${t.artist}`)
    .join('\n');

  const prompt = `You are a music recommendation expert. Based on these ${seedTracks.length} songs that a user likes:

${seedList}

Suggest ${limit} similar songs that the user would probably enjoy. Consider:
- Similar genres and subgenres
- Similar era/decade
- Similar mood and energy
- Related artists or musical influences
- Mix of popular and lesser-known tracks

IMPORTANT: Return ONLY a valid JSON array with no additional text, markdown, or explanation.
Format: [{"name": "song name", "artist": "artist name"}]

Return exactly ${limit} unique songs that are NOT in the input list.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    geminiLogger.debug({ rawResponse: text }, 'Gemini raw response');

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const suggestions: MusicSuggestion[] = JSON.parse(jsonStr);

    geminiLogger.info(
      { suggestionsCount: suggestions.length },
      'Music recommendations generated successfully'
    );

    return suggestions;
  } catch (error) {
    geminiLogger.error({ error }, 'Failed to generate recommendations');
    throw new Error('Failed to generate music recommendations from AI');
  }
};
