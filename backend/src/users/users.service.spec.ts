import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { Role } from '../roles/schemas/role.schema';
import { RolesService } from '../roles/roles.service';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

jest.mock('bcryptjs');

const USER_ID = '507f1f77bcf86cd799439011';
const CLIENT_ROLE_ID = new Types.ObjectId('507f1f77bcf86cd799439022');

/**
 * UsersService unit tests — no MongoDB.
 * - userModel / roleModel are plain objects with jest.fn() methods matching how the service calls Mongoose.
 * - bcrypt is fully mocked so no real hashing runs.
 * - RolesService.getClientRoleId is mocked (fixed ObjectId for the default « client » role).
 */
describe('UsersService', () => {
  let service: UsersService;

  const userModel = {
    findById: jest.fn(),
    exists: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
  };

  const roleModel = {};

  const rolesService = {
    getClientRoleId: jest.fn(),
  };

  /** findById().populate().select().lean() — used by getProfile (await ends at .lean()) */
  function mockGetProfileChain(doc: unknown | null) {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(doc),
    };
    userModel.findById.mockReturnValue(chain);
    return chain;
  }

  /** findById().populate().lean() — used by CreateUser reload */
  function mockCreateReloadChain(doc: unknown | null) {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(doc),
    };
    userModel.findById.mockReturnValue(chain);
    return chain;
  }

  /** findByIdAndUpdate(...).populate().select().lean() — updateOwnProfile */
  function mockUpdateProfileChain(doc: unknown | null) {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(doc),
    };
    userModel.findByIdAndUpdate.mockReturnValue(chain);
    return chain;
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    rolesService.getClientRoleId.mockResolvedValue(CLIENT_ROLE_ID);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Role.name), useValue: roleModel },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        { provide: RolesService, useValue: rolesService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('') },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreateUser', () => {
    it('hashes password, assigns client role, and returns safe user without password', async () => {
      const createdId = new Types.ObjectId(USER_ID);
      userModel.create.mockResolvedValue({ _id: createdId });

      const leanDoc = {
        _id: createdId,
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean@example.com',
        password: 'hashed-password',
        isActive: true,
        role: { _id: CLIENT_ROLE_ID, name: 'client', label: 'Client' },
      };
      mockCreateReloadChain(leanDoc);

      const dto: CreateUserDto = {
        nom: '  Dupont  ',
        prenom: '  Jean  ',
        email: '  Jean@Example.COM  ',
        password: 'Plain-pass1!',
      };

      const result = await service.CreateUser(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Plain-pass1!', 10);
      expect(rolesService.getClientRoleId).toHaveBeenCalled();
      expect(userModel.create).toHaveBeenCalledWith({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean@example.com',
        password: 'hashed-password',
        telephone: undefined,
        adresse: undefined,
        isActive: true,
        role: CLIENT_ROLE_ID,
      });

      expect(result).toMatchObject({
        id: USER_ID,
        email: 'jean@example.com',
        nom: 'Dupont',
        prenom: 'Jean',
        role: { name: 'client' },
      });
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshTokenHash');
    });
  });

  describe('getProfile', () => {
    it('throws NotFoundException when user does not exist', async () => {
      mockGetProfileChain(null);

      await expect(service.getProfile(USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns mapped profile without password even if lean doc contained it', async () => {
      mockGetProfileChain({
        _id: new Types.ObjectId(USER_ID),
        nom: 'A',
        prenom: 'B',
        email: 'a@b.com',
        password: 'should-not-leak',
        refreshTokenHash: 'secret',
        isActive: true,
        role: { _id: CLIENT_ROLE_ID, name: 'client', label: 'Client' },
      });

      const result = await service.getProfile(USER_ID);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshTokenHash');
      expect(result.email).toBe('a@b.com');
    });
  });

  describe('updateOwnProfile', () => {
    it('throws ConflictException when email is already used by another user', async () => {
      userModel.exists.mockResolvedValue({ _id: new Types.ObjectId() });

      await expect(
        service.updateOwnProfile(USER_ID, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
      expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('returns current profile when there is nothing to update', async () => {
      userModel.exists.mockResolvedValue(null);
      const profileDoc = {
        _id: new Types.ObjectId(USER_ID),
        nom: 'A',
        prenom: 'B',
        email: 'same@example.com',
        isActive: true,
        role: { _id: CLIENT_ROLE_ID, name: 'client', label: 'Client' },
      };
      mockGetProfileChain(profileDoc);

      const result = await service.updateOwnProfile(USER_ID, {});

      expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(result.email).toBe('same@example.com');
    });
  });
});
