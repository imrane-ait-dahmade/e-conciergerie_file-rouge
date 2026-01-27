# Historique Git proposé — Backend NestJS

**Début :** 2026-01-20 — **Espacement :** 2 jours entre chaque commit

| # | Date | Message |
|---|------|---------|
| 1 | 2026-01-20 | chore: initial NestJS project setup |
| 2 | 2026-01-22 | chore: add MongoDB connection and MongooseModule |
| 3 | 2026-01-24 | feat(config): add ConfigModule with Joi validation |
| 4 | 2026-01-26 | feat(users): add User schema and Mongoose model |
| 5 | 2026-01-28 | feat(users): add UsersModule with create and legacy login routes |
| 6 | 2026-01-30 | feat(auth): add AuthModule with JWT and Passport |
| 7 | 2026-02-01 | feat(auth): implement signup with bcrypt hashing |
| 8 | 2026-02-03 | feat(auth): implement login and token pair response |
| 9 | 2026-02-05 | feat(auth): add refresh token rotation and logout |
| 10 | 2026-02-07 | feat(users): add GET profile protected by JWT |
| 11 | 2026-02-09 | feat(auth): add JwtStrategy and JwtAuthGuard |
| 12 | 2026-02-11 | feat(etablissements): add Etablissement schema and create DTOs |
| 13 | 2026-02-13 | feat(etablissements): implement CRUD service and controller |
| 14 | 2026-02-15 | feat(etablissements): protect mutations and set prestataire on create |
| 15 | 2026-02-17 | feat(app): add global ValidationPipe Helmet and CORS |
| 16 | 2026-02-19 | refactor(auth): use req.user on protected routes |
| 17 | 2026-02-21 | test(etablissements): add EtablissementsService unit tests |
| 18 | 2026-02-23 | test(auth): add E2E tests for signup login and profile |
| 19 | 2026-02-25 | docs: add architecture and auth explanation markdown |
| 20 | 2026-02-27 | chore: add Swagger and API documentation |

**Générer la liste dans le terminal (Git Bash :** `bash COMMITS.sh`  
**Timeline de démo (commits vides datés) :** `bash COMMITS.sh --timeline`
