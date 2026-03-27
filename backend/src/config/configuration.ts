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
    bucket: process.env.MINIO_BUCKET ?? 'uploads',
    publicUrl: process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9000',
  },

  /**
   * Seed admin au démarrage (users/seeds/admin.seed.ts, UsersService).
   * Variables : ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOM, ADMIN_PRENOM (.env.example).
   */
  adminSeed: {
    // Pas de valeur par défaut : si vide, le seed ne crée rien (sécurité + pas de compte surprise).
    email: process.env.ADMIN_EMAIL?.trim() ?? '',
    password: process.env.ADMIN_PASSWORD ?? '',

    /**
     * Nom / prénom : facultatifs.
     * Si absents ou vides → on utilise "Admin" et "Système" pour éviter un user sans nom en base.
     */
    nom: process.env.ADMIN_NOM?.trim() || 'Admin',
    prenom: process.env.ADMIN_PRENOM?.trim() || 'Système',
  },
});
