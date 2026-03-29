import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    /** Défini par RequestContextMiddleware (UUID ou en-tête client). */
    requestId?: string;
  }
}
