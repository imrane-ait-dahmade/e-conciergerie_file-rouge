import { Test, TestingModule } from '@nestjs/testing';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';

const SERVICE_ID = '507f1f77bcf86cd799439011';

describe('ServiceController', () => {
  let controller: ServiceController;

  const serviceService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [{ provide: ServiceService, useValue: serviceService }],
    }).compile();

    controller = module.get<ServiceController>(ServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to ServiceService.create', async () => {
      const dto: CreateServiceDto = {
        nom: 'Hôtelier',
        domaine: '507f1f77bcf86cd799439022',
      };
      const created = { _id: SERVICE_ID, ...dto };
      serviceService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(serviceService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('delegates to ServiceService.findAll', async () => {
      const list = [];
      serviceService.findAll.mockResolvedValue(list);

      const result = await controller.findAll();

      expect(serviceService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('delegates to ServiceService.findOne', async () => {
      const doc = { _id: SERVICE_ID, nom: 'A' };
      serviceService.findOne.mockResolvedValue(doc);

      const result = await controller.findOne(SERVICE_ID);

      expect(serviceService.findOne).toHaveBeenCalledWith(SERVICE_ID);
      expect(result).toEqual(doc);
    });
  });

  describe('update', () => {
    it('delegates to ServiceService.update', async () => {
      const dto: UpdateServiceDto = { nom: 'B' };
      const updated = { _id: SERVICE_ID, nom: 'B' };
      serviceService.update.mockResolvedValue(updated);

      const result = await controller.update(SERVICE_ID, dto);

      expect(serviceService.update).toHaveBeenCalledWith(SERVICE_ID, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('delegates to ServiceService.remove', async () => {
      const removed = { _id: SERVICE_ID };
      serviceService.remove.mockResolvedValue(removed);

      const result = await controller.remove(SERVICE_ID);

      expect(serviceService.remove).toHaveBeenCalledWith(SERVICE_ID);
      expect(result).toEqual(removed);
    });
  });
});
