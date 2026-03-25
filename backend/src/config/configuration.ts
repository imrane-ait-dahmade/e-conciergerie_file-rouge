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

  /**
   * Seed admin au démarrage (users/seeds/admin.seed.ts, appelé depuis UsersService).
   * Variables : ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOM, ADMIN_PRENOM (voir .env.example).
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
