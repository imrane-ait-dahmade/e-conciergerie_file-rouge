# Schéma User — Lecture pour un développeur Laravel

---

## Le schéma en une phrase

En Laravel, une **migration** définit les colonnes d'une table. Ici, le **schéma Mongoose** définit les champs d'un document dans la collection MongoDB `users`.

---

## Correspondance Laravel ↔ Mongoose

| Laravel                           | Mongoose (NestJS)                    |
|-----------------------------------|--------------------------------------|
| Migration `$table->string('nom')`  | `@Prop({ required: true }) nom: string` |
| `$table->unique('email')`          | `@Prop({ unique: true }) email`      |
| `$table->timestamps()`             | `timestamps: true` dans `@Schema()`   |
| Modèle Eloquent `User`            | Classe `User` avec `@Schema()`       |
| `$fillable` / `$hidden`           | `select: false` pour exclure par défaut |

---

## Champ par champ

### `nom` et `prenom`
```typescript
@Prop({ required: true })
nom: string;
```
- **Laravel :** `$table->string('nom')` + `'nom' => 'required'` dans les rules
- **required: true** = champ obligatoire (comme une validation)

### `email`
```typescript
@Prop({ required: true, unique: true, lowercase: true, trim: true })
email: string;
```
- **unique: true** → comme `$table->unique('email')`
- **lowercase: true** → converti en minuscules avant stockage
- **trim: true** → espaces en début/fin supprimés

### `password`
```typescript
@Prop({ required: true, select: false })
password: string;
```
- **select: false** → le champ n’est pas inclus par défaut dans les requêtes (comme `$hidden = ['password']`)
- Pour le lire : `User::find()->select('+password')` en Mongoose

### `telephone` et `adresse`
```typescript
@Prop({ required: false })
telephone?: string;
```
- **required: false** = optionnel (comme une colonne nullable)

### `isActive`
```typescript
@Prop({ required: true, default: true })
isActive: boolean;
```
- **default: true** → valeur par défaut à la création (comme `$table->boolean()->default(true)`)

### `refreshTokenHash`
```typescript
@Prop({ required: false, select: false })
refreshTokenHash?: string;
```
- Stocke le hash du refresh token (pour logout et rotation)
- **select: false** → jamais retourné dans les requêtes standard

### `timestamps`
```typescript
@Schema({ timestamps: true })
```
- Ajoute automatiquement `createdAt` et `updatedAt` (comme `$table->timestamps()`)

---

## Résumé

| Champ            | Type   | Obligatoire | Particularités                      |
|------------------|--------|-------------|-------------------------------------|
| nom              | string | Oui         |                                     |
| prenom           | string | Oui         |                                     |
| email            | string | Oui         | unique, lowercase, trim             |
| password         | string | Oui         | select: false (caché par défaut)   |
| telephone        | string | Non         |                                     |
| adresse          | string | Non         |                                     |
| isActive         | bool   | Oui         | default: true                       |
| refreshTokenHash | string | Non         | select: false                       |
| createdAt        | Date   | Auto        | timestamps                          |
| updatedAt        | Date   | Auto        | timestamps                          |
