/**
 * Tests E2E (end-to-end) pour l'authentification.
 *
 * Ces tests appellent les vrais endpoints HTTP avec une vraie base MongoDB.
 * Prérequis : MongoDB démarré, .env avec MONGODB_URL, JWT_SECRET, JWT_REFRESH_SECRET.
 *
 * Lancer : npm run test:e2e -- auth.e2e-spec
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth E2E', () => {
  let app: INestApplication;
  // Email unique pour éviter les conflits entre exécutions
  const testEmail = `test.${Date.now()}@example.com`;
  const testPassword = 'SecureP@ss123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Même ValidationPipe que main.ts pour tester le comportement réel
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/signup - Inscription', () => {
    it('crée un utilisateur et retourne les tokens + user', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          nom: 'Dupont',
          prenom: 'Jean',
          email: testEmail,
          password: testPassword,
        })
        .expect(201)
        .expect((res) => {
          // Vérifie que les tokens sont retournés
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');

          // Vérifie que le user ne contient pas de données sensibles
          expect(res.body.user.email).toBe(testEmail);
          expect(res.body.user).not.toHaveProperty('password');
          expect(res.body.user).not.toHaveProperty('refreshTokenHash');
        });
    });

    it('refuse un email déjà utilisé (409 Conflict)', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          nom: 'Dupont',
          prenom: 'Jean',
          email: testEmail,
          password: testPassword,
        })
        .expect(409);
    });

    it('refuse des données invalides (400)', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          nom: 'A',
          prenom: 'B',
          email: 'email-invalide',
          password: 'court',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login - Connexion', () => {
    it('retourne les tokens avec des identifiants corrects', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testEmail);
    });

    it('refuse des identifiants incorrects (401)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: 'MauvaisMotDePasse' })
        .expect(401);
    });
  });

  describe('GET /users/profile - Route protégée', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Récupérer un token valide pour les tests profile
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: testPassword });
      accessToken = loginRes.body.accessToken;
    });

    it('retourne le profil avec un token valide', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testEmail);
          expect(res.body).toHaveProperty('nom');
          expect(res.body).toHaveProperty('prenom');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('retourne 401 sans token', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });

    it('retourne 401 avec un token invalide', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer token-invalide')
        .expect(401);
    });
  });
});
