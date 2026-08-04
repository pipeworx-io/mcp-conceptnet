# @pipeworx/conceptnet

ConceptNet MCP — open multilingual knowledge graph of word/phrase relations: IsA, PartOf, UsedFor, HasA, RelatedTo, AtLocation, Causes, Synonym, Antonym, …. ~28M edges across 80+ languages. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Conceptnet data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
