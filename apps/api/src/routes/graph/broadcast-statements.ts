import { processGithubBroadcastPayload } from '@chris-test/graph-ingest';
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { requireBroadcastAuth } from '../../middleware/auth.js';
import type { AppBindings } from '../../middleware/context.js';

const BroadcastItemSchema = z.object({
  urlPath: z.string(),
  root: z.string(),
  sha256: z.string(),
}).openapi('GraphBroadcastItem');

const GithubBroadcastMetadataSchema = z.object({
  kind: z.literal('github').openapi({ example: 'github' }),
  repoSlug: z.string().openapi({ example: 'ChrisLally/fide-statements-template' }),
  repoId: z.string().openapi({ example: '982559179' }),
  ownerId: z.string().openapi({ example: '43071816' }),
  sha: z.string().openapi({ example: 'ba1e9392d8078f204388c0794c27f0e3490ec046' }),
  runId: z.string().openapi({ example: '22072343211' }),
});

const DirectBroadcastMetadataSchema = z.object({
  kind: z.literal('direct').openapi({ example: 'direct' }),
});

const BroadcastMetadataSchema = z.union([GithubBroadcastMetadataSchema, DirectBroadcastMetadataSchema])
  .openapi('GraphBroadcastMetadata');

const BroadcastPayloadSchema = z.object({
  urlBase: z.string().openapi({
    example: 'https://raw.githubusercontent.com/ChrisLally/fide-statements-template/ba1e9392d8078f204388c0794c27f0e3490ec046',
  }),
  metadata: BroadcastMetadataSchema,
  items: z.array(BroadcastItemSchema),
}).openapi('GraphStatementsBroadcastPayload');

const ProcessedBatchSchema = z.object({
  sourceKind: z.enum(['github', 'direct']),
  repoSlug: z.string().nullable(),
  sha: z.string().nullable(),
  urlPath: z.string(),
  root: z.string(),
  insertedBatch: z.boolean(),
  statementCount: z.number().int(),
}).openapi('GraphProcessedBatch');

const BroadcastResponseSchema = z.object({
  ok: z.boolean(),
  processed: z.array(ProcessedBatchSchema),
}).openapi('GraphStatementsBroadcastResponse');

const ErrorSchema = z.object({
  error: z.string(),
}).openapi('GraphBroadcastError');

const app = new OpenAPIHono<AppBindings>();

app.openapi(createRoute({
  method: 'post',
  path: '/v1/broadcast/statements',
  summary: 'Statement Batches',
  description: 'Accepts statement-batch broadcast payloads and ingests them into Fide Graph.',
  tags: ['Graph'],
  security: [{ apiKeyAuth: [] }, { bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: BroadcastPayloadSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Broadcast processed',
      content: {
        'application/json': {
          schema: BroadcastResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid broadcast payload',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    403: {
      description: 'Forbidden',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: 'Broadcast processing failed',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
  middleware: [requireBroadcastAuth],
}), async (c) => {
  try {
    const payload = BroadcastPayloadSchema.parse(await c.req.json());
    const processed = await processGithubBroadcastPayload(payload);
    return c.json({ ok: true, processed }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Broadcast processing failed';
    const status = message.startsWith('Invalid broadcast payload') ? 400 : 500;
    return c.json({ error: message }, status as 400 | 500);
  }
});

export default app;
