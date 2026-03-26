import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Ville } from '../villes/schemas/ville.schema';
import { Quartier } from './schemas/quartier.schema';
import { QuartiersService } from './quartiers.service';

describe('QuartiersService', () => {
  let service: QuartiersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuartiersService,
        { provide: getModelToken(Quartier.name), useValue: {} },
        { provide: getModelToken(Ville.name), useValue: {} },
      ],
    }).compile();

    service = module.get<QuartiersService>(QuartiersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
