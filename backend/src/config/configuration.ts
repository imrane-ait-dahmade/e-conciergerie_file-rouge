export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),

  mongodb: {
    url: process.env.MONGODB_URL!,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  frontend: {
    url: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  },

  mail: {
    from: process.env.MAIL_FROM ?? 'noreply@localhost',
  },

  /** MinIO (S3). Défauts = docker-compose.yml à la racine (dev). */
  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
    port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
    useSsl: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    /** Fixe la région pour éviter l’appel S3 GetBucketLocation (souvent 503 avec MinIO local). */
    region: process.env.MINIO_REGION ?? 'us-east-1',
    bucket: process.env.MINIO_BUCKET ?? 'uploads',
    publicUrl: process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9000',
  },

});
