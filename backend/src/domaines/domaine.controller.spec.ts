import { Test, TestingModule } from '@nestjs/testing';
import { CreateDomaineDto } from './dto/create-domaine.dto';
import { UpdateDomaineDto } from './dto/update-domaine.dto';
import { DomaineController } from './domaine.controller';
import { DomaineService } from './domaine.service';

const VALID_ID = '507f1f77bcf86cd799439011';

/**
 * Controller unit test: DomaineService is replaced by a mock object.
 * We only assert that HTTP handlers call the right service method and return its result.
 */
describe('DomaineController', () => {
  let controller: DomaineController;

  const domaineService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DomaineController],
      providers: [{ provide: DomaineService, useValue: domaineService }],
    }).compile();

    controller = module.get<DomaineController>(DomaineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to DomaineService.create', async () => {
      const dto: CreateDomaineDto = { nom: 'Hôtellerie' };
      const created = { _id: VALID_ID, ...dto };
      domaineService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(domaineService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('delegates to DomaineService.findAll', async () => {
      const list = [{ _id: VALID_ID, nom: 'A' }];
      domaineService.findAll.mockResolvedValue(list);

      const result = await controller.findAll();

      expect(domaineService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('delegates to DomaineService.findOne', async () => {
      const doc = { _id: VALID_ID, nom: 'A' };
      domaineService.findOne.mockResolvedValue(doc);

      const result = await controller.findOne(VALID_ID);

      expect(domaineService.findOne).toHaveBeenCalledWith(VALID_ID);
      expect(result).toEqual(doc);
    });
  });

  describe('update', () => {
    it('delegates to DomaineService.update', async () => {
      const dto: UpdateDomaineDto = { nom: 'B' };
      const updated = { _id: VALID_ID, nom: 'B' };
      domaineService.update.mockResolvedValue(updated);

      const result = await controller.update(VALID_ID, dto);

      expect(domaineService.update).toHaveBeenCalledWith(VALID_ID, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('delegates to DomaineService.remove', async () => {
      const removed = { _id: VALID_ID };
      domaineService.remove.mockResolvedValue(removed);

      const result = await controller.remove(VALID_ID);

      expect(domaineService.remove).toHaveBeenCalledWith(VALID_ID);
      expect(result).toEqual(removed);
    });
  });
});
