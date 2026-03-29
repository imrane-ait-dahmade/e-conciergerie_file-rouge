import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from '../media/media.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreatePaysDto } from './dto/create-pays.dto';
import { UpdatePaysDto } from './dto/update-pays.dto';
import { PaysController } from './pays.controller';
import { PaysService } from './pays.service';

const SAMPLE_ID = '507f1f77bcf86cd799439011';

describe('PaysController', () => {
  let controller: PaysController;

  const paysService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mediaService = {
    findPrimaryMediaForCountry: jest.fn(),
    findMediaForCountry: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaysController],
      providers: [
        { provide: PaysService, useValue: paysService },
        { provide: MediaService, useValue: mediaService },
      ],
    }).compile();

    controller = module.get<PaysController>(PaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Thin controllers: we only check that the right service method runs with the right args ---
  describe('create', () => {
    it('forwards body to PaysService.create', async () => {
      const dto: CreatePaysDto = { nom: 'France', code: 'fr' };
      const created = { _id: SAMPLE_ID, ...dto };
      paysService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(paysService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('forwards query to PaysService.findAll', async () => {
      const query: PaginationQueryDto = { page: 2, limit: 5 };
      const payload = { data: [], total: 0, page: 2, limit: 5 };
      paysService.findAll.mockResolvedValue(payload);

      const result = await controller.findAll(query);

      expect(paysService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(payload);
    });
  });

  describe('findOne', () => {
    it('forwards id to PaysService.findOne', async () => {
      const doc = { _id: SAMPLE_ID, nom: 'France' };
      paysService.findOne.mockResolvedValue(doc);

      const result = await controller.findOne(SAMPLE_ID);

      expect(paysService.findOne).toHaveBeenCalledWith(SAMPLE_ID);
      expect(result).toEqual(doc);
    });
  });

  describe('update', () => {
    it('forwards id and body to PaysService.update', async () => {
      const dto: UpdatePaysDto = { nom: 'République' };
      const updated = { _id: SAMPLE_ID, ...dto };
      paysService.update.mockResolvedValue(updated);

      const result = await controller.update(SAMPLE_ID, dto);

      expect(paysService.update).toHaveBeenCalledWith(SAMPLE_ID, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('forwards id to PaysService.delete', async () => {
      const removed = { _id: SAMPLE_ID };
      paysService.delete.mockResolvedValue(removed);

      const result = await controller.remove(SAMPLE_ID);

      expect(paysService.delete).toHaveBeenCalledWith(SAMPLE_ID);
      expect(result).toEqual(removed);
    });
  });

  describe('media routes', () => {
    it('delegates primary media to MediaService', async () => {
      const primary = { url: '/x' };
      mediaService.findPrimaryMediaForCountry.mockResolvedValue(primary);

      const result = await controller.findCountryPrimaryMedia(SAMPLE_ID);

      expect(mediaService.findPrimaryMediaForCountry).toHaveBeenCalledWith(
        SAMPLE_ID,
      );
      expect(result).toEqual(primary);
    });

    it('delegates country media list to MediaService', async () => {
      const list = [];
      mediaService.findMediaForCountry.mockResolvedValue(list);

      const result = await controller.findCountryMedia(SAMPLE_ID);

      expect(mediaService.findMediaForCountry).toHaveBeenCalledWith(SAMPLE_ID);
      expect(result).toEqual(list);
    });
  });
});
