interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * ConceptNet MCP — open multilingual word/phrase relation graph
 *
 * Auth: none. ~3600 req/hr/IP.
 * Docs: https://github.com/commonsense/conceptnet5/wiki/API
 */


const BASE = 'https://api.conceptnet.io';

const tools: McpToolExport['tools'] = [
  {
    name: 'lookup',
    description: 'All edges touching a term in a language.',
    inputSchema: {
      type: 'object',
      properties: {
        term: { type: 'string', description: 'Word or phrase' },
        lang: { type: 'string', description: 'ISO-639-1 code (default en)' },
        limit: { type: 'number', description: '1-1000 (default 50)' },
        offset: { type: 'number', description: '0-based offset' },
        only_rel: { type: 'string', description: 'Restrict to one relation (e.g. "IsA", "UsedFor")' },
        end_node_lang: { type: 'string', description: 'Restrict end-node language' },
      },
      required: ['term'],
    },
  },
  {
    name: 'query',
    description: 'Generic /query edge search (combine rel, start, end, node, source).',
    inputSchema: {
      type: 'object',
      properties: {
        rel: { type: 'string', description: 'Relation URI (with or without /r/ prefix)' },
        start: { type: 'string', description: 'Start node — "/c/en/dog" or "dog"' },
        end: { type: 'string', description: 'End node' },
        node: { type: 'string', description: 'Match either start or end' },
        source: { type: 'string', description: 'Source dataset URI' },
        limit: { type: 'number' },
        offset: { type: 'number' },
      },
    },
  },
  {
    name: 'relatedness',
    description: 'Semantic-relatedness score (0..1) between two terms.',
    inputSchema: {
      type: 'object',
      properties: {
        node1: { type: 'string', description: 'First term or /c/en/<word> node' },
        node2: { type: 'string', description: 'Second term or /c/en/<word> node' },
        lang: { type: 'string', description: 'Default lang for plain-text terms (default en)' },
      },
      required: ['node1', 'node2'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'lookup': {
      const term = reqStr(args, 'term', '"dog"');
      const lang = ((args.lang as string) ?? 'en').toLowerCase();
      const nodePath = toNodePath(term, lang);
      const params = new URLSearchParams({
        limit: String(Math.min(1000, Math.max(1, (args.limit as number) ?? 50))),
        offset: String(Math.max(0, (args.offset as number) ?? 0)),
      });
      if (args.only_rel) params.set('rel', toRelUri(String(args.only_rel)));
      if (args.end_node_lang) params.set('other', `/c/${args.end_node_lang}`);
      return cnGet(`${nodePath}?${params}`);
    }
    case 'query': {
      const params = new URLSearchParams({
        limit: String(Math.min(1000, Math.max(1, (args.limit as number) ?? 50))),
        offset: String(Math.max(0, (args.offset as number) ?? 0)),
      });
      if (args.rel) params.set('rel', toRelUri(String(args.rel)));
      if (args.start) params.set('start', toNodePath(String(args.start), 'en'));
      if (args.end) params.set('end', toNodePath(String(args.end), 'en'));
      if (args.node) params.set('node', toNodePath(String(args.node), 'en'));
      if (args.source) params.set('source', String(args.source));
      return cnGet(`/query?${params}`);
    }
    case 'relatedness': {
      const lang = ((args.lang as string) ?? 'en').toLowerCase();
      const node1 = toNodePath(reqStr(args, 'node1', '"dog"'), lang);
      const node2 = toNodePath(reqStr(args, 'node2', '"wolf"'), lang);
      const params = new URLSearchParams({ node1, node2 });
      return cnGet(`/relatedness?${params}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function toNodePath(input: string, defaultLang: string): string {
  const s = input.trim();
  if (s.startsWith('/c/')) return s;
  // Encode word: lowercase, spaces → underscores, then URI-encode each segment.
  const word = s.toLowerCase().replace(/\s+/g, '_');
  return `/c/${defaultLang}/${encodeURIComponent(word)}`;
}

function toRelUri(input: string): string {
  const s = input.trim();
  if (s.startsWith('/r/')) return s;
  return `/r/${s}`;
}

async function cnGet(path: string) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'pipeworx-mcp-conceptnet/1.0 (+https://pipeworx.io)',
    },
  });
  if (res.status === 429) throw new Error('ConceptNet: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`ConceptNet error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
