import { Test, TestingModule } from '@nestjs/testing';
import { EtablissementsController } from './etablissements.controller';
import { EtablissementsService } from './etablissements.service';

describe('EtablissementsController', () => {
  let controller: EtablissementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EtablissementsController],
      providers: [{ provide: EtablissementsService, useValue: {} }],
    }).compile();

    controller = module.get<EtablissementsController>(EtablissementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
