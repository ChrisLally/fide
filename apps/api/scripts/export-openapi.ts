import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createApp, openapiDocument } from '../src/app.js'

function filterPathsByPrefix(
  paths: NonNullable<ReturnType<ReturnType<typeof createApp>['getOpenAPI31Document']>['paths']>,
  prefixes: string[]
) {
  const filtered = {} as typeof paths

  for (const [path, value] of Object.entries(paths)) {
    if (prefixes.some((prefix) => path.startsWith(prefix))) {
      filtered[path as keyof typeof filtered] = value as (typeof filtered)[keyof typeof filtered]
    }
  }

  return filtered
}

function collectSchemaRefs(value: unknown, refs = new Set<string>()) {
  if (!value || typeof value !== 'object') {
    return refs
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectSchemaRefs(item, refs)
    }
    return refs
  }

  for (const [key, nested] of Object.entries(value)) {
    if (key === '$ref' && typeof nested === 'string') {
      const match = nested.match(/^#\/components\/schemas\/(.+)$/)
      if (match) {
        refs.add(match[1]!)
      }
    } else {
      collectSchemaRefs(nested, refs)
    }
  }

  return refs
}

function pruneUnusedComponentSchemas(schema: any) {
  const components = schema.components
  const schemas = components?.schemas
  const securitySchemes = components?.securitySchemes
  const paths = schema.paths

  if (!components || !schemas || !paths) {
    return schema
  }

  const used = collectSchemaRefs(paths)
  const queue = Array.from(used)

  while (queue.length > 0) {
    const schemaName = queue.shift()
    if (!schemaName) {
      continue
    }

    const component = schemas[schemaName]
    if (!component) {
      continue
    }

    const nestedRefs = collectSchemaRefs(component)
    for (const ref of nestedRefs) {
      if (!used.has(ref)) {
        used.add(ref)
        queue.push(ref)
      }
    }
  }

  const prunedSchemas = Object.fromEntries(
    Object.entries(schemas).filter(([name]) => used.has(name))
  )

  return {
    ...schema,
    components: {
      ...(components ?? {}),
      schemas: prunedSchemas,
      ...(securitySchemes ? { securitySchemes } : {}),
    },
  }
}

async function main() {
  const app = createApp()
  const schema = app.getOpenAPI31Document(openapiDocument)

  if (!schema.paths) {
    throw new Error('OpenAPI document has no paths to export.')
  }

  const outPath = resolve(process.cwd(), '../../packages/contracts/openapi.json')
  await mkdir(dirname(outPath), { recursive: true })

  const healthOnlyPaths = filterPathsByPrefix(schema.paths, [
    '/gateway/v1/',
    '/graph/v1/',
    '/workspace/v1/',
  ])

  const outSchema = pruneUnusedComponentSchemas({
    ...schema,
    info: {
      ...schema.info,
      title: 'Fide API',
      description: 'Unified API specification for Gateway, Graph, and Workspace APIs.',
    },
    servers: [
      {
        url: 'http://localhost:3200',
        description: 'Local development',
      },
      {
        url: 'https://api.fide.work',
        description: 'Production',
      },
    ],
    paths: healthOnlyPaths,
  })

  if (!outSchema.components) {
    outSchema.components = {}
  }
  if (!outSchema.components.securitySchemes) {
    outSchema.components.securitySchemes = {}
  }
  outSchema.components.securitySchemes.apiKeyAuth = {
    type: 'apiKey',
    in: 'header',
    name: 'X-API-Key',
    description: 'Graph API key header. Format: sk_...',
  }
  if (!outSchema.components.securitySchemes.bearerAuth) {
    outSchema.components.securitySchemes.bearerAuth = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Authorization bearer token (JWT).',
    }
  }

  await writeFile(outPath, `${JSON.stringify(outSchema, null, 2)}\n`, 'utf8')
  console.log(`Exported OpenAPI schema to ${outPath}`)
}

await main()
