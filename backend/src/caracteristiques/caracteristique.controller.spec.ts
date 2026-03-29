import { Test, TestingModule } from '@nestjs/testing';
import { CaracteristiqueController } from './caracteristique.controller';
import { CaracteristiqueService } from './caracteristique.service';
import { CreateCaracteristiqueDto } from './dto/create-caracteristique.dto';
import { UpdateCaracteristiqueDto } from './dto/update-caracteristique.dto';

const CARAC_ID = '507f1f77bcf86cd799439011';

/** Controller tests: mock the service and assert each route forwards to the right method. */
describe('CaracteristiqueController', () => {
  let controller: CaracteristiqueController;

  const caracteristiqueService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaracteristiqueController],
      providers: [
        { provide: CaracteristiqueService, useValue: caracteristiqueService },
      ],
    }).compile();

    controller = module.get<CaracteristiqueController>(CaracteristiqueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to CaracteristiqueService.create', async () => {
      const dto: CreateCaracteristiqueDto = { libelle: 'Wi-Fi' };
      const created = { _id: CARAC_ID, ...dto };
      caracteristiqueService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(caracteristiqueService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('delegates to CaracteristiqueService.findAll', async () => {
      const list = [];
      caracteristiqueService.findAll.mockResolvedValue(list);

      const result = await controller.findAll();

      expect(caracteristiqueService.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('delegates to CaracteristiqueService.findOne', async () => {
      const doc = { _id: CARAC_ID, libelle: 'A' };
      caracteristiqueService.findOne.mockResolvedValue(doc);

      const result = await controller.findOne(CARAC_ID);

      expect(caracteristiqueService.findOne).toHaveBeenCalledWith(CARAC_ID);
      expect(result).toEqual(doc);
    });
  });

  describe('update', () => {
    it('delegates to CaracteristiqueService.update', async () => {
      const dto: UpdateCaracteristiqueDto = { libelle: 'B' };
      const updated = { _id: CARAC_ID, libelle: 'B' };
      caracteristiqueService.update.mockResolvedValue(updated);

      const result = await controller.update(CARAC_ID, dto);

      expect(caracteristiqueService.update).toHaveBeenCalledWith(CARAC_ID, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('delegates to CaracteristiqueService.remove', async () => {
      const removed = { _id: CARAC_ID };
      caracteristiqueService.remove.mockResolvedValue(removed);

      const result = await controller.remove(CARAC_ID);

      expect(caracteristiqueService.remove).toHaveBeenCalledWith(CARAC_ID);
      expect(result).toEqual(removed);
    });
  });
});
