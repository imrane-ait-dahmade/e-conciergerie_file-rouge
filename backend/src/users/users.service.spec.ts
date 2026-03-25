import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { RolesService } from '../roles/roles.service';
import { UsersService } from './users.service';
import { Role } from '../roles/schemas/role.schema';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: {} },
        { provide: getModelToken(Role.name), useValue: {} },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        {
          provide: RolesService,
          useValue: {
            getClientRoleId: jest.fn().mockResolvedValue(new Types.ObjectId()),
          },
        },
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
});
