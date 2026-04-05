import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

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
];

function extractOpenAIChatText(content) {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item?.type === 'text') {
          return item.text || '';
        }

        return '';
      })
      .join('');
  }

  return '';
}

export async function callLLM(modelId, messages, apiKey) {
  const model = MODELS.find((entry) => entry.id === modelId);

  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  if (model.provider === 'openai') {
    const openai = new OpenAI({ apiKey });
    const systemMessage = messages.find((message) => message.role === 'system');
    const chatMessages = messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    if (modelId.startsWith('gpt-5')) {
      const response = await openai.responses.create({
        model: modelId,
        instructions: systemMessage?.content,
        input: chatMessages.map((message) => ({
          role: message.role,
          content: [{ type: 'input_text', text: message.content }],
        })),
        reasoning: { effort: 'none' },
        text: { verbosity: 'medium' },
        max_output_tokens: 4096,
      });

      return {
        text: response.output_text || '',
        tokensUsed: response.usage?.total_tokens || 0,
      };
    }

    const response = await openai.chat.completions.create({
      model: modelId,
      messages: [
        ...(systemMessage
          ? [{ role: 'system', content: systemMessage.content }]
          : []),
        ...chatMessages,
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    return {
      text: extractOpenAIChatText(response.choices[0]?.message?.content),
      tokensUsed: response.usage?.total_tokens || 0,
    };
  }

  if (model.provider === 'google') {
    const genAI = new GoogleGenerativeAI(apiKey);
    const googleModel = genAI.getGenerativeModel({ model: modelId });
    const systemMessage = messages.find((message) => message.role === 'system');
    const userContent = messages
      .filter((message) => message.role !== 'assistant')
      .map((message) => message.content)
      .join('\n\n');
    const prompt = systemMessage
      ? `${systemMessage.content}\n\n---\n\n${userContent}`
      : userContent;

    const result = await googleModel.generateContent(prompt);
    const text = result.response.text();

    return {
      text,
      tokensUsed: Math.ceil(prompt.length / 4) + Math.ceil(text.length / 4),
    };
  }

  if (model.provider === 'anthropic') {
    const anthropic = new Anthropic({ apiKey });
    const systemMessage = messages.find((message) => message.role === 'system');
    const chatMessages = messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    const response = await anthropic.messages.create({
      model: modelId,
      system: systemMessage?.content,
      messages: chatMessages,
      max_tokens: 4096,
    });

    return {
      text: response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join(''),
      tokensUsed:
        (response.usage?.input_tokens || 0) +
        (response.usage?.output_tokens || 0),
    };
  }

  throw new Error(`Unsupported provider: ${model.provider}`);
}
