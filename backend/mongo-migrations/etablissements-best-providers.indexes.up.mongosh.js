/**
 * UP — Index « Best providers » sur la collection etablissements.
 *
 * Usage (exemple) :
 *   mongosh "<MONGODB_URI>" etablissements-best-providers.indexes.up.mongosh.js
 *
 * À aligner avec `etablissement.schema.ts` (doublon acceptable si syncIndexes a déjà créé les index).
 */
const coll = db.getCollection('etablissements');

coll.createIndex({ slug: 1 }, { unique: true, sparse: true });
coll.createIndex({ isActive: 1 });
coll.createIndex({ isFeaturedForHomeBestProviders: 1 });
coll.createIndex({ bestProviderSortOrder: 1 });
coll.createIndex({
  isActive: 1,
  isFeaturedForHomeBestProviders: 1,
  bestProviderSortOrder: 1,
});

print('etablissements: indexes UP applied');
