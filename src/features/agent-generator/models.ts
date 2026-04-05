export const MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Fast and reliable OpenAI general-purpose model.',
    costTier: '$$',
    color: '#10a37f',
  },
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    provider: 'openai',
    description: 'Frontier OpenAI model for multi-step reasoning and coding.',
    costTier: '$$$',
    color: '#10a37f',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    description: 'Google frontier multimodal preview model.',
    costTier: '$$',
    color: '#4285f4',
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    description: 'Anthropic workhorse model for fast high-quality output.',
    costTier: '$$',
    color: '#d97757',
  },
  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'anthropic',
    description: 'Anthropic flagship model for deep reasoning tasks.',
    costTier: '$$$$',
    color: '#d97757',
  },
] as const;

export type ModelId = (typeof MODELS)[number]['id'];
