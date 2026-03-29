import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

/**
 * Observabilité légère : **correlation id** + **journal une ligne par requête** + **durée**.
 *
 * Ce n’est **pas** de l’autorisation : pas de rôles, pas de JWT ici.
 * L’auth reste dans JwtAuthGuard / RolesGuard et l’ownership dans les services.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const fromHeader =
      req.get('x-request-id') ?? req.get('x-correlation-id') ?? '';
    const requestId =
      fromHeader.trim() !== '' ? fromHeader.trim() : randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    const start = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const ms = Date.now() - start;
      this.logger.log(
        `${method} ${originalUrl} ${res.statusCode} ${ms}ms [${requestId}]`,
      );
    });

    next();
  }
}
