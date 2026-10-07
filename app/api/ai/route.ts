import OpenAI from 'openai';
import type { AIProvider } from '@/constants/providers';
import Chat from '@/models/Chat';
import User from '@/models/User';
import type { ICustomAIModel } from '@/models/User';
import connectDB from '@/database/db';
import { getUserIdFromRequest } from '@/server/auth';
import { NextRequest, NextResponse } from 'next/server';

const PRAJAPATT_AI_CONFIG = {
  baseURL: process.env.PRAJAPATT_AI_BASE_URL || '',
  apiKey: process.env.PRAJAPATT_AI_API_KEY || '',
};

const DEFAULT_PRAJAPATT_MODEL =
  process.env.PRAJAPATT_AI_MODEL || 'prajapatt-1';

const MODEL_PROVIDERS = {
  anthropic: {
    url: 'https://api.anthropic.com/v1/models',
    headers: (apiKey: string) => ({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/models',
    headers: (apiKey: string) => ({ Authorization: `Bearer ${apiKey}` }),
  },
  openai: {
    url: 'https://api.openai.com/v1/models',
    headers: (apiKey: string) => ({ Authorization: `Bearer ${apiKey}` }),
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/models',
    headers: (apiKey: string) => ({ Authorization: `Bearer ${apiKey}` }),
  },
} as const;

type ModelProvider = AIProvider;

interface CustomProviderConfig {
  provider: ModelProvider;
  baseUrl: string;
  model: string;
  apiKey: string;
}

interface ChatRequestBody {
  action?: 'models';
  chatId: string;
  prompt: string;
  images?: string[];
  model?: string;
  customModelId?: string;
  customModel?: Pick<CustomProviderConfig, 'provider' | 'apiKey'>;
}

const isLocalChatId = (chatId: string): boolean =>
  chatId.startsWith('temp_') ||
  chatId.startsWith('local_') ||
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    chatId,
  );

async function discoverModels(
  provider: ModelProvider,
  apiKey: string,
): Promise<string[]> {
  const config = MODEL_PROVIDERS[provider];
  const response = await fetch(config.url, {
    headers: config.headers(apiKey),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    data?: Array<{ id?: string; name?: string }>;
    models?: Array<{ id?: string; name?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      payload.error?.message || 'Unable to fetch provider models',
    );
  }

  return [
    ...new Set(
      (payload.data || payload.models || [])
        .map((item) => item.id || item.name || '')
        .filter(Boolean)
        .map((id) => id.replace(/^models\//, '')),
    ),
  ];
}

async function* generateAIResponse(
  model: string,
  contentMessage: any,
  customModel?: CustomProviderConfig,
  userId?: string | null,
): AsyncGenerator<string, void, unknown> {
  const provider = customModel?.apiKey
    ? {
        baseURL: customModel.baseUrl,
        apiKey: customModel.apiKey,
        model: customModel.model,
        provider: customModel.provider,
      }
    : {
        ...PRAJAPATT_AI_CONFIG,
        model: DEFAULT_PRAJAPATT_MODEL,
        provider: 'prajapatt',
      };

  if (
    customModel &&
    (provider.baseURL.includes('openrouter.ai') ||
      provider.baseURL.includes('openrouter'))
  ) {
    throw new Error('OpenRouter custom models are not allowed');
  }

  if (!provider.apiKey || !provider.baseURL || !provider.model) {
    throw new Error('Prajapatt AI provider is not configured');
  }

  if (provider.provider === 'anthropic') {
    yield* streamAnthropicResponse(
      provider.apiKey,
      contentMessage,
      provider.model,
    );
    return;
  }

  const client = new OpenAI({
    baseURL: provider.baseURL,
    apiKey: provider.apiKey,
  });

  yield* streamOpenAIResponse(
    client,
    [{ role: 'user', content: contentMessage }],
    provider.model,
    userId,
  );
}

async function* streamOpenAIResponse(
  openai: OpenAI,
  messages: any,
  model: string,
  userId?: string | null,
) {
  const stream = await openai.chat.completions.create({
    messages,
    model,
    stream: true,
    ...(userId ? { user: userId } : {}),
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield content;
    }
  }
}

async function* streamAnthropicResponse(
  apiKey: string,
  contentMessage: unknown,
  model: string,
): AsyncGenerator<string, void, unknown> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      stream: true,
      messages: [{ role: 'user', content: contentMessage }],
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Anthropic API error: ${await response.text()}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';
    for (const event of events) {
      const dataLine = event
        .split('\n')
        .find((line) => line.startsWith('data: '));
      if (!dataLine) continue;
      const data = JSON.parse(dataLine.slice(6)) as {
        type?: string;
        delta?: { text?: string };
      };
      if (data.type === 'content_block_delta' && data.delta?.text) {
        yield data.delta.text;
      }
    }
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const userId = await getUserIdFromRequest(req);
    const requestBody: ChatRequestBody = await req.json();

    if (requestBody.action === 'models') {
      const provider = requestBody.customModel?.provider;
      const apiKey = requestBody.customModel?.apiKey?.trim();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (!provider || !apiKey) {
        return NextResponse.json(
          { error: 'Provider and API key are required' },
          { status: 400 },
        );
      }

      try {
        return NextResponse.json({
          models: await discoverModels(provider, apiKey),
        });
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error ? error.message : 'Unable to fetch models',
          },
          { status: 502 },
        );
      }
    }

    if (!userId && !isLocalChatId(requestBody.chatId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      chatId,
      prompt,
      images = [],
      model = 'prajapatt',
      customModelId,
    } = requestBody;

    let customModel: CustomProviderConfig | undefined;
    let chatData: any = null;
    if (userId && isLocalChatId(chatId)) {
      return NextResponse.json(
        { error: 'A persisted chat is required' },
        { status: 400 },
      );
    }

    if (userId) {
      const db = await connectDB();
      if (!db) {
        return NextResponse.json(
          { error: 'Database unavailable; try again later' },
          { status: 503 },
        );
      }

      const [userResult, authenticatedChat] = await Promise.all([
        customModelId ? User.findOne({ firebaseUid: userId }).lean() : null,
        Chat.findOne({ userId, _id: chatId }),
      ]);

      chatData = authenticatedChat;

      if (customModelId) {
        const user = userResult as {
          customAIModels?: ICustomAIModel[];
        } | null;
        customModel = user?.customAIModels?.find(
          (savedModel: ICustomAIModel) => savedModel.id === customModelId,
        );
        if (!customModel) {
          return NextResponse.json(
            { error: 'Saved AI model not found' },
            { status: 404 },
          );
        }
      }

      if (!chatData) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: 'Chat not found',
          }),
          { status: 404 },
        );
      }
    }

    const contentMessage =
      images.length > 0
        ? [
            { type: 'text' as const, text: prompt },
            ...images.map((image) => ({
              type: 'image_url' as const,
              image_url: { url: image },
            })),
          ]
        : prompt;

    const userPrompt = {
      role: 'user' as const,
      content:
        images.length > 0
          ? [
              { type: 'text' as const, text: prompt },
              ...images.map((image) => ({
                type: 'image_url' as const,
                image_url: { url: image },
              })),
            ]
          : prompt,
      timestamp: Date.now(),
    };

    let userMessageSave: Promise<unknown> | undefined;
    if (chatData) {
      chatData.messages.push(userPrompt);
      userMessageSave = chatData.save().catch((error: unknown) => {
        console.error('Error saving user message:', error);
      });
    }

    let fullResponse = '';
    const generator = generateAIResponse(
      model,
      contentMessage,
      customModel,
      userId,
    );

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generator) {
            fullResponse += chunk;
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(chunk));
          }

          if (chatData && fullResponse) {
            try {
              await userMessageSave;
              chatData.messages.push({
                role: 'assistant',
                content: fullResponse,
                timestamp: Date.now(),
                isVoiceMessage: false,
              });
              await chatData.save();
              console.log('Assistant message saved to database');
            } catch (saveError: any) {
              console.error('Error saving assistant message:', saveError);
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 },
    );
  }
}
