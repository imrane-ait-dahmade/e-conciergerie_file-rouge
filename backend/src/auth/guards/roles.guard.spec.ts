/**
 * RolesGuard — tests unitaires
 *
 * Setup :
 * - Reflector : Nest lit les métadonnées `@Roles(...)` via `getAllAndOverride`. On mock cette méthode
 *   pour simuler « la route exige ces rôles » ou « aucune contrainte ».
 * - ExecutionContext : fournit `getHandler()`, `getClass()` (passés au Reflector) et `switchToHttp().getRequest()`
 *   pour simuler `req.user` comme après JwtAuthGuard.
 * - userModel : le guard charge le rôle réel en base ; on mock la chaîne Mongoose `findById → populate → select → lean`.
 */
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleName } from '../constants/role-names';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from '../../users/schemas/user.schema';
import { RolesGuard } from './roles.guard';

const USER_ID = '507f1f77bcf86cd799439011';

function createMockContext(requestUser: unknown): ExecutionContext {
  return {
    getHandler: jest.fn().mockReturnValue(() => undefined),
    getClass: jest.fn().mockReturnValue(class TestController {}),
    switchToHttp: () => ({
      getRequest: () => ({ user: requestUser }),
    }),
  } as unknown as ExecutionContext;
}

function mockUserDbChain(roleName: string | null) {
  const lean = jest.fn().mockResolvedValue(
    roleName === null ? null : { role: { name: roleName } },
  );
  return {
    populate: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean,
      }),
    }),
  };
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  const userModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const reflectorMock = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: reflectorMock },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  describe('when no @Roles() metadata (or empty list)', () => {
    it('allows access when roles metadata is undefined', async () => {
      reflector.getAllAndOverride.mockReturnValue(undefined as unknown as string[]);
      const ctx = createMockContext(undefined);

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]);
      expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('allows access when roles metadata is an empty array', async () => {
      reflector.getAllAndOverride.mockReturnValue([]);
      const ctx = createMockContext({ userId: USER_ID, email: 'a@b.com' });

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(userModel.findById).not.toHaveBeenCalled();
    });
  });

  describe('when roles are required', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValue([RoleName.Admin]);
    });

    it('denies access when request.user is missing', async () => {
      const ctx = createMockContext(undefined);

      await expect(guard.canActivate(ctx)).rejects.toMatchObject({
        response: { message: 'Accès refusé' },
      });
      expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('denies access when request.user has no userId', async () => {
      const ctx = createMockContext({ email: 'a@b.com' });

      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
      expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('allows access when user role matches a required role', async () => {
      const chain = mockUserDbChain(RoleName.Admin);
      userModel.findById.mockReturnValue(chain);
      const ctx = createMockContext({ userId: USER_ID, email: 'a@b.com' });

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(userModel.findById).toHaveBeenCalledWith(USER_ID);
    });

    it('allows access when user has one of several required roles', async () => {
      reflector.getAllAndOverride.mockReturnValue([
        RoleName.Admin,
        RoleName.Prestataire,
      ]);
      const chain = mockUserDbChain(RoleName.Prestataire);
      userModel.findById.mockReturnValue(chain);
      const ctx = createMockContext({ userId: USER_ID });

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('denies access when user role is not in the required list', async () => {
      const chain = mockUserDbChain(RoleName.Voyageur);
      userModel.findById.mockReturnValue(chain);
      const ctx = createMockContext({ userId: USER_ID });

      await expect(guard.canActivate(ctx)).rejects.toMatchObject({
        response: { message: "Vous n'avez pas les autorisations nécessaires" },
      });
    });

    it('denies access when user is not found in database', async () => {
      const chain = mockUserDbChain(null);
      userModel.findById.mockReturnValue(chain);
      const ctx = createMockContext({ userId: USER_ID });

      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    });

    it('denies access when user has no role name on populated document', async () => {
      const lean = jest.fn().mockResolvedValue({ role: {} });
      userModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({ lean }),
        }),
      });
      const ctx = createMockContext({ userId: USER_ID });

      await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    });
  });
});
