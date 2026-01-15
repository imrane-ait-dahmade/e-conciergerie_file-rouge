# Roles System

## How roles are stored

- **Role** (Mongoose collection): documents with `name` (e.g. `"admin"`, `"user"`, `"moderator"`)
- **User.role**: ObjectId referencing a Role document
- **Resolution**: When checking permissions, the guard fetches User → populates role → reads Role.name

## Seeding roles

Create Role documents in MongoDB before assigning them to users:

```javascript
// In MongoDB shell or a seed script
db.roles.insertOne({ name: "admin", createdAt: new Date(), updatedAt: new Date() });
db.roles.insertOne({ name: "user", createdAt: new Date(), updatedAt: new Date() });
```

When creating a user, set `role` to the Role's `_id`:

```javascript
const adminRole = await Role.findOne({ name: "admin" });
await User.create({ ...userData, role: adminRole._id });
```

## Protecting routes

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
deleteUser(@Param('id') id: string) {
  return this.usersService.delete(id);
}
```

**Important:** `JwtAuthGuard` must run first (authenticate), then `RolesGuard` (authorize).

## Multiple roles

Require any of the listed roles:

```typescript
@Roles('admin', 'moderator')
someRoute() { ... }
```

## Flow

1. **JwtAuthGuard**: Validates JWT, attaches `req.user = { userId, email }`
2. **RolesGuard**: Reads `@Roles()` metadata, fetches user's role from DB, checks if role name is in the list
3. **@Roles('admin')**: No metadata → guard allows (no role check). With metadata → guard enforces
