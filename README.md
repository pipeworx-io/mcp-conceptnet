# @pipeworx/conceptnet

ConceptNet MCP — open multilingual knowledge graph of word/phrase relations: IsA, PartOf, UsedFor, HasA, RelatedTo, AtLocation, Causes, Synonym, Antonym, …. ~28M edges across 80+ languages. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1683+ live data sources.

## Tools

- `lookup(term, lang?, limit?, offset?, only_rel?, end_node_lang?)` — all edges touching a term
- `query(rel?, start?, end?, node?, source?, limit?, offset?)` — generic edge-query
- `relatedness(node1, node2)` — semantic-relatedness score for two terms

## Common relations

- `/r/IsA`, `/r/PartOf`, `/r/HasA`, `/r/UsedFor`, `/r/CapableOf`, `/r/AtLocation`, `/r/Causes`, `/r/Synonym`, `/r/Antonym`, `/r/RelatedTo`, `/r/HasContext`, `/r/MannerOf`.

## Data source

`https://api.conceptnet.io/` — keyless, fair-use (~3600 req/hour).

Node URIs: `/c/<lang>/<word>` (e.g. `/c/en/dog`).

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "conceptnet": {
      "url": "https://gateway.pipeworx.io/conceptnet/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/conceptnet/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1683+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/conceptnet_lookup \
  -H 'Content-Type: application/json' \
  -d '{"term":"dog"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/conceptnet_lookup`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "conceptnet": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-conceptnet"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-conceptnet
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Conceptnet data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
