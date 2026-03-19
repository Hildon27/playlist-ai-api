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

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface MusicSuggestion {
  name: string;
  artist: string;
}

export interface MusicRecommendationResponse {
  message: string;
  suggestions: MusicSuggestion[];
}

/**
 * Generate music recommendations based on seed tracks using Gemini AI
 * Returns both the song suggestions and an interactive message explaining the choices
 */
export const generateMusicRecommendations = async (
  seedTracks: { name: string; artist: string }[],
  limit: number = 20
): Promise<MusicRecommendationResponse> => {
  geminiLogger.info(
    { seedCount: seedTracks.length, limit },
    'Generating music recommendations'
  );

  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-3-flash-preview',
  });

  const seedList = seedTracks
    .map((t, i) => `${i + 1}. "${t.name}" - ${t.artist}`)
    .join('\n');

  const prompt = `Você é um especialista em recomendações musicais com personalidade amigável e envolvente. 
O usuário escolheu estas ${seedTracks.length} músicas para criar uma playlist:

${seedList}

Sua tarefa:
1. Analise as músicas escolhidas pelo usuário e identifique padrões (gênero, mood, época, artistas)
2. Sugira ${limit} músicas similares que o usuário provavelmente vai adorar

Considere ao recomendar:
- Gêneros e subgêneros similares
- Era/década similar
- Mood e energia parecidos
- Artistas relacionados ou influências musicais
- Mix de faixas populares e menos conhecidas

IMPORTANTE: Retorne APENAS um JSON válido sem texto adicional, markdown ou explicação fora do JSON.

Formato obrigatório:
{
  "message": "Uma mensagem amigável e personalizada (2-4 parágrafos) em português brasileiro que:
    - Comente sobre o gosto musical do usuário baseado nas músicas que ele escolheu
    - Explique brevemente o que você identificou nas escolhas dele (mood, gênero, época)
    - Apresente as recomendações explicando por que elas combinam com o perfil musical dele
    - Use um tom descontraído e entusiasmado, como se fosse um amigo apaixonado por música",
  "suggestions": [{"name": "nome da música", "artist": "nome do artista"}]
}

Retorne exatamente ${limit} músicas únicas que NÃO estejam na lista original.`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
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

      const parsed = JSON.parse(jsonStr) as MusicRecommendationResponse;

      geminiLogger.info(
        { suggestionsCount: parsed.suggestions.length },
        'Music recommendations generated successfully'
      );

      return {
        message: parsed.message,
        suggestions: parsed.suggestions,
      };
    } catch (error: unknown) {
      const status = (error as { status?: number }).status;
      const isRetryable = status === 429 || status === 503;

      if (isRetryable && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        geminiLogger.warn(
          { attempt, maxRetries: MAX_RETRIES, delay, status },
          `Retryable error (${status}), retrying in ${delay}ms...`
        );
        await sleep(delay);
        continue;
      }

      geminiLogger.error(
        { error, attempt },
        'Failed to generate recommendations'
      );
      throw new Error('Failed to generate music recommendations from AI');
    }
  }

  throw new Error('Failed to generate music recommendations from AI');
};
