/**
 * `ProviderEstablishmentServicesService` — offres établissement ↔ service.
 * La propriété passe par `ensurePrestataireOwnsEtablissementService` → **404** si l’assignation
 * n’appartient pas au prestataire (anti-IDOR), pas `ForbiddenException`.
 */
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { EtablissementService } from '../etablissement-services/schemas/etablissement-service.schema';
import { Service } from '../services/schemas/service.schema';
import { ProviderEstablishmentServicesService } from './provider-establishment-services.service';

const ETAB_ID = '507f1f77bcf86cd799439011';
const PRESTATAIRE_ID = '507f1f77bcf86cd799439012';
const ASSIGN_ID = '507f1f77bcf86cd799439013';

function liaisonSelectChain(etablissementId: Types.ObjectId | null) {
  return {
    select: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue(
            etablissementId ? { etablissement: etablissementId } : null,
          ),
      }),
    }),
  };
}

describe('ProviderEstablishmentServicesService', () => {
  let service: ProviderEstablishmentServicesService;

  const liaisonModel = {
    find: jest.fn(),
    findById: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const etablissementModel = {
    exists: jest.fn(),
    find: jest.fn(),
  };

  const serviceModel = {
    exists: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderEstablishmentServicesService,
        {
          provide: getModelToken(EtablissementService.name),
          useValue: liaisonModel,
        },
        {
          provide: getModelToken(Etablissement.name),
          useValue: etablissementModel,
        },
        { provide: getModelToken(Service.name), useValue: serviceModel },
      ],
    }).compile();

    service = module.get<ProviderEstablishmentServicesService>(
      ProviderEstablishmentServicesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Provider ownership on establishment-service row', () => {
    it('prestataire can delete their own assignment (chain validates ownership)', async () => {
      liaisonModel.findById.mockReturnValue(
        liaisonSelectChain(new Types.ObjectId(ETAB_ID)),
      );
      etablissementModel.exists.mockResolvedValue({ _id: ETAB_ID });
      liaisonModel.findByIdAndDelete.mockReturnValue(
        execResolved({ _id: ASSIGN_ID }),
      );

      await service.removeForProvider(ASSIGN_ID, PRESTATAIRE_ID);

      expect(liaisonModel.findByIdAndDelete).toHaveBeenCalledWith(ASSIGN_ID);
    });

    it('prestataire cannot delete another prestataire assignment (NotFoundException)', async () => {
      liaisonModel.findById.mockReturnValue(
        liaisonSelectChain(new Types.ObjectId(ETAB_ID)),
      );
      etablissementModel.exists.mockResolvedValue(null);

      await expect(
        service.removeForProvider(ASSIGN_ID, PRESTATAIRE_ID),
      ).rejects.toThrow(NotFoundException);
      expect(liaisonModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('updateForProvider rejects when assignment is not owned', async () => {
      liaisonModel.findById.mockReturnValue(
        liaisonSelectChain(new Types.ObjectId(ETAB_ID)),
      );
      etablissementModel.exists.mockResolvedValue(null);

      await expect(
        service.updateForProvider(ASSIGN_ID, { prix: 10 }, PRESTATAIRE_ID),
      ).rejects.toThrow(NotFoundException);
      expect(liaisonModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});

function execResolved<T>(v: T) {
  return { exec: jest.fn().mockResolvedValue(v) };
}
