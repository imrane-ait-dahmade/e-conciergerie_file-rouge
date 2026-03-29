/**
 * `ProviderEtablissementsService` — routes dédiées prestataire.
 * Mise à jour : `findOne({ _id, prestataire })` ; si aucune ligne → **NotFoundException**
 * (même si l’établissement existe pour un autre prestataire — anti-IDOR).
 */
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { ProviderEtablissementsService } from './provider-etablissements.service';

const ETAB_ID = '507f1f77bcf86cd799439011';
const PRESTATAIRE_ID = '507f1f77bcf86cd799439012';

describe('ProviderEtablissementsService', () => {
  let service: ProviderEtablissementsService;

  const etablissementModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderEtablissementsService,
        {
          provide: getModelToken(Etablissement.name),
          useValue: etablissementModel,
        },
      ],
    }).compile();

    service = module.get<ProviderEtablissementsService>(
      ProviderEtablissementsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Provider ownership (scoped findOne)', () => {
    it('prestataire can update their own establishment', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const doc = {
        nom: 'Ancien',
        save,
      };
      etablissementModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      await service.updateForProvider(
        ETAB_ID,
        { nom: 'Nouveau' },
        PRESTATAIRE_ID,
      );

      expect(etablissementModel.findOne).toHaveBeenCalledWith({
        _id: new Types.ObjectId(ETAB_ID),
        prestataire: new Types.ObjectId(PRESTATAIRE_ID),
      });
      expect(doc.nom).toBe('Nouveau');
      expect(save).toHaveBeenCalled();
    });

    it('prestataire cannot update another prestataire establishment (404)', async () => {
      etablissementModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateForProvider(ETAB_ID, { nom: 'X' }, PRESTATAIRE_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
