import type { IncomingMessage, ServerResponse } from 'node:http';

const MAX_BODY_BYTES = 150_000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
const ipHits = new Map<string, number[]>();

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage & { body?: unknown }): Promise<string | null> {
  if (req.body) {
    return Promise.resolve(
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    );
  }
  return new Promise(resolve => {
    let size = 0;
    let tooLarge = false;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        if (!tooLarge) {
          tooLarge = true;
          chunks.length = 0;
          resolve(null);
        }
        return;
      }
      if (!tooLarge) chunks.push(c);
    });
    req.on('end', () => resolve(tooLarge ? null : Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve(null));
  });
}

async function callGroq(
  apiKey: string,
  messages: ChatMessage[],
  model: string,
): Promise<string | null> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.35,
      max_tokens: 2500,
      top_p: 0.9,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? null;
}

async function callGemini(
  apiKey: string,
  system: string,
  prompt: string,
  model: string,
): Promise<string | null> {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model,
      contents: prompt.slice(0, 60_000),
      config: {
        systemInstruction: system.slice(0, 8_000),
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 2_000,
      },
    });
    return result.text ?? null;
  } catch {
    return null;
  }
}

export default async function handler(
  req: IncomingMessage & { body?: unknown; query?: Record<string, string> },
  res: ServerResponse,
) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  const groqKey = process.env.GROQ_API_KEY || '';
  const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const hasProvider = Boolean(groqKey || geminiKey);
  const activeProvider = groqKey ? 'groq' : geminiKey ? 'gemini' : 'none';

  if (req.method === 'GET') {
    return send(res, 200, { available: hasProvider, provider: activeProvider });
  }

  if (req.method !== 'POST') {
    return send(res, 405, { error: 'method_not_allowed' });
  }

  if (!hasProvider) {
    return send(res, 503, { error: 'not_configured' });
  }

  // Rate Limiting (60 requests per minute per IP)
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  const now = Date.now();
  const history = (ipHits.get(clientIp) || []).filter(t => now - t < WINDOW_MS);
  if (history.length >= MAX_PER_WINDOW) {
    return send(res, 429, { error: 'rate_limited' });
  }
  ipHits.set(clientIp, [...history, now]);

  const raw = await readBody(req);
  if (raw === null) {
    return send(res, 413, { error: 'too_large' });
  }

  let body: {
    system?: unknown;
    prompt?: unknown;
    messages?: unknown;
  };

  try {
    body = JSON.parse(raw);
  } catch {
    return send(res, 400, { error: 'bad_request' });
  }

  if (typeof body.system !== 'string' || typeof body.prompt !== 'string' || !body.prompt.trim()) {
    return send(res, 400, { error: 'bad_request' });
  }

  const chatMessages: ChatMessage[] = [];
  chatMessages.push({ role: 'system', content: body.system.slice(0, 10_000) });

  if (Array.isArray(body.messages)) {
    for (const m of body.messages) {
      if (
        typeof m === 'object' &&
        m !== null &&
        typeof (m as ChatMessage).role === 'string' &&
        typeof (m as ChatMessage).content === 'string' &&
        ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant')
      ) {
        chatMessages.push({
          role: (m as ChatMessage).role,
          content: (m as ChatMessage).content.slice(0, 8_000),
        });
      }
    }
  }

  chatMessages.push({ role: 'user', content: body.prompt.slice(0, 60_000) });

  let text: string | null = null;

  // Try Groq first (ultra-fast)
  if (groqKey) {
    try {
      text = await callGroq(groqKey, chatMessages, groqModel);
    } catch {
      text = null;
    }
  }

  // Fallback to Gemini if Groq failed or not set
  if (!text && geminiKey) {
    try {
      const flatPrompt = chatMessages
        .filter(m => m.role !== 'system')
        .map(m => `${m.role === 'user' ? 'Student' : 'Copilot'}: ${m.content}`)
        .join('\n\n');
      text = await callGemini(geminiKey, body.system, flatPrompt, geminiModel);
    } catch {
      text = null;
    }
  }

  if (text) {
    return send(res, 200, { text });
  }

  return send(res, 502, { error: 'upstream_error' });
}
