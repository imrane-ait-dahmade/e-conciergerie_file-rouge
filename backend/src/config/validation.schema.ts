import * as Joi from 'joi';

/**
 * Environment validation schema. Application fails to start if validation fails.
 * No unsafe defaults for secrets - they must be provided.
 */
export const validationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.string().pattern(/^\d+$/).default('3000'),

  // MongoDB
  MONGODB_URL: Joi.string().required().messages({
    'string.empty': 'MONGODB_URL is required',
    'any.required': 'MONGODB_URL is required',
  }),

  // JWT Access - required, min 32 chars (no unsafe defaults)
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_SECRET must be at least 32 characters',
    'any.required': 'JWT_SECRET is required',
  }),
  JWT_EXPIRES_IN: Joi.string().default('1d'), // e.g. "1d", "15m", "3600"

  // JWT Refresh - separate secret for refresh tokens
  JWT_REFRESH_SECRET: Joi.string().min(32).required().messages({
    'string.min': 'JWT_REFRESH_SECRET must be at least 32 characters',
    'any.required': 'JWT_REFRESH_SECRET is required',
  }),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Frontend
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),

  /** Origine Expo / Metro (Expo Web, outils) — défaut localhost:8081 ; surcharger si besoin (LAN). */
  MOBILE_DEV_ORIGIN: Joi.string().uri().optional(),

  // Mail
  MAIL_FROM: Joi.string().email().default('noreply@localhost'),

  // MinIO (uploads) — défauts alignés sur docker-compose.yml (racine du repo)
  MINIO_ENDPOINT: Joi.string().default('localhost'),
  MINIO_PORT: Joi.string().pattern(/^\d+$/).default('9000'),
  MINIO_USE_SSL: Joi.string().valid('true', 'false').default('false'),
  MINIO_ACCESS_KEY: Joi.string().default('minioadmin'),
  MINIO_SECRET_KEY: Joi.string().default('minioadmin'),
  MINIO_REGION: Joi.string().default('us-east-1'),
  MINIO_BUCKET: Joi.string().default('uploads'),
  MINIO_PUBLIC_URL: Joi.string().uri().default('http://localhost:9000'),
});
