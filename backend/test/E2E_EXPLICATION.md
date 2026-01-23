# Tests E2E (end-to-end) — Explication

## Qu'est-ce qu'un test E2E ?

Un test **end-to-end** (bout en bout) simule un vrai client qui appelle les routes HTTP. Contrairement aux tests unitaires qui mockent les dépendances, les tests E2E utilisent :
- La vraie application NestJS
- La vraie base MongoDB
- Les vrais modules (Auth, Users, etc.)

---

## Scénario de chaque test

### POST /auth/signup — Inscription

| Test | Scénario | Vérification |
|------|----------|--------------|
| **crée un utilisateur et retourne les tokens** | Envoie nom, prenom, email, password valides | 201, accessToken + refreshToken + user, pas de password dans la réponse |
| **refuse un email déjà utilisé** | Ré-inscription avec le même email | 409 Conflict |
| **refuse des données invalides** | Données trop courtes ou format invalide | 400 Bad Request |

### POST /auth/login — Connexion

| Test | Scénario | Vérification |
|------|----------|--------------|
| **retourne les tokens avec identifiants corrects** | Login avec email + password du signup | 201, accessToken + refreshToken + user |
| **refuse des identifiants incorrects** | Login avec mauvais mot de passe | 401 Unauthorized |

### GET /users/profile — Route protégée

| Test | Scénario | Vérification |
|------|----------|--------------|
| **retourne le profil avec token valide** | GET /users/profile + Authorization: Bearer &lt;token&gt; | 200, profil utilisateur (sans password) |
| **retourne 401 sans token** | GET /users/profile sans en-tête | 401 Unauthorized |
| **retourne 401 avec token invalide** | GET /users/profile + token bidon | 401 Unauthorized |

---

## Structure du fichier

```typescript
beforeAll(async () => {
  // Créer l'application NestJS (comme au démarrage)
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ ... }));
  await app.init();
});

afterAll(async () => {
  await app.close();  // Fermer proprement
});

describe('POST /auth/signup', () => {
  it('...', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ nom, prenom, email, password })
      .expect(201)
      .expect((res) => { ... });
  });
});
```

---

## Prérequis

1. **MongoDB** doit être démarré (localhost:27017)
2. **Variables d'environnement** dans `.env` :
   - MONGODB_URL
   - JWT_SECRET (min 32 caractères)
   - JWT_REFRESH_SECRET (min 32 caractères)

---

## Lancer les tests

```bash
# Tous les tests E2E
npm run test:e2e

# Uniquement auth
npm run test:e2e -- auth.e2e-spec
```

---

## Ordre des tests

Les tests s'exécutent dans l'ordre du fichier. Le flow est :
1. Signup crée l'utilisateur
2. Signup duplicate échoue (409)
3. Signup invalide échoue (400)
4. Login réussit (on a créé l'utilisateur au step 1)
5. Login échoue avec mauvais password
6. Profile avec token (on récupère le token du login du step 4)
7. Profile sans token (401)
8. Profile avec token invalide (401)
