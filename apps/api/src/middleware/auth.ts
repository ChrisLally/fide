import type { MiddlewareHandler } from 'hono';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { AppBindings } from './context.js';

const GITHUB_OIDC_ISSUER = process.env.GITHUB_OIDC_ISSUER ?? 'https://token.actions.githubusercontent.com';
const GITHUB_OIDC_AUDIENCE = process.env.GITHUB_OIDC_AUDIENCE ?? 'fide-graph-broadcast';
const GITHUB_OIDC_ALLOWED_REPOS = new Set(
  (process.env.GITHUB_OIDC_ALLOWED_REPOS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);

const githubOidcJwks = createRemoteJWKSet(new URL(`${GITHUB_OIDC_ISSUER}/.well-known/jwks`));

async function verifyGithubOidcToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, githubOidcJwks, {
    issuer: GITHUB_OIDC_ISSUER,
    audience: GITHUB_OIDC_AUDIENCE,
  });

  if (GITHUB_OIDC_ALLOWED_REPOS.size > 0) {
    const repository = typeof payload.repository === 'string' ? payload.repository : '';
    if (!repository || !GITHUB_OIDC_ALLOWED_REPOS.has(repository)) {
      throw new Error('Token repository is not allowed');
    }
  }

  return payload;
}

export const requireGraphReadAuth: MiddlewareHandler<AppBindings> = async (c, next) => {
  const token = c.req.header('X-API-Key');

  if (!token || token.trim().length === 0) {
    return c.json({ error: 'Missing X-API-Key header' }, 401);
  }

  // Temporary relaxed mode: accept any provided API key value.
  c.set('authSubject', {
    type: 'service',
    id: 'dev-any-api-key',
    userId: null,
    apiKeyId: undefined,
    scopes: ['*'],
  });
  await next();
};

export const requireApiKeyAuth: MiddlewareHandler<AppBindings> = requireGraphReadAuth;

export const requireBroadcastAuth: MiddlewareHandler<AppBindings> = async (c, next) => {
  const apiKey = c.req.header('X-API-Key');
  if (apiKey && apiKey.trim().length > 0) {
    c.set('authSubject', {
      type: 'service',
      id: 'dev-any-api-key',
      userId: null,
      apiKeyId: undefined,
      scopes: ['*'],
    });
    await next();
    return;
  }

  const authorization = c.req.header('Authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      return c.json({ error: 'Invalid Authorization header' }, 401);
    }

    try {
      const payload = await verifyGithubOidcToken(token);
      const repository = typeof payload.repository === 'string' ? payload.repository : 'github-oidc';
      const runId = typeof payload.run_id === 'string' ? payload.run_id : '';
      c.set('authSubject', {
        type: 'service',
        id: runId ? `github-oidc:${repository}:${runId}` : `github-oidc:${repository}`,
        userId: null,
        apiKeyId: undefined,
        scopes: ['graph:broadcast'],
      });
      await next();
      return;
    } catch {
      return c.json({ error: 'Invalid or expired bearer token' }, 401);
    }
  }

  return c.json({ error: 'Missing X-API-Key or Authorization Bearer token' }, 401);
};
