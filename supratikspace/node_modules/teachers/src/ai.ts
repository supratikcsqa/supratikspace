import type { AiScoreResult } from './types'

interface AiSheetImage {
  name: string
  dataUrl: string
}

interface CalculateScoresInput {
  apiKey: string
  model: string
  images: AiSheetImage[]
}

const SYSTEM_PROMPT = `You read teacher-marked answer sheet pages.
Extract only marks that the teacher has explicitly awarded.
Do not invent question labels or totals.
If a mark is ambiguous, keep the exact written form in awardedRaw and explain it in note.
Return one entry per clearly visible awarded mark or per clearly visible total row.
possibleRaw should be an empty string when the maximum marks are not visible.
confidence must be between 0 and 1.`

const USER_PROMPT = `Review these marked answer-sheet pages.
Return structured score suggestions that the teacher can edit.
Use short question labels like Q1, Q2(a), Total, or Page note only when visible evidence supports them.
Never guess hidden marks.
If the same mark appears twice across pages, keep only one entry.`

function extractResponseText(payload: any): string {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text
  }

  const outputItems = Array.isArray(payload?.output) ? payload.output : []

  for (const item of outputItems) {
    const contentItems = Array.isArray(item?.content) ? item.content : []

    for (const content of contentItems) {
      if (typeof content?.text === 'string' && content.text.trim()) {
        return content.text
      }
    }
  }

  throw new Error('The AI response did not include any structured text output.')
}

export async function calculateScoresWithOpenAI(
  input: CalculateScoresInput,
): Promise<AiScoreResult> {
  if (!input.apiKey.trim()) {
    throw new Error('Add an OpenAI API key before running AI score calculation.')
  }

  if (input.images.length === 0) {
    throw new Error('Select at least one marked page for AI score calculation.')
  }

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      entries: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            label: { type: 'string' },
            awardedRaw: { type: 'string' },
            possibleRaw: { type: 'string' },
            note: { type: 'string' },
            confidence: { type: 'number' },
          },
          required: ['label', 'awardedRaw', 'possibleRaw', 'note', 'confidence'],
        },
      },
      summary: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['entries', 'summary'],
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: input.model || 'gpt-5',
      store: false,
      instructions: SYSTEM_PROMPT,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: USER_PROMPT },
            ...input.images.map((image) => ({
              type: 'input_image',
              image_url: image.dataUrl,
              detail: 'high',
            })),
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'paper_scores',
          strict: true,
          schema,
        },
      },
    }),
  })

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'The AI score calculation request failed.')
  }

  const rawText = extractResponseText(payload)
  const parsed = JSON.parse(rawText)

  return {
    entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    summary: Array.isArray(parsed.summary) ? parsed.summary : [],
  }
}
