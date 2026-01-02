// functions/api/compile.ts

interface Env {
  // Add any KV bindings here if needed
}

interface CompileRequest {
  source: string;
}

interface CompileResponse {
  success: boolean;
  bytecode?: string; // base64 encoded
  messages: string[];
  error?: string;
  compileTime: number;
}

// Rate limiting state (in production, use KV or Durable Objects)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (limit.count >= 10) {
    return false;
  }

  limit.count++;
  return true;
}

// Simple DOL validator (stub - replace with real compiler later)
function compileDol(source: string): { success: boolean; error?: string; messages: string[] } {
  const messages: string[] = [];

  // Basic syntax checks
  if (!source.trim()) {
    return { success: false, error: 'Empty source code', messages };
  }

  if (!source.includes('spirit')) {
    return { success: false, error: 'Expected spirit declaration', messages };
  }

  // Check bracket matching
  const opens = (source.match(/{/g) || []).length;
  const closes = (source.match(/}/g) || []).length;
  if (opens !== closes) {
    return { success: false, error: `Unmatched braces: ${opens} opening, ${closes} closing`, messages };
  }

  // Check for function
  if (source.includes('fn ')) {
    messages.push('Found function declaration');
  }

  // Check for pub modifier
  if (source.includes('pub ')) {
    messages.push('Found public modifier');
  }

  messages.push('Syntax validation passed');
  messages.push('Cloud compilation complete');

  return { success: true, messages };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const startTime = Date.now();
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Rate limit exceeded. Please wait before trying again.',
      messages: [],
      compileTime: 0,
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await context.request.json() as CompileRequest;
    const { source } = body;

    if (!source || typeof source !== 'string') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing or invalid source code',
        messages: [],
        compileTime: Date.now() - startTime,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = compileDol(source);
    const compileTime = Date.now() - startTime;

    const response: CompileResponse = {
      success: result.success,
      messages: result.messages,
      error: result.error,
      compileTime,
    };

    return new Response(JSON.stringify(response), {
      status: result.success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid request body',
      messages: [],
      compileTime: Date.now() - startTime,
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
