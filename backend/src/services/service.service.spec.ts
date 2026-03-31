import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { DomaineService } from '../domaines/domaine.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Domaine } from '../domaines/schemas/domaine.schema';
import { Service } from './schemas/service.schema';
import { ServiceService } from './service.service';

const SERVICE_ID = '507f1f77bcf86cd799439011';
const DOMAINE_ID = '507f1f77bcf86cd799439022';

/**
 * Mocks (no MongoDB):
 * - `serviceModel` mimics Mongoose Model: create, find, findById, findByIdAndUpdate, findByIdAndDelete.
 * - Query chains mirror the real code: .sort().populate().lean().exec() or .populate().lean().exec().
 * - `DomaineService` is replaced with `{ findOne: jest.fn() }` because create/update delegate
 *   domaine checks to `domaineService.findOne(id)` (see assertDomaineExists in ServiceService).
 */
describe('ServiceService', () => {
  let service: ServiceService;

  const serviceModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  const domaineModel = {
    findOne: jest.fn().mockResolvedValue(null),
  };

  const domaineService = {
    findOne: jest.fn(),
  };

  function mockFindAllChain(result: unknown[]) {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(result),
    };
    serviceModel.find.mockReturnValue(chain);
    return chain;
  }

  function mockFindByIdChain(doc: unknown | null) {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    serviceModel.findById.mockReturnValue(chain);
    return chain;
  }

  function mockFindByIdAndUpdateChain(doc: unknown | null) {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    serviceModel.findByIdAndUpdate.mockReturnValue(chain);
    return chain;
  }

  function mockFindByIdAndDeleteChain(doc: unknown | null) {
    const chain = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    serviceModel.findByIdAndDelete.mockReturnValue(chain);
    return chain;
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceService,
        { provide: getModelToken(Service.name), useValue: serviceModel },
        { provide: getModelToken(Domaine.name), useValue: domaineModel },
        { provide: DomaineService, useValue: domaineService },
      ],
    }).compile();

    service = module.get<ServiceService>(ServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('checks domaine exists then creates with trimmed fields and ObjectId domaine', async () => {
      domaineService.findOne.mockResolvedValue({ _id: DOMAINE_ID, nom: 'Hôtellerie' });
      const created = {
        _id: SERVICE_ID,
        nom: 'Hôtelier',
        domaine: new Types.ObjectId(DOMAINE_ID),
      };
      serviceModel.create.mockResolvedValue(created);

      const dto: CreateServiceDto = {
        nom: '  Hôtelier  ',
        description: '  desc  ',
        domaine: DOMAINE_ID,
      };
      const result = await service.create(dto);

      expect(domaineService.findOne).toHaveBeenCalledWith(DOMAINE_ID);
      expect(serviceModel.create).toHaveBeenCalledWith({
        nom: 'Hôtelier',
        description: 'desc',
        domaine: new Types.ObjectId(DOMAINE_ID),
      });
      expect(result).toEqual(created);
    });

    it('does not create when domaine is missing (NotFoundException from DomaineService)', async () => {
      domaineService.findOne.mockRejectedValue(
        new NotFoundException(`Domaine introuvable (id: ${DOMAINE_ID})`),
      );

      const dto: CreateServiceDto = {
        nom: 'X',
        domaine: DOMAINE_ID,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(serviceModel.create).not.toHaveBeenCalled();
    });

    it('does not create when domaine id is invalid (BadRequestException from DomaineService)', async () => {
      domaineService.findOne.mockRejectedValue(
        new BadRequestException('Identifiant MongoDB invalide'),
      );

      const dto: CreateServiceDto = {
        nom: 'X',
        domaine: DOMAINE_ID,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(serviceModel.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns services sorted by nom with populate configured', async () => {
      const rows = [{ _id: SERVICE_ID, nom: 'A', domaine: null }];
      const chain = mockFindAllChain(rows);

      const result = await service.findAll();

      expect(serviceModel.find).toHaveBeenCalled();
      expect(chain.sort).toHaveBeenCalledWith({ nom: 1 });
      expect(chain.populate).toHaveBeenCalledWith([
        { path: 'domaine', select: 'nom description icon' },
      ]);
      expect(result).toEqual(rows);
    });
  });

  describe('findOne', () => {
    it('throws BadRequestException when service id is not a valid ObjectId', async () => {
      await expect(service.findOne('bad-id')).rejects.toThrow(BadRequestException);
      expect(serviceModel.findById).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when service does not exist', async () => {
      mockFindByIdChain(null);

      await expect(service.findOne(SERVICE_ID)).rejects.toMatchObject({
        response: {
          message: `Service introuvable (id: ${SERVICE_ID})`,
        },
      });
    });

    it('returns the document when it exists', async () => {
      const doc = { _id: SERVICE_ID, nom: 'Hôtelier', domaine: null };
      mockFindByIdChain(doc);

      await expect(service.findOne(SERVICE_ID)).resolves.toEqual(doc);
      expect(serviceModel.findById).toHaveBeenCalledWith(SERVICE_ID);
    });
  });

  describe('update', () => {
    it('throws when service does not exist (findOne)', async () => {
      mockFindByIdChain(null);

      await expect(
        service.update(SERVICE_ID, { nom: 'Y' }),
      ).rejects.toThrow(NotFoundException);
      expect(domaineService.findOne).not.toHaveBeenCalled();
      expect(serviceModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('validates new domaine when dto.domaine is provided', async () => {
      mockFindByIdChain({ _id: SERVICE_ID, nom: 'Old' });
      domaineService.findOne.mockResolvedValue({ _id: DOMAINE_ID });
      const updated = { _id: SERVICE_ID, nom: 'Old', domaine: DOMAINE_ID };
      mockFindByIdAndUpdateChain(updated);

      const dto: UpdateServiceDto = { domaine: DOMAINE_ID };
      await service.update(SERVICE_ID, dto);

      expect(domaineService.findOne).toHaveBeenCalledWith(DOMAINE_ID);
      expect(serviceModel.findByIdAndUpdate).toHaveBeenCalledWith(
        SERVICE_ID,
        { $set: { domaine: new Types.ObjectId(DOMAINE_ID) } },
        { new: true },
      );
    });

    it('does not call DomaineService when domaine is omitted from dto', async () => {
      mockFindByIdChain({ _id: SERVICE_ID });
      mockFindByIdAndUpdateChain({ _id: SERVICE_ID, nom: 'N' });

      await service.update(SERVICE_ID, { nom: '  N  ' });

      expect(domaineService.findOne).not.toHaveBeenCalled();
      expect(serviceModel.findByIdAndUpdate).toHaveBeenCalledWith(
        SERVICE_ID,
        { $set: { nom: 'N' } },
        { new: true },
      );
    });

    it('propagates NotFoundException when new domaine does not exist', async () => {
      mockFindByIdChain({ _id: SERVICE_ID });
      domaineService.findOne.mockRejectedValue(
        new NotFoundException(`Domaine introuvable (id: ${DOMAINE_ID})`),
      );

      await expect(
        service.update(SERVICE_ID, { domaine: DOMAINE_ID }),
      ).rejects.toThrow(NotFoundException);
      expect(serviceModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when findByIdAndUpdate returns null', async () => {
      mockFindByIdChain({ _id: SERVICE_ID });
      mockFindByIdAndUpdateChain(null);

      await expect(
        service.update(SERVICE_ID, { nom: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('does not delete when service does not exist', async () => {
      mockFindByIdChain(null);

      await expect(service.remove(SERVICE_ID)).rejects.toThrow(NotFoundException);
      expect(serviceModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('removes and returns document when it exists', async () => {
      const doc = { _id: SERVICE_ID, nom: 'X' };
      mockFindByIdChain(doc);
      mockFindByIdAndDeleteChain(doc);

      const result = await service.remove(SERVICE_ID);

      expect(serviceModel.findByIdAndDelete).toHaveBeenCalledWith(SERVICE_ID);
      expect(result).toEqual(doc);
    });

    it('throws NotFoundException when findByIdAndDelete returns null', async () => {
      mockFindByIdChain({ _id: SERVICE_ID });
      mockFindByIdAndDeleteChain(null);

      await expect(service.remove(SERVICE_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
