/**
 * Tests des helpers `ensurePrestataireOwns*` utilisés par les services « provider ».
 *
 * Comportement anti-IDOR : si l’établissement n’appartient pas au prestataire, on lève
 * **NotFoundException** (« Établissement introuvable ») — pas Forbidden — pour ne pas révéler
 * qu’un id existe chez un autre compte.
 */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  assertValidObjectId,
  ensurePrestataireOwnsEtablissement,
  ensurePrestataireOwnsEtablissementService,
} from './prestataire-ownership.util';

const ETAB_ID = '507f1f77bcf86cd799439011';
const USER_ID = '507f1f77bcf86cd799439012';
const ASSIGN_ID = '507f1f77bcf86cd799439013';

describe('prestataire-ownership.util', () => {
  describe('assertValidObjectId', () => {
    it('throws BadRequestException when id is invalid', () => {
      expect(() => assertValidObjectId('nope', 'test')).toThrow(BadRequestException);
    });
  });

  describe('ensurePrestataireOwnsEtablissement', () => {
    const etablissementModel = {
      exists: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('resolves when establishment exists and prestataire matches', async () => {
      etablissementModel.exists.mockResolvedValue({ _id: ETAB_ID });

      await expect(
        ensurePrestataireOwnsEtablissement(
          etablissementModel as never,
          ETAB_ID,
          USER_ID,
        ),
      ).resolves.toBeUndefined();

      expect(etablissementModel.exists).toHaveBeenCalledWith({
        _id: new Types.ObjectId(ETAB_ID),
        prestataire: new Types.ObjectId(USER_ID),
      });
    });

    it('throws NotFoundException when establishment is not owned (or missing)', async () => {
      etablissementModel.exists.mockResolvedValue(null);

      await expect(
        ensurePrestataireOwnsEtablissement(
          etablissementModel as never,
          ETAB_ID,
          USER_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('ensurePrestataireOwnsEtablissementService', () => {
    const liaisonModel = {
      findById: jest.fn(),
    };
    const etablissementModel = {
      exists: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      liaisonModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({
              etablissement: new Types.ObjectId(ETAB_ID),
            }),
          }),
        }),
      });
    });

    it('throws NotFoundException when assignment row does not exist', async () => {
      liaisonModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(
        ensurePrestataireOwnsEtablissementService(
          liaisonModel as never,
          etablissementModel as never,
          ASSIGN_ID,
          USER_ID,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(etablissementModel.exists).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when linked establishment is not owned by prestataire', async () => {
      etablissementModel.exists.mockResolvedValue(null);

      await expect(
        ensurePrestataireOwnsEtablissementService(
          liaisonModel as never,
          etablissementModel as never,
          ASSIGN_ID,
          USER_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('resolves when assignment exists and prestataire owns the establishment', async () => {
      etablissementModel.exists.mockResolvedValue({ _id: ETAB_ID });

      await expect(
        ensurePrestataireOwnsEtablissementService(
          liaisonModel as never,
          etablissementModel as never,
          ASSIGN_ID,
          USER_ID,
        ),
      ).resolves.toBeUndefined();
    });
  });
});
