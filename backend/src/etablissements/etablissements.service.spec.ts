/**
 * Tests unitaires pour EtablissementsService.
 * Chaque test vérifie un comportement précis du service.
 * Les dépendances (Mongoose Model) sont mockées pour isoler le service.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EtablissementsService } from './etablissements.service';

// Objet mock pour simuler un établissement en base
const mockEtablissement = {
  _id: '507f1f77bcf86cd799439011',
  nom: 'Mon Restaurant',
  adresse: '123 Rue Example',
  prestataire: '507f1f77bcf86cd799439012',
};

/**
 * Crée un objet "thenable" (utilisé par Mongoose findById).
 * Permet de faire await sur un mock.
 */
function mockResolve(value: unknown) {
  return {
    then: (resolve: (v: unknown) => void) => resolve(value),
    catch: () => ({}),
  };
}

/**
 * Crée une chaîne select().lean() pour mocker findById().select().lean()
 */
function mockSelectLean(value: unknown) {
  return {
    select: () => ({
      lean: () => mockResolve(value),
    }),
    then: (resolve: (v: unknown) => void) => resolve(value),
    catch: () => ({}),
  };
}

describe('EtablissementsService', () => {
  let service: EtablissementsService;
  let mockModel: {
    create: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findByIdAndDelete: jest.Mock;
  };

  beforeEach(async () => {
    // Mock du modèle Mongoose (on simule la base de données)
    mockModel = {
      create: jest.fn().mockResolvedValue(mockEtablissement),
      find: jest.fn().mockReturnValue([]),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn().mockResolvedValue(mockEtablissement),
      findByIdAndDelete: jest.fn().mockResolvedValue(mockEtablissement),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EtablissementsService,
        {
          provide: getModelToken('Etablissement'),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<EtablissementsService>(EtablissementsService);
    jest.clearAllMocks();
  });

  it('service doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('doit créer un établissement avec prestataire = userId', async () => {
      // Arrange : données d'entrée (userId = ObjectId valide 24 caractères hex)
      const dto = { nom: 'Mon Restaurant', adresse: '123 Rue Example' };
      const userId = '507f1f77bcf86cd799439012';

      // Act : appel de la méthode
      await service.create(dto, userId);

      // Assert : vérifie que create a été appelé avec les bonnes données
      expect(mockModel.create).toHaveBeenCalledTimes(1);
      const callArg = mockModel.create.mock.calls[0][0];
      expect(callArg.nom).toBe('Mon Restaurant');
      expect(callArg.adresse).toBe('123 Rue Example');
      expect(String(callArg.prestataire)).toBe(userId);
    });
  });

  describe('findAll', () => {
    it('doit retourner la liste des établissements', async () => {
      const liste = [{ nom: 'Etab1' }, { nom: 'Etab2' }];
      mockModel.find.mockReturnValue(liste);

      const result = await service.findAll();

      expect(mockModel.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(liste);
    });
  });

  describe('findOne', () => {
    it('doit retourner un établissement si trouvé', async () => {
      mockModel.findById.mockReturnValue(mockResolve(mockEtablissement));

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(mockModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockEtablissement);
    });

    it('doit lancer NotFoundException si non trouvé', async () => {
      mockModel.findById.mockReturnValue(mockResolve(null));

      await expect(service.findOne('id inexistant')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('id inexistant')).rejects.toThrow('Établissement introuvable');
    });
  });

  describe('update', () => {
    it('doit mettre à jour si utilisateur est le propriétaire', async () => {
      const userId = '507f1f77bcf86cd799439012';
      mockModel.findById.mockReturnValue(
        mockSelectLean({ prestataire: userId }),
      );
      const dto = { nom: 'Nouveau nom' };

      const result = await service.update('507f1f77bcf86cd799439011', dto, userId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        dto,
        { new: true },
      );
      expect(result).toEqual(mockEtablissement);
    });

    it('doit lancer ForbiddenException si utilisateur nest pas le propriétaire', async () => {
      mockModel.findById.mockReturnValue(
        mockSelectLean({ prestataire: '507f1f77bcf86cd799439099' }),
      );
      const dto = { nom: 'Nouveau nom' };
      const userId = '507f1f77bcf86cd799439012'; // différent du propriétaire

      await expect(
        service.update('507f1f77bcf86cd799439011', dto, userId),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update('507f1f77bcf86cd799439011', dto, userId),
      ).rejects.toThrow('Vous ne pouvez pas modifier cet établissement');

      expect(mockModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('doit lancer NotFoundException si établissement inexistant', async () => {
      mockModel.findById.mockReturnValue(mockSelectLean(null));

      await expect(
        service.update('507f00000000000000000000', { nom: 'Test' }, '507f1f77bcf86cd799439012'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('doit supprimer si utilisateur est le propriétaire', async () => {
      const userId = '507f1f77bcf86cd799439012';
      mockModel.findById.mockReturnValue(
        mockSelectLean({ prestataire: userId }),
      );

      const result = await service.delete('507f1f77bcf86cd799439011', userId);

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual(mockEtablissement);
    });

    it('doit lancer ForbiddenException si utilisateur nest pas le propriétaire', async () => {
      mockModel.findById.mockReturnValue(
        mockSelectLean({ prestataire: '507f1f77bcf86cd799439099' }),
      );
      const userId = '507f1f77bcf86cd799439012';

      await expect(
        service.delete('507f1f77bcf86cd799439011', userId),
      ).rejects.toThrow(ForbiddenException);

      expect(mockModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('doit lancer NotFoundException si établissement inexistant', async () => {
      mockModel.findById.mockReturnValue(mockSelectLean(null));
      mockModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(
        service.delete('507f00000000000000000000', '507f1f77bcf86cd799439012'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
