import { Test, TestingModule } from '@nestjs/testing';
import { VillesController } from './villes.controller';
import { VillesService } from './villes.service';

describe('VillesController', () => {
  let controller: VillesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VillesController],
      providers: [
        {
          provide: VillesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VillesController>(VillesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
