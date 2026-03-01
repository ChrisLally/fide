export type AuthSubject = {
  type: 'user' | 'service';
  id: string;
  scopes: string[];
  userId?: string | null;
  apiKeyId?: string;
};

export type AppBindings = {
  Bindings: {
    COMMIT_SHA: string;
    API_VERSION: string;
    CF_VERSION_METADATA: {
      id: string;
      tag: string;
      timestamp: string;
    };
  };
  Variables: {
    authSubject?: AuthSubject;
  };
};

export const GRAPH_READ_SCOPE = 'graph:read';
