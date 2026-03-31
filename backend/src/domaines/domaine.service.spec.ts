import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateDomaineDto } from './dto/create-domaine.dto';
import { UpdateDomaineDto } from './dto/update-domaine.dto';
import { Domaine } from './schemas/domaine.schema';
import { DomaineService } from './domaine.service';

/** Valid MongoDB ObjectId string used when the service must accept the id. */
const VALID_ID = '507f1f77bcf86cd799439011';

/**
 * Mock setup (no real database):
 * - We register DomaineService with `getModelToken(Domaine.name)` pointing to a plain object.
 * - That object mimics Mongoose Model methods used by DomaineService: create, find, findById, etc.
 * - Methods that return query chains (find, findById, …) return small objects with `lean()` and `exec()`
 *   wired so `await model.findById(id).lean().exec()` resolves to whatever you set on `exec`.
 */
describe('DomaineService', () => {
  let service: DomaineService;

  const domaineModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  /** Chain for find().sort().lean().exec() */
  function mockFindAllChain(result: unknown[]) {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(result),
    };
    domaineModel.find.mockReturnValue(chain);
    return chain;
  }

  /** Chain for findById(id).lean().exec() */
  function mockFindByIdChain(doc: unknown | null) {
    const chain = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    domaineModel.findById.mockReturnValue(chain);
    return chain;
  }

  /** Chain for findByIdAndUpdate(...).lean().exec() */
  function mockFindByIdAndUpdateChain(doc: unknown | null) {
    const chain = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    domaineModel.findByIdAndUpdate.mockReturnValue(chain);
    return chain;
  }

  /** Chain for findByIdAndDelete(id).lean().exec() */
  function mockFindByIdAndDeleteChain(doc: unknown | null) {
    const chain = {
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    domaineModel.findByIdAndDelete.mockReturnValue(chain);
    return chain;
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomaineService,
        {
          provide: getModelToken(Domaine.name),
          useValue: domaineModel,
        },
      ],
    }).compile();

    service = module.get<DomaineService>(DomaineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('trims nom and persists optional description', async () => {
      const dto: CreateDomaineDto = {
        nom: '  Hôtellerie  ',
        description: '  details  ',
      };
      const created = { _id: VALID_ID, nom: 'Hôtellerie', description: 'details' };
      domaineModel.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(domaineModel.create).toHaveBeenCalledWith({
        nom: 'Hôtellerie',
        description: 'details',
        slug: 'hotellerie',
        isActive: true,
        order: 0,
      });
      expect(result).toEqual(created);
    });

    it('only sends nom when description is omitted', async () => {
      const dto: CreateDomaineDto = { nom: 'Restauration' };
      domaineModel.create.mockResolvedValue({ nom: 'Restauration' });

      await service.create(dto);

      expect(domaineModel.create).toHaveBeenCalledWith({
        nom: 'Restauration',
        slug: 'restauration',
        isActive: true,
        order: 0,
      });
    });

    it('persists optional icon when provided', async () => {
      const dto: CreateDomaineDto = {
        nom: 'Hébergement',
        icon: 'bed',
      };
      domaineModel.create.mockResolvedValue({ ...dto });

      await service.create(dto);

      expect(domaineModel.create).toHaveBeenCalledWith({
        nom: 'Hébergement',
        slug: 'hebergement',
        isActive: true,
        order: 0,
        icon: 'bed',
      });
    });
  });

  describe('findActiveForMobileHome', () => {
    it('returns empty array when no domaines', async () => {
      const chain = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      domaineModel.find.mockReturnValue(chain);

      await expect(service.findActiveForMobileHome()).resolves.toEqual([]);
      expect(domaineModel.find).toHaveBeenCalledWith({
        isActive: { $ne: false },
      });
    });

    it('maps active domaines sorted by order then name', async () => {
      const rows = [
        {
          _id: '507f1f77bcf86cd799439012',
          nom: 'Vols',
          slug: 'vols',
          icon: 'plane',
          isActive: true,
          order: 2,
        },
        {
          _id: VALID_ID,
          nom: 'Hébergements',
          slug: 'hebergements',
          icon: 'bed',
          isActive: true,
          order: 1,
        },
      ];
      const chain = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(rows),
      };
      domaineModel.find.mockReturnValue(chain);

      const result = await service.findActiveForMobileHome();

      expect(result).toEqual([
        {
          id: VALID_ID,
          name: 'Hébergements',
          slug: 'hebergements',
          icon: 'bed',
          isActive: true,
          order: 1,
        },
        {
          id: '507f1f77bcf86cd799439012',
          name: 'Vols',
          slug: 'vols',
          icon: 'plane',
          isActive: true,
          order: 2,
        },
      ]);
    });

    it('derives slug from nom when slug missing in document', async () => {
      const rows = [
        {
          _id: VALID_ID,
          nom: 'Spa & Bien-être',
          isActive: true,
          order: 0,
        },
      ];
      domaineModel.find.mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(rows),
      });

      const result = await service.findActiveForMobileHome();

      expect(result[0].slug).toBe('spa-bien-etre');
    });
  });

  describe('findAll', () => {
    it('returns all domaines sorted by nom', async () => {
      const list = [
        { _id: VALID_ID, nom: 'A' },
        { _id: '507f1f77bcf86cd799439012', nom: 'B' },
      ];
      const chain = mockFindAllChain(list);

      const result = await service.findAll();

      expect(domaineModel.find).toHaveBeenCalled();
      expect(chain.sort).toHaveBeenCalledWith({ nom: 1 });
      expect(result).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('throws BadRequestException when id is not a valid ObjectId', async () => {
      await expect(service.findOne('not-valid')).rejects.toThrow(
        BadRequestException,
      );
      expect(domaineModel.findById).not.toHaveBeenCalled();
    });

    it('returns the document when it exists', async () => {
      const doc = { _id: VALID_ID, nom: 'Hôtellerie' };
      mockFindByIdChain(doc);

      await expect(service.findOne(VALID_ID)).resolves.toEqual(doc);
      expect(domaineModel.findById).toHaveBeenCalledWith(VALID_ID);
    });

    it('throws NotFoundException when no document matches the id', async () => {
      mockFindByIdChain(null);

      await expect(service.findOne(VALID_ID)).rejects.toMatchObject({
        response: {
          message: `Domaine introuvable (id: ${VALID_ID})`,
        },
      });
    });
  });

  describe('update', () => {
    it('does not update when findOne would fail', async () => {
      mockFindByIdChain(null);

      await expect(
        service.update(VALID_ID, { nom: 'X' }),
      ).rejects.toThrow(NotFoundException);
      expect(domaineModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('applies trimmed partial fields and returns updated doc', async () => {
      const existing = { _id: VALID_ID, nom: 'Old' };
      const updated = { _id: VALID_ID, nom: 'New', description: 'D' };
      mockFindByIdChain(existing);
      mockFindByIdAndUpdateChain(updated);

      const dto: UpdateDomaineDto = { nom: '  New  ', description: '  D  ' };
      const result = await service.update(VALID_ID, dto);

      expect(domaineModel.findByIdAndUpdate).toHaveBeenCalledWith(
        VALID_ID,
        { $set: { nom: 'New', description: 'D' } },
        { new: true },
      );
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when findByIdAndUpdate returns null', async () => {
      mockFindByIdChain({ _id: VALID_ID });
      mockFindByIdAndUpdateChain(null);

      await expect(service.update(VALID_ID, { nom: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('sets icon with $set', async () => {
      mockFindByIdChain({ _id: VALID_ID });
      mockFindByIdAndUpdateChain({ _id: VALID_ID, icon: 'plane' });

      await service.update(VALID_ID, { icon: 'plane' });

      expect(domaineModel.findByIdAndUpdate).toHaveBeenCalledWith(
        VALID_ID,
        { $set: { icon: 'plane' } },
        { new: true },
      );
    });

    it('clears icon with $unset when value is empty after trim', async () => {
      mockFindByIdChain({ _id: VALID_ID });
      mockFindByIdAndUpdateChain({ _id: VALID_ID });

      await service.update(VALID_ID, { icon: '   ' });

      expect(domaineModel.findByIdAndUpdate).toHaveBeenCalledWith(
        VALID_ID,
        { $unset: { icon: 1 } },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('does not delete when findOne would fail', async () => {
      mockFindByIdChain(null);

      await expect(service.remove(VALID_ID)).rejects.toThrow(NotFoundException);
      expect(domaineModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('deletes and returns the removed document', async () => {
      const doc = { _id: VALID_ID, nom: 'X' };
      mockFindByIdChain(doc);
      mockFindByIdAndDeleteChain(doc);

      const result = await service.remove(VALID_ID);

      expect(domaineModel.findByIdAndDelete).toHaveBeenCalledWith(VALID_ID);
      expect(result).toEqual(doc);
    });

    it('throws NotFoundException when findByIdAndDelete returns null', async () => {
      mockFindByIdChain({ _id: VALID_ID });
      mockFindByIdAndDeleteChain(null);

      await expect(service.remove(VALID_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
