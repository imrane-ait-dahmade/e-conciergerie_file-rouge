/**
 * DOWN — Retrait des index ajoutés pour « Best providers ».
 *
 * Usage :
 *   mongosh "<MONGODB_URI>" etablissements-best-providers.indexes.down.mongosh.js
 *
 * N’altère pas les données (champs conservés). Supprime uniquement les index listés.
 * Si un index n’existe pas, ignorer l’erreur ou lancer manuellement getIndexes().
 */
const coll = db.getCollection('etablissements');

const names = [
  'isActive_1',
  'isFeaturedForHomeBestProviders_1',
  'bestProviderSortOrder_1',
  'isActive_1_isFeaturedForHomeBestProviders_1_bestProviderSortOrder_1',
  'slug_1',
];

for (const name of names) {
  try {
    coll.dropIndex(name);
    print('dropped index: ' + name);
  } catch (e) {
    print('skip drop ' + name + ': ' + e.message);
  }
}

print('etablissements: indexes DOWN finished');
