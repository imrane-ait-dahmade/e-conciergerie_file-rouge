import { Test, TestingModule } from '@nestjs/testing';
import { QuartiersService } from './quartiers.service';

describe('QuartiersService', () => {
  let service: QuartiersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuartiersService],
    }).compile();

    service = module.get<QuartiersService>(QuartiersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
