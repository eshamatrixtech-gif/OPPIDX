// lib/ai/genuineAnalyzer.ts

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeGenuineness(
  frontImage: string,
  backImage: string,
  caption?: string
): Promise<number> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are analyzing a BeReal-style moment for genuineness and mental wellness value.

Score from 0-100 based on:
- Authenticity (does it feel real, unfiltered?)
- Presence (is the person engaged in the moment?)
- Positivity (without being fake)
- Connection (meaningful activity vs mindless scrolling)

Deduct points for:
- Signs of staged/fake content
- Doomscrolling or passive consumption
- Late night unhealthy behavior
- Signs of comparison/envy seeking

Return ONLY a number 0-100.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this moment. Caption: "${caption || 'No caption'}"`,
            },
            {
              type: 'image_url',
              image_url: { url: frontImage },
            },
            {
              type: 'image_url',
              image_url: { url: backImage },
            },
          ],
        },
      ],
      max_tokens: 10,
    })

    const score = parseInt(response.choices[0]?.message?.content || '50', 10)
    return Math.min(100, Math.max(0, score))
  } catch (error) {
    console.error('Genuineness analysis failed:', error)
    return 50 // Default score on error
  }
}