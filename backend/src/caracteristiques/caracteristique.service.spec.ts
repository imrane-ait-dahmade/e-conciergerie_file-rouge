import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Service } from '../services/schemas/service.schema';
import { CreateCaracteristiqueDto } from './dto/create-caracteristique.dto';
import { UpdateCaracteristiqueDto } from './dto/update-caracteristique.dto';
import { Caracteristique } from './schemas/caracteristique.schema';
import { CaracteristiqueService } from './caracteristique.service';

const CARAC_ID = '507f1f77bcf86cd799439011';
const SERVICE_ID = '507f1f77bcf86cd799439022';

/**
 * Setup: no database.
 * - `caracteristiqueModel` = mocked Mongoose model for Caracteristique (CRUD + query chains).
 * - `serviceModel` = mocked Service model; `assertServiceExists` uses `findById().lean().exec()`.
 * Both are registered with `getModelToken(Class.name)` like Nest + MongooseModule do at runtime.
 */
describe('CaracteristiqueService', () => {
  let service: CaracteristiqueService;

  const caracteristiqueModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const serviceModel = {
    findById: jest.fn(),
  };

  function mockServiceFindById(doc: unknown | null) {
    const chain = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    serviceModel.findById.mockReturnValue(chain);
    return chain;
  }

  function mockFindAllChain(result: unknown[]) {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(result),
    };
    caracteristiqueModel.find.mockReturnValue(chain);
    return chain;
  }

  function mockCaracFindByIdChain(doc: unknown | null) {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    caracteristiqueModel.findById.mockReturnValue(chain);
    return chain;
  }

  function mockFindByIdAndUpdateChain(doc: unknown | null) {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    caracteristiqueModel.findByIdAndUpdate.mockReturnValue(chain);
    return chain;
  }

  function mockFindByIdAndDeleteChain(doc: unknown | null) {
    const chain = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    caracteristiqueModel.findByIdAndDelete.mockReturnValue(chain);
    return chain;
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaracteristiqueService,
        {
          provide: getModelToken(Caracteristique.name),
          useValue: caracteristiqueModel,
        },
        { provide: getModelToken(Service.name), useValue: serviceModel },
      ],
    }).compile();

    service = module.get<CaracteristiqueService>(CaracteristiqueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('trims libelle and creates without service when omitted', async () => {
      const created = { _id: CARAC_ID, libelle: 'Wi-Fi' };
      caracteristiqueModel.create.mockResolvedValue(created);

      const dto: CreateCaracteristiqueDto = { libelle: '  Wi-Fi  ' };
      const result = await service.create(dto);

      expect(serviceModel.findById).not.toHaveBeenCalled();
      expect(caracteristiqueModel.create).toHaveBeenCalledWith({ libelle: 'Wi-Fi' });
      expect(result).toEqual(created);
    });

    it('checks service exists and stores ObjectId when service is provided', async () => {
      mockServiceFindById({ _id: SERVICE_ID, nom: 'Hôtelier' });
      const created = {
        _id: CARAC_ID,
        libelle: 'Pool',
        service: new Types.ObjectId(SERVICE_ID),
      };
      caracteristiqueModel.create.mockResolvedValue(created);

      const dto: CreateCaracteristiqueDto = {
        libelle: 'Pool',
        service: SERVICE_ID,
      };
      const result = await service.create(dto);

      expect(serviceModel.findById).toHaveBeenCalledWith(SERVICE_ID);
      expect(caracteristiqueModel.create).toHaveBeenCalledWith({
        libelle: 'Pool',
        service: new Types.ObjectId(SERVICE_ID),
      });
      expect(result).toEqual(created);
    });

    it('throws BadRequestException when service id is not a valid ObjectId', async () => {
      const dto: CreateCaracteristiqueDto = {
        libelle: 'X',
        service: 'not-a-valid-objectid',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(caracteristiqueModel.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when service does not exist', async () => {
      mockServiceFindById(null);
      const dto: CreateCaracteristiqueDto = {
        libelle: 'X',
        service: SERVICE_ID,
      };

      await expect(service.create(dto)).rejects.toMatchObject({
        response: { message: `Service introuvable (id: ${SERVICE_ID})` },
      });
      expect(caracteristiqueModel.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns list sorted by libelle with service populated', async () => {
      const rows = [{ _id: CARAC_ID, libelle: 'A' }];
      const chain = mockFindAllChain(rows);

      const result = await service.findAll();

      expect(caracteristiqueModel.find).toHaveBeenCalled();
      expect(chain.sort).toHaveBeenCalledWith({ libelle: 1 });
      expect(chain.populate).toHaveBeenCalledWith([
        { path: 'service', select: 'nom description' },
      ]);
      expect(result).toEqual(rows);
    });
  });

  describe('findOne', () => {
    it('throws BadRequestException when id is invalid', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(
        BadRequestException,
      );
      expect(caracteristiqueModel.findById).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when caracteristique does not exist', async () => {
      mockCaracFindByIdChain(null);

      await expect(service.findOne(CARAC_ID)).rejects.toMatchObject({
        response: {
          message: `Caractéristique introuvable (id: ${CARAC_ID})`,
        },
      });
    });

    it('returns document when found', async () => {
      const doc = { _id: CARAC_ID, libelle: 'Wi-Fi' };
      mockCaracFindByIdChain(doc);

      await expect(service.findOne(CARAC_ID)).resolves.toEqual(doc);
    });
  });

  describe('update', () => {
    it('does not update when findOne fails', async () => {
      mockCaracFindByIdChain(null);

      await expect(
        service.update(CARAC_ID, { libelle: 'Y' }),
      ).rejects.toThrow(NotFoundException);
      expect(caracteristiqueModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('validates service when dto.service is set', async () => {
      mockCaracFindByIdChain({ _id: CARAC_ID });
      mockServiceFindById({ _id: SERVICE_ID });
      const updated = { _id: CARAC_ID, service: SERVICE_ID };
      mockFindByIdAndUpdateChain(updated);

      const dto: UpdateCaracteristiqueDto = { service: SERVICE_ID };
      await service.update(CARAC_ID, dto);

      expect(serviceModel.findById).toHaveBeenCalledWith(SERVICE_ID);
      expect(caracteristiqueModel.findByIdAndUpdate).toHaveBeenCalledWith(
        CARAC_ID,
        { service: new Types.ObjectId(SERVICE_ID) },
        { new: true },
      );
    });

    it('does not query Service model when dto.service is omitted', async () => {
      mockCaracFindByIdChain({ _id: CARAC_ID });
      mockFindByIdAndUpdateChain({ _id: CARAC_ID, libelle: 'N' });

      await service.update(CARAC_ID, { libelle: '  N  ' });

      expect(serviceModel.findById).not.toHaveBeenCalled();
      expect(caracteristiqueModel.findByIdAndUpdate).toHaveBeenCalledWith(
        CARAC_ID,
        { libelle: 'N' },
        { new: true },
      );
    });

    it('throws NotFoundException when findByIdAndUpdate returns null', async () => {
      mockCaracFindByIdChain({ _id: CARAC_ID });
      mockFindByIdAndUpdateChain(null);

      await expect(
        service.update(CARAC_ID, { libelle: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('does not delete when findOne fails', async () => {
      mockCaracFindByIdChain(null);

      await expect(service.remove(CARAC_ID)).rejects.toThrow(NotFoundException);
      expect(caracteristiqueModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('deletes and returns document when found', async () => {
      const doc = { _id: CARAC_ID, libelle: 'X' };
      mockCaracFindByIdChain(doc);
      mockFindByIdAndDeleteChain(doc);

      const result = await service.remove(CARAC_ID);

      expect(caracteristiqueModel.findByIdAndDelete).toHaveBeenCalledWith(
        CARAC_ID,
      );
      expect(result).toEqual(doc);
    });

    it('throws NotFoundException when findByIdAndDelete returns null', async () => {
      mockCaracFindByIdChain({ _id: CARAC_ID });
      mockFindByIdAndDeleteChain(null);

      await expect(service.remove(CARAC_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
