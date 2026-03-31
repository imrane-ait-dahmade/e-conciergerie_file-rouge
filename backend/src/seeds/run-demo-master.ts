/**
 * Orchestrateur unique du seed de démonstration (MongoDB).
 *
 * Ordre : rôles → utilisateurs → géographie Kénitra → domaines → services catalogue
 * → caractéristiques → établissements → sliders hero (visuels Home) → offres (etablissement_services).
 *
 * Usage :
 *   npm run seed:demo
 *   (build + exécution du script compilé ; nécessite MONGODB_URL dans `.env`)
 *
 * Idempotent : chaque sous-seed fait des upserts ou contrôles d’existence (voir répertoires seeds par module).
 *
 * Note : les documents `Media` (MinIO) ne sont pas générés ici — uploads via API prestataire.
 */
import { Logger } from '@nestjs/common';
import { config as loadEnv } from 'dotenv';
import mongoose from 'mongoose';
import { resolve } from 'node:path';
import { Caracteristique, CaracteristiqueSchema } from '../caracteristiques/schemas/caracteristique.schema';
import { seedCaracteristiques } from '../caracteristiques/seeds/caracteristiques.seed';
import { Domaine, DomaineSchema } from '../domaines/schemas/domaine.schema';
import { EtablissementServiceCaracteristique, EtablissementServiceCaracteristiqueSchema } from '../etablissement-service-caracteristiques/schemas/etablissement-service-caracteristique.schema';
import { EtablissementService, EtablissementServiceSchema } from '../etablissement-services/schemas/etablissement-service.schema';
import { seedDemoEtablissementServices } from '../etablissement-services/seeds/demo-etablissement-services.seed';
import { Etablissement, EtablissementSchema } from '../etablissements/schemas/etablissement.schema';
import { seedDemoEtablissementsKenitra } from '../etablissements/seeds/demo-etablissements-kenitra.seed';
import { Pays, PaysSchema } from '../pays/schemas/pays.schema';
import { seedGeographieKenitra } from '../pays/seeds/geographie-kenitra.seed';
import { Quartier, QuartierSchema } from '../quartiers/schemas/quartier.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { seedRoles } from '../roles/seeds/roles.seed';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { seedServices } from '../services/seeds/services.seed';
import { Slider, SliderSchema } from '../sliders/schemas/slider.schema';
import { seedHeroSliders } from '../sliders/seeds/sliders.seed';
import { User, UserSchema } from '../users/schemas/user.schema';
import { seedDemoUsers } from '../users/seeds/demo-users.seed';
import { Ville, VilleSchema } from '../villes/schemas/ville.schema';
import { seedDomaines } from '../domaines/seeds/domaines.seed';

const logger = new Logger('DemoMasterSeed');

function model<T>(name: string, schema: mongoose.Schema): mongoose.Model<T> {
  return (mongoose.models[name] as mongoose.Model<T>) ?? mongoose.model<T>(name, schema);
}

type StepResult = { name: string; ok: boolean; detail?: string };

async function run(): Promise<void> {
  loadEnv({ path: resolve(process.cwd(), '.env') });

  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl?.trim()) {
    // eslint-disable-next-line no-console
    console.error('[seed-demo] MONGODB_URL est requis (fichier .env à la racine backend).');
    process.exit(1);
  }

  await mongoose.connect(mongoUrl);
  logger.log(`Connexion MongoDB : ${mongoUrl.replace(/\/\/([^@]+)@/, '//***@')}`);

  const steps: StepResult[] = [];

  const roleModel = model<Role>(Role.name, RoleSchema);
  const userModel = model<User>(User.name, UserSchema);
  const paysModel = model<Pays>(Pays.name, PaysSchema);
  const villeModel = model<Ville>(Ville.name, VilleSchema);
  const quartierModel = model<Quartier>(Quartier.name, QuartierSchema);
  const domaineModel = model<Domaine>(Domaine.name, DomaineSchema);
  const serviceModel = model<Service>(Service.name, ServiceSchema);
  const caracteristiqueModel = model<Caracteristique>(
    Caracteristique.name,
    CaracteristiqueSchema,
  );
  const etablissementModel = model<Etablissement>(
    Etablissement.name,
    EtablissementSchema,
  );
  const sliderModel = model<Slider>(Slider.name, SliderSchema);
  const liaisonModel = model<EtablissementService>(
    EtablissementService.name,
    EtablissementServiceSchema,
  );
  const escModel = model<EtablissementServiceCaracteristique>(
    EtablissementServiceCaracteristique.name,
    EtablissementServiceCaracteristiqueSchema,
  );

  const runStep = async (
    name: string,
    fn: () => Promise<void>,
  ): Promise<void> => {
    logger.log(`▶ ${name}`);
    try {
      await fn();
      steps.push({ name, ok: true });
      logger.log(`✓ ${name}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      steps.push({ name, ok: false, detail: msg });
      logger.error(`✗ ${name} — ${msg}`);
      throw e;
    }
  };

  try {
    await runStep('1. Rôles (admin, prestataire, client)', () =>
      seedRoles(roleModel),
    );
    await runStep('2. Utilisateurs démo (3 comptes)', () =>
      seedDemoUsers(userModel, roleModel, logger),
    );
    await runStep('3–5. Géographie — Maroc, Kénitra, quartiers', () =>
      seedGeographieKenitra(paysModel, villeModel, quartierModel, logger),
    );
    await runStep('6. Domaines métier', () =>
      seedDomaines(domaineModel, logger),
    );
    await runStep('7. Services catalogue', () =>
      seedServices(serviceModel, domaineModel, logger),
    );
    await runStep('8. Caractéristiques catalogue', () =>
      seedCaracteristiques(
        caracteristiqueModel,
        serviceModel,
        domaineModel,
        logger,
      ),
    );
    await runStep('9. Établissements Kénitra (3)', () =>
      seedDemoEtablissementsKenitra(
        etablissementModel,
        userModel,
        domaineModel,
        paysModel,
        villeModel,
        quartierModel,
        logger,
      ),
    );
    await runStep('10. Sliders hero Home (images)', () =>
      seedHeroSliders(sliderModel, logger),
    );
    await runStep('11. Offres — etablissement_services + caractéristiques offre', () =>
      seedDemoEtablissementServices(
        liaisonModel,
        escModel,
        etablissementModel,
        serviceModel,
        domaineModel,
        logger,
      ),
    );
  } finally {
    await mongoose.disconnect();
    logger.log('Connexion MongoDB fermée.');
  }

  // eslint-disable-next-line no-console
  console.log('\n========== Résumé seed démo e-conciergerie ==========');
  for (const s of steps) {
    const icon = s.ok ? '✓' : '✗';
    // eslint-disable-next-line no-console
    console.log(`  ${icon} ${s.name}${s.detail && !s.ok ? ` — ${s.detail}` : ''}`);
  }
  // eslint-disable-next-line no-console
  console.log('=======================================================\n');
}

run().catch((e) => {
  logger.error(e instanceof Error ? e.stack ?? e.message : e);
  process.exit(1);
});
