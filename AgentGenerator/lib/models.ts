import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export const MODELS = [
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        description: 'OpenAI flagship — fast, reliable, widely supported',
        costTier: '$$',
        color: '#10a37f',
    },
    {
        id: 'gpt-5.4',
        name: 'GPT-5.4',
        provider: 'openai',
        description: 'OpenAI\'s frontier model — 1M context, native computer use',
        costTier: '$$$',
        color: '#10a37f',
    },
    {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro',
        provider: 'google',
        description: 'Google\'s frontier multimodal model (preview)',
        costTier: '$$',
        color: '#4285f4',
    },
    {
        id: 'claude-sonnet-4-6',
        name: 'Claude Sonnet 4.6',
        provider: 'anthropic',
        description: 'Anthropic\'s workhorse — speed + intelligence, 1M context',
        costTier: '$$',
        color: '#d97757',
    },
    {
        id: 'claude-opus-4-6',
        name: 'Claude Opus 4.6',
        provider: 'anthropic',
        description: 'Anthropic\'s most capable frontier model for complex agentic tasks',
        costTier: '$$$$',
        color: '#d97757',
    },
] as const;

export type ModelId = typeof MODELS[number]['id'];

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResult {
    text: string;
    tokensUsed: number;
}

/**
 * Call an LLM and return the full text response + token count.
 * apiKey is the BYOK key forwarded from the client.
 */
interface ModelDef {
    id: string;
    name: string;
    provider: 'openai' | 'google' | 'anthropic';
    description: string;
    costTier: string;
    color: string;
}

export async function callLLM(
    modelId: ModelId,
    messages: LLMMessage[],
    apiKey: string,
): Promise<LLMResult> {
    const model = MODELS.find((m) => m.id === modelId) as ModelDef | undefined;
    if (!model) throw new Error(`Unknown model: ${modelId}`);

    if (model.provider === 'openai') {
        const openai = new OpenAI({ apiKey });
        const systemMsg = messages.find((m) => m.role === 'system');
        const chatMessages = messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

        const response = await openai.chat.completions.create({
            model: modelId,
            messages: [
                ...(systemMsg ? [{ role: 'system' as const, content: systemMsg.content }] : []),
                ...chatMessages,
            ],
            temperature: 0.7,
            max_tokens: 4096,
        });

        return {
            text: response.choices[0].message.content ?? '',
            tokensUsed: response.usage?.total_tokens ?? 0,
        };
    }

    if (model.provider === 'google') {
        const genAI = new GoogleGenerativeAI(apiKey);
        const geminiModel = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });

        const systemMsg = messages.find((m) => m.role === 'system');
        const userMessages = messages.filter((m) => m.role === 'user');
        const prompt = userMessages.map((m) => m.content).join('\n\n');
        const fullPrompt = systemMsg ? `${systemMsg.content}\n\n---\n\n${prompt}` : prompt;

        const result = await geminiModel.generateContent(fullPrompt);
        const text = result.response.text();
        const tokensUsed = Math.ceil(fullPrompt.length / 4) + Math.ceil(text.length / 4);

        return { text, tokensUsed };
    }

    if (model.provider === 'anthropic') {
        const anthropic = new Anthropic({ apiKey });
        const systemMsg = messages.find((m) => m.role === 'system');
        const chatMessages = messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

        const response = await anthropic.messages.create({
            model: modelId, // claude-sonnet-4-6 or claude-opus-4-6
            max_tokens: 4096,
            system: systemMsg?.content,
            messages: chatMessages,
        });

        const text = response.content
            .filter((b) => b.type === 'text')
            .map((b) => (b as { type: 'text'; text: string }).text)
            .join('');

        return {
            text,
            tokensUsed: (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0),
        };
    }

    throw new Error(`Unsupported provider: ${(model as ModelDef).provider}`);
}
