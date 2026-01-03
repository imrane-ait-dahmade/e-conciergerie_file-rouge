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
});
