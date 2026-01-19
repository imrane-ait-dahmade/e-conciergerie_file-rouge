# Tests unitaires — EtablissementsService

## Pourquoi des tests unitaires ?

Les tests vérifient que le service fonctionne correctement **sans** appeler la vraie base de données. On utilise un **mock** (simulation) du modèle Mongoose.

---

## Structure d'un test

```
it('description de ce que l on vérifie', async () => {
  // Arrange : préparer les données et le mock
  const dto = { nom: 'Mon Restaurant' };
  mockModel.create.mockResolvedValue(resultatAttendu);

  // Act : appeler la méthode testée
  const result = await service.create(dto, userId);

  // Assert : vérifier le résultat
  expect(mockModel.create).toHaveBeenCalledWith(...);
  expect(result).toEqual(resultatAttendu);
});
```

---

## Ce que chaque test vérifie

| Test | Vérifie |
|------|---------|
| **create** | Le modèle reçoit bien nom, adresse et prestataire = userId |
| **findAll** | find() est appelé et retourne la liste |
| **findOne (OK)** | Retourne l'établissement si trouvé |
| **findOne (KO)** | Lance NotFoundException si non trouvé |
| **update (OK)** | Met à jour si l'utilisateur est le propriétaire |
| **update (Forbidden)** | Lance ForbiddenException si pas le propriétaire |
| **update (NotFound)** | Lance NotFoundException si établissement inexistant |
| **delete (OK)** | Supprime si l'utilisateur est le propriétaire |
| **delete (Forbidden)** | Lance ForbiddenException si pas le propriétaire |
| **delete (NotFound)** | Lance NotFoundException si non trouvé |

---

## Lancer les tests

```bash
# Tous les tests
npm run test

# Uniquement EtablissementsService
npm run test -- etablissements.service.spec.ts

# Avec couverture
npm run test:cov
```

---

## Mock vs vraie base

| Approche | Avantage |
|----------|----------|
| **Mock** (tests unitaires) | Rapide, pas besoin de MongoDB, isolé |
| **Vraie base** (tests E2E) | Vérifie l'intégration complète |

Pour un projet de fin d'études, les tests unitaires avec mocks suffisent pour démontrer la maîtrise des tests.
