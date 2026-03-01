import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import type { AppBindings } from './middleware/context.js'
import gateway from './routes/gateway/index.js'
import graph from './routes/graph/index.js'
import workspace from './routes/workspace/index.js'

export const openapiDocument = {
  openapi: '3.1.0' as const,
  info: {
    version: '1.0.0',
    title: 'Fide API',
    description: 'The Fide Platform API'
  },
  servers: [
    {
      url: 'http://localhost:3200',
      description: 'Local development'
    },
    {
      url: 'https://api.fide.work',
      description: 'Production'
    }
  ],
  components: {
    securitySchemes: {
      apiKeyAuth: {
        type: 'apiKey' as const,
        in: 'header' as const,
        name: 'X-API-Key',
        description: 'Graph API key header. Format: sk_...',
      },
      bearerAuth: {
        type: 'http' as const,
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Authorization bearer token (JWT).',
      },
    },
  },
}

export function createApp() {
  const app = new OpenAPIHono<AppBindings>()

  app.use('*', cors({
    origin: 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }))

  app.use('*', async (c, next) => {
    await next()

    const fullCommit = c.env.COMMIT_SHA
    const apiVersion = c.env.API_VERSION
    const cfVersion = c.env.CF_VERSION_METADATA.id
    c.header('X-Fide-Api-Version', apiVersion)
    c.header('X-Fide-Source', `https://github.com/ChrisLally/fide/commit/${fullCommit}`)
    c.header('X-Cloudflare-Version', cfVersion)
  })

  // Root route
  app.get('/', (c) => {
    return c.text('Fide API')
  })

  app.get('/health', (c) => {
    const fullCommit = c.env.COMMIT_SHA
    const apiVersion = c.env.API_VERSION
    const cfVersion = c.env.CF_VERSION_METADATA.id

    return c.json({
      status: 'ok',
      apiVersion,
      source: `https://github.com/ChrisLally/fide/commit/${fullCommit}`,
      cloudflareVersion: cfVersion,
      timestamp: new Date().toISOString(),
    })
  })

  // Mount platform service routes.
  app.route('/gateway', gateway)
  app.route('/graph', graph)
  app.route('/workspace', workspace)

  // OpenAPI documentation
  app.doc('/openapi.json', openapiDocument)
  app.openAPIRegistry.registerComponent('securitySchemes', 'apiKeyAuth', {
    type: 'apiKey',
    in: 'header',
    name: 'X-API-Key',
    description: 'Graph API key header. Format: sk_...',
  })
  app.openAPIRegistry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Authorization bearer token (JWT).',
  })

  return app
}
