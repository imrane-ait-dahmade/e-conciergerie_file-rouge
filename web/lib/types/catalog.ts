/**
 * Formes renvoyées par le backend (Mongoose lean + populate).
 * Les `_id` sont des chaînes une fois sérialisés en JSON.
 */

export type MongoRef = {
  _id: string;
  nom?: string;
  description?: string;
  adresse?: string;
};

export type DomaineDoc = {
  _id: string;
  nom: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ServiceDoc = {
  _id: string;
  nom: string;
  description?: string;
  domaine: MongoRef | string;
  createdAt?: string;
  updatedAt?: string;
};

export type CaracteristiqueDoc = {
  _id: string;
  libelle: string;
  service?: MongoRef | string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type EtablissementListItem = {
  _id: string;
  nom: string;
  adresse?: string;
};
