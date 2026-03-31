import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Quartier } from '../quartiers/schemas/quartier.schema';
import { Ville } from '../villes/schemas/ville.schema';
import { CreatePaysDto } from './dto/create-pays.dto';
import { UpdatePaysDto } from './dto/update-pays.dto';
import { Pays } from './schemas/pays.schema';
import { PaysService } from './pays.service';

/** Example MongoDB-style id (24 hex chars) for tests that use ObjectId. */
const SAMPLE_ID = '507f1f77bcf86cd799439011';

describe('PaysService', () => {
  let service: PaysService;

  const paysModel = {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  const villeModel = {
    countDocuments: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const quartierModel = {
    exists: jest.fn(),
    create: jest.fn(),
  };

  /** Mongoose query chain used by find().sort().skip().limit().exec() */
  function mockFindChain(data: unknown[]) {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(data),
    };
    paysModel.find.mockReturnValue(chain);
    return chain;
  }

  beforeEach(async () => {
    jest.clearAllMocks();

    paysModel.findOneAndUpdate.mockResolvedValue({
      _id: new Types.ObjectId(SAMPLE_ID),
      nom: 'Maroc',
      code: 'MA',
    });
    villeModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
        nom: 'Kénitra',
        pays: new Types.ObjectId(SAMPLE_ID),
      }),
    });
    quartierModel.exists.mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaysService,
        { provide: getModelToken(Pays.name), useValue: paysModel },
        { provide: getModelToken(Ville.name), useValue: villeModel },
        { provide: getModelToken(Quartier.name), useValue: quartierModel },
      ],
    }).compile();

    service = module.get<PaysService>(PaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- create: builds payload and calls Model.create ---
  describe('create', () => {
    it('saves nom and uppercases code when provided', async () => {
      const dto: CreatePaysDto = { nom: 'Sénégal', code: 'sn' };
      const created = { _id: SAMPLE_ID, nom: 'Sénégal', code: 'SN' };
      paysModel.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(paysModel.create).toHaveBeenCalledWith({
        nom: 'Sénégal',
        code: 'SN',
      });
      expect(result).toEqual(created);
    });

    it('omits code from payload when not sent', async () => {
      const dto: CreatePaysDto = { nom: 'France' };
      paysModel.create.mockResolvedValue({ nom: 'France' });

      await service.create(dto);

      expect(paysModel.create).toHaveBeenCalledWith({ nom: 'France' });
    });
  });

  // --- findAll: pagination defaults, cap, and parallel count ---
  describe('findAll', () => {
    it('uses page 1, limit 20 when query is empty', async () => {
      const rows = [{ nom: 'A' }];
      mockFindChain(rows);
      paysModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll();

      expect(result).toEqual({
        data: rows,
        total: 1,
        page: 1,
        limit: 20,
      });
      const chain = paysModel.find.mock.results[0].value;
      expect(chain.skip).toHaveBeenCalledWith(0);
      expect(chain.limit).toHaveBeenCalledWith(20);
    });

    it('applies custom page and limit from query', async () => {
      mockFindChain([]);
      paysModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      const query: PaginationQueryDto = { page: 2, limit: 10 };

      await service.findAll(query);

      const chain = paysModel.find.mock.results[0].value;
      expect(chain.skip).toHaveBeenCalledWith(10);
      expect(chain.limit).toHaveBeenCalledWith(10);
    });

    it('caps limit at 100', async () => {
      mockFindChain([]);
      paysModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll({ page: 1, limit: 500 });

      const chain = paysModel.find.mock.results[0].value;
      expect(chain.limit).toHaveBeenCalledWith(100);
    });

    it('falls back to page 1 when page is invalid', async () => {
      mockFindChain([]);
      paysModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.findAll({ page: 0, limit: 10 });

      expect(result.page).toBe(1);
    });
  });

  // --- findOne: returns document or NotFoundException ---
  describe('findOne', () => {
    it('returns the country when it exists', async () => {
      const doc = { _id: SAMPLE_ID, nom: 'France' };
      paysModel.findById.mockResolvedValue(doc);

      await expect(service.findOne(SAMPLE_ID)).resolves.toEqual(doc);
      expect(paysModel.findById).toHaveBeenCalledWith(SAMPLE_ID);
    });

    it('throws NotFoundException when id does not match any document', async () => {
      paysModel.findById.mockResolvedValue(null);

      await expect(service.findOne(SAMPLE_ID)).rejects.toMatchObject({
        response: { message: 'Pays introuvable' },
      });
    });
  });

  // --- update: reuses findOne, builds partial update, uppercases code ---
  describe('update', () => {
    it('throws if country does not exist (findOne)', async () => {
      paysModel.findById.mockResolvedValue(null);

      await expect(
        service.update(SAMPLE_ID, { nom: 'X' }),
      ).rejects.toThrow(NotFoundException);
      expect(paysModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('updates fields and uppercases code', async () => {
      const existing = { _id: SAMPLE_ID, nom: 'Old' };
      const updated = { _id: SAMPLE_ID, nom: 'New', code: 'AB' };
      paysModel.findById.mockResolvedValue(existing);
      paysModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated),
      });

      const dto: UpdatePaysDto = { nom: 'New', code: 'ab' };
      const result = await service.update(SAMPLE_ID, dto);

      expect(paysModel.findByIdAndUpdate).toHaveBeenCalledWith(
        SAMPLE_ID,
        { nom: 'New', code: 'AB' },
        { new: true },
      );
      expect(result).toEqual(updated);
    });

    it('sends empty update object when dto has no fields', async () => {
      paysModel.findById.mockResolvedValue({ _id: SAMPLE_ID });
      paysModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: SAMPLE_ID }),
      });

      await service.update(SAMPLE_ID, {});

      expect(paysModel.findByIdAndUpdate).toHaveBeenCalledWith(
        SAMPLE_ID,
        {},
        { new: true },
      );
    });
  });

  // --- delete: blocks when villes exist; otherwise removes pays ---
  describe('delete', () => {
    it('throws NotFoundException when country does not exist', async () => {
      paysModel.findById.mockResolvedValue(null);

      await expect(service.delete(SAMPLE_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(villeModel.countDocuments).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when villes are linked to this pays', async () => {
      paysModel.findById.mockResolvedValue({ _id: SAMPLE_ID });
      villeModel.countDocuments.mockResolvedValue(2);

      await expect(service.delete(SAMPLE_ID)).rejects.toMatchObject({
        response: {
          message: expect.stringContaining('Impossible de supprimer ce pays'),
        },
      });
      expect(villeModel.countDocuments).toHaveBeenCalledWith({
        pays: new Types.ObjectId(SAMPLE_ID),
      });
      expect(paysModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('deletes and returns document when no villes', async () => {
      const doc = { _id: SAMPLE_ID, nom: 'X' };
      paysModel.findById.mockResolvedValue(doc);
      villeModel.countDocuments.mockResolvedValue(0);
      paysModel.findByIdAndDelete.mockResolvedValue(doc);

      const result = await service.delete(SAMPLE_ID);

      expect(paysModel.findByIdAndDelete).toHaveBeenCalledWith(SAMPLE_ID);
      expect(result).toEqual(doc);
    });

    it('throws NotFoundException if delete returns null (race edge case)', async () => {
      paysModel.findById.mockResolvedValue({ _id: SAMPLE_ID });
      villeModel.countDocuments.mockResolvedValue(0);
      paysModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.delete(SAMPLE_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
