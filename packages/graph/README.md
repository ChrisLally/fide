# @fide-work/graph

Pure graph-layer utilities for Fide graph ingestion and projection logic.

## Boundary Tags

Use boundary tags at conversion seams so protocol and product logic are explicit:

- `@boundary <from> -> <to>`
- `@consumes <input-shape>`
- `@produces <output-shape>`

Example:

```ts
/**
 * Converts graph ingestion wire format into protocol-level FCP Statement.
 * @boundary graph -> fcp
 * @consumes GraphStatementWire
 * @produces Statement
 */
```
