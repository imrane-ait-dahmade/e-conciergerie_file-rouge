import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Ville } from '../villes/schemas/ville.schema';
import { Pays } from './schemas/pays.schema';
import { PaysService } from './pays.service';

describe('PaysService', () => {
  let service: PaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaysService,
        {
          provide: getModelToken(Pays.name),
          useValue: {},
        },
        {
          provide: getModelToken(Ville.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PaysService>(PaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
