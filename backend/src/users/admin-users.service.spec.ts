import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { Abonnement } from '../abonnements/schemas/abonnement.schema';
import { Admin } from '../admins/schemas/admin.schema';
import { Avis } from '../avis/schemas/avis.schema';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { Favori } from '../favoris/schemas/favori.schema';
import { Paiement } from '../paiements/schemas/paiement.schema';
import { Prestataire } from '../prestataires/schemas/prestataire.schema';
import { Reservation } from '../reservations/schemas/reservation.schema';
import { Role } from '../roles/schemas/role.schema';
import { ROLE_NAMES } from '../roles/seeds/roles.seed';
import { RolesService } from '../roles/roles.service';
import { Voyageur } from '../voyageurs/schemas/voyageur.schema';
import { AdminUsersService } from './admin-users.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { User } from './schemas/user.schema';

jest.mock('bcryptjs');

const USER_ID = '507f1f77bcf86cd799439011';
const OTHER_USER_ID = '507f1f77bcf86cd799439012';
const CLIENT_ROLE_OID = new Types.ObjectId('507f1f77bcf86cd799439021');

/**
 * AdminUsersService — admin CRUD, status, safe delete rules.
 * All Mongoose models are mocked objects; RolesService provides role ObjectIds by name.
 * bcrypt.hash is mocked (no real work factor).
 */
describe('AdminUsersService', () => {
  let service: AdminUsersService;

  const userModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const execResolved = (value: unknown) => ({
    exec: jest.fn().mockResolvedValue(value),
  });

  const voyageurModel = {
    deleteMany: jest.fn().mockReturnValue(execResolved({})),
    create: jest.fn().mockResolvedValue({}),
    findOne: jest.fn(),
  };

  const prestataireModel = {
    deleteMany: jest.fn().mockReturnValue(execResolved({})),
    create: jest.fn().mockResolvedValue({}),
  };

  const adminModel = {
    deleteMany: jest.fn().mockReturnValue(execResolved({})),
    create: jest.fn().mockResolvedValue({}),
    findOne: jest.fn(),
  };

  const emptyCountModel = () => ({
    countDocuments: jest.fn().mockReturnValue(execResolved(0)),
  });

  const etablissementModel = emptyCountModel();
  const reservationModel = emptyCountModel();
  const favoriModel = emptyCountModel();
  const avisModel = emptyCountModel();
  const abonnementModel = emptyCountModel();
  const paiementModel = emptyCountModel();

  const rolesService = {
    getRoleIdByName: jest.fn(),
  };

  function mockFindByIdLeanExec(doc: unknown | null) {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    userModel.findById.mockReturnValue(chain);
    return chain;
  }

  /** find().sort().skip().limit().populate().select().lean().exec() */
  function mockFindPaginated(rows: unknown[]) {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(rows),
    };
    userModel.find.mockReturnValue(chain);
    return chain;
  }

  function mockVoyageurFindOne(doc: unknown | null) {
    voyageurModel.findOne.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      }),
    });
  }

  function baseUserDoc(overrides: Record<string, unknown> = {}) {
    return {
      _id: new Types.ObjectId(USER_ID),
      nom: 'Test',
      prenom: 'User',
      email: 'user@example.com',
      isActive: true,
      role: {
        _id: CLIENT_ROLE_OID,
        name: ROLE_NAMES.CLIENT,
        label: 'Client',
      },
      ...overrides,
    };
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-admin-password');

    rolesService.getRoleIdByName.mockImplementation(async (name: string) => {
      if (name === ROLE_NAMES.CLIENT) return CLIENT_ROLE_OID;
      if (name === ROLE_NAMES.ADMIN) return new Types.ObjectId('507f1f77bcf86cd799439099');
      return new Types.ObjectId();
    });

    userModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });
    for (const m of [
      etablissementModel,
      reservationModel,
      favoriModel,
      avisModel,
      abonnementModel,
      paiementModel,
    ]) {
      m.countDocuments.mockReturnValue(execResolved(0));
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Role.name), useValue: {} },
        { provide: getModelToken(Voyageur.name), useValue: voyageurModel },
        { provide: getModelToken(Prestataire.name), useValue: prestataireModel },
        { provide: getModelToken(Admin.name), useValue: adminModel },
        {
          provide: getModelToken(Etablissement.name),
          useValue: etablissementModel,
        },
        {
          provide: getModelToken(Reservation.name),
          useValue: reservationModel,
        },
        { provide: getModelToken(Favori.name), useValue: favoriModel },
        { provide: getModelToken(Avis.name), useValue: avisModel },
        {
          provide: getModelToken(Abonnement.name),
          useValue: abonnementModel,
        },
        { provide: getModelToken(Paiement.name), useValue: paiementModel },
        { provide: RolesService, useValue: rolesService },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllPaginated', () => {
    it('returns safe users and pagination meta', async () => {
      const raw = [
        baseUserDoc({
          _id: new Types.ObjectId(OTHER_USER_ID),
          email: 'a@a.com',
        }),
      ];
      mockFindPaginated(raw);
      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllPaginated({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('password');
      expect(result.data[0].email).toBe('a@a.com');
      expect(result).toMatchObject({ total: 1, page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('throws BadRequestException for invalid id', async () => {
      await expect(service.findOne('bad')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when user is missing', async () => {
      mockFindByIdLeanExec(null);

      await expect(service.findOne(USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('returns safe user and profile without password', async () => {
      mockFindByIdLeanExec(baseUserDoc());
      mockVoyageurFindOne({ preferences: 'mer' });

      const result = await service.findOne(USER_ID);

      expect(result).toMatchObject({
        email: 'user@example.com',
        profile: { type: 'client', preferences: 'mer' },
      });
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('create', () => {
    it('rejects duplicate email', async () => {
      userModel.exists.mockResolvedValue({ _id: new Types.ObjectId() });

      const dto: AdminCreateUserDto = {
        nom: 'A',
        prenom: 'B',
        email: 'dup@example.com',
        password: 'Abcd1234!',
        role: ROLE_NAMES.CLIENT,
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('propagates error when role id cannot be resolved', async () => {
      userModel.exists.mockResolvedValue(null);
      rolesService.getRoleIdByName.mockRejectedValueOnce(
        new InternalServerErrorException('Rôle "client" introuvable'),
      );

      const dto: AdminCreateUserDto = {
        nom: 'A',
        prenom: 'B',
        email: 'new@example.com',
        password: 'Abcd1234!',
        role: ROLE_NAMES.CLIENT,
      };

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('creates user with hashed password and returns admin detail without password', async () => {
      userModel.exists.mockResolvedValue(null);
      const newId = new Types.ObjectId(USER_ID);
      userModel.create.mockResolvedValue({ _id: newId });

      mockFindByIdLeanExec(baseUserDoc());
      mockVoyageurFindOne(null);

      const dto: AdminCreateUserDto = {
        nom: '  Nom  ',
        prenom: '  Pre  ',
        email: '  NEW@Example.com  ',
        password: 'Abcd1234!',
        role: ROLE_NAMES.CLIENT,
      };

      const result = await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Abcd1234!', 10);
      expect(rolesService.getRoleIdByName).toHaveBeenCalledWith(ROLE_NAMES.CLIENT);
      expect(userModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          nom: 'Nom',
          prenom: 'Pre',
          password: 'hashed-admin-password',
          role: CLIENT_ROLE_OID,
        }),
      );
      expect(result.email).toBe('user@example.com');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('update', () => {
    it('throws NotFoundException when user does not exist', async () => {
      mockFindByIdLeanExec(null);

      await expect(
        service.update(USER_ID, { nom: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when existing user has no valid role on document', async () => {
      mockFindByIdLeanExec(
        baseUserDoc({ role: { _id: CLIENT_ROLE_OID } }),
      );

      await expect(
        service.update(USER_ID, { nom: 'X' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when email is taken by another user', async () => {
      mockFindByIdLeanExec(baseUserDoc());
      userModel.exists.mockResolvedValue({ _id: new Types.ObjectId() });

      await expect(
        service.update(USER_ID, { email: 'other@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('applies password hash and unsets refresh token when password is changed', async () => {
      mockFindByIdLeanExec(baseUserDoc());
      userModel.exists.mockResolvedValue(null);
      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });
      mockFindByIdLeanExec(baseUserDoc());

      await service.update(USER_ID, { password: 'Newpass1!' });

      expect(bcrypt.hash).toHaveBeenCalledWith('Newpass1!', 10);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        USER_ID,
        {
          $set: { password: 'hashed-admin-password' },
          $unset: { refreshTokenHash: 1 },
        },
      );
    });
  });

  describe('updateStatus', () => {
    it('forbids admin from deactivating their own account', async () => {
      await expect(
        service.updateStatus(USER_ID, { isActive: false }, USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockFindByIdLeanExec(null);

      await expect(
        service.updateStatus(USER_ID, { isActive: false }, OTHER_USER_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('forbids deleting own account', async () => {
      await expect(service.remove(USER_ID, USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockFindByIdLeanExec(null);

      await expect(service.remove(USER_ID, OTHER_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('refuses hard delete when related business data exists', async () => {
      mockFindByIdLeanExec(baseUserDoc());
      etablissementModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      await expect(service.remove(USER_ID, OTHER_USER_ID)).rejects.toThrow(
        ConflictException,
      );
      expect(userModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('deletes profile rows and user when there are no blockers', async () => {
      mockFindByIdLeanExec(baseUserDoc());
      userModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      await service.remove(USER_ID, OTHER_USER_ID);

      expect(voyageurModel.deleteMany).toHaveBeenCalled();
      expect(prestataireModel.deleteMany).toHaveBeenCalled();
      expect(adminModel.deleteMany).toHaveBeenCalled();
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(USER_ID);
    });
  });
});
