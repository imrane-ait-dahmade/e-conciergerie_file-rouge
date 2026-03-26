import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Pays } from '../pays/schemas/pays.schema';
import { Quartier } from '../quartiers/schemas/quartier.schema';
import { Ville } from './schemas/ville.schema';
import { VillesService } from './villes.service';

describe('VillesService', () => {
  let service: VillesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VillesService,
        { provide: getModelToken(Ville.name), useValue: {} },
        { provide: getModelToken(Pays.name), useValue: {} },
        { provide: getModelToken(Quartier.name), useValue: {} },
      ],
    }).compile();

    service = module.get<VillesService>(VillesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
