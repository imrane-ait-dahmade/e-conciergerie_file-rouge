/**
 * EtablissementsService (prestataire) — unit tests, Mongoose mocké, pas de vraie base.
 */
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Domaine } from '../domaines/schemas/domaine.schema';
import { Pays } from '../pays/schemas/pays.schema';
import { Quartier } from '../quartiers/schemas/quartier.schema';
import { User } from '../users/schemas/user.schema';
import { Ville } from '../villes/schemas/ville.schema';
import { Etablissement } from './schemas/etablissement.schema';
import { EtablissementsService } from './etablissements.service';

const ETAB_ID = '507f1f77bcf86cd799439011';
const OWNER_ID = '507f1f77bcf86cd799439012';

const mockEtablissement = {
  _id: ETAB_ID,
  nom: 'Mon Restaurant',
  adresse: '123 Rue Example',
  prestataire: new Types.ObjectId(OWNER_ID),
};

/** findById(id) seul — utilisé par findOne (await direct sur la query). */
function mockFindByIdResolves<T>(value: T | null) {
  return Promise.resolve(value);
}

/** findById(id).select('prestataire').lean() — utilisé par verifierProprietaire */
function mockOwnerCheckChain(doc: { prestataire: unknown } | null) {
  return {
    select: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(doc),
    }),
  };
}

describe('EtablissementsService', () => {
  let service: EtablissementsService;

  const etablissementModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  const userModel = { findOne: jest.fn() };
  const domaineModel = { findOne: jest.fn() };
  const paysModel = { findOne: jest.fn() };
  const villeModel = { findOne: jest.fn() };
  const quartierModel = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    etablissementModel.create.mockResolvedValue(mockEtablissement);
    etablissementModel.find.mockReturnValue([]);
    etablissementModel.findByIdAndUpdate.mockResolvedValue(mockEtablissement);
    etablissementModel.findByIdAndDelete.mockResolvedValue(mockEtablissement);

    userModel.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EtablissementsService,
        {
          provide: getModelToken(Etablissement.name),
          useValue: etablissementModel,
        },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Domaine.name), useValue: domaineModel },
        { provide: getModelToken(Pays.name), useValue: paysModel },
        { provide: getModelToken(Ville.name), useValue: villeModel },
        { provide: getModelToken(Quartier.name), useValue: quartierModel },
      ],
    }).compile();

    service = module.get<EtablissementsService>(EtablissementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates with prestataire set to connected user id', async () => {
      const dto = { nom: 'Mon Restaurant', adresse: '123 Rue Example' };

      const result = await service.create(dto, OWNER_ID);

      expect(etablissementModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nom: 'Mon Restaurant',
          adresse: '123 Rue Example',
          prestataire: new Types.ObjectId(OWNER_ID),
        }),
      );
      expect(result).toEqual(mockEtablissement);
    });
  });

  describe('findAll', () => {
    it('returns find() result', async () => {
      const liste = [{ nom: 'Etab1' }, { nom: 'Etab2' }];
      etablissementModel.find.mockReturnValue(liste);

      const result = await service.findAll();

      expect(etablissementModel.find).toHaveBeenCalled();
      expect(result).toEqual(liste);
    });
  });

  describe('findHomeBestProviders', () => {
    it('queries active featured establishments with sort and limit', async () => {
      const rows = [{ nom: 'Top', isActive: true }];
      const exec = jest.fn().mockResolvedValue(rows);
      const sort = jest.fn().mockReturnThis();
      etablissementModel.find.mockReturnValue({
        sort,
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec,
      });

      const result = await service.findHomeBestProviders(10);

      expect(etablissementModel.find).toHaveBeenCalledWith({
        isActive: true,
        isFeaturedForHomeBestProviders: true,
      });
      expect(sort).toHaveBeenCalledWith({
        bestProviderSortOrder: 1,
        createdAt: -1,
      });
      expect(result).toEqual(rows);
    });
  });

  describe('findMobileBestProviders', () => {
    it('uses mobile home sort (order, rating desc, id desc)', async () => {
      const rows = [{ nom: 'M' }];
      const exec = jest.fn().mockResolvedValue(rows);
      const sort = jest.fn().mockReturnThis();
      etablissementModel.find.mockReturnValue({
        sort,
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec,
      });

      await service.findMobileBestProviders(15);

      expect(sort).toHaveBeenCalledWith({
        bestProviderSortOrder: 1,
        averageRating: -1,
        _id: -1,
      });
    });
  });

  describe('findOne', () => {
    it('returns establishment when found', async () => {
      etablissementModel.findById.mockReturnValue(
        mockFindByIdResolves(mockEtablissement),
      );

      const result = await service.findOne(ETAB_ID);

      expect(etablissementModel.findById).toHaveBeenCalledWith(ETAB_ID);
      expect(result).toEqual(mockEtablissement);
    });

    it('throws NotFoundException when missing', async () => {
      etablissementModel.findById.mockReturnValue(mockFindByIdResolves(null));

      await expect(service.findOne(ETAB_ID)).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Routes publiques prestataire (`EtablissementsService`) : si le JWT ne correspond pas
   * à `Etablissement.prestataire`, le service lève **ForbiddenException** (pas seulement 404).
   */
  describe('Provider ownership (prestataire API)', () => {
    describe('update', () => {
      it('allows provider to update their own establishment', async () => {
        etablissementModel.findById.mockReturnValue(
          mockOwnerCheckChain({ prestataire: new Types.ObjectId(OWNER_ID) }),
        );
        const dto = { nom: 'Nouveau nom' };

        const result = await service.update(ETAB_ID, dto, OWNER_ID);

        expect(etablissementModel.findByIdAndUpdate).toHaveBeenCalledWith(
          ETAB_ID,
          dto,
          { new: true },
        );
        expect(result).toEqual(mockEtablissement);
      });

      it('forbids provider from updating another provider establishment', async () => {
        etablissementModel.findById.mockReturnValue(
          mockOwnerCheckChain({
            prestataire: new Types.ObjectId('507f1f77bcf86cd799439099'),
          }),
        );

        await expect(
          service.update(ETAB_ID, { nom: 'X' }, OWNER_ID),
        ).rejects.toThrow(ForbiddenException);
        expect(etablissementModel.findByIdAndUpdate).not.toHaveBeenCalled();
      });

      it('throws NotFoundException when establishment missing', async () => {
        etablissementModel.findById.mockReturnValue(mockOwnerCheckChain(null));

        await expect(
          service.update(ETAB_ID, { nom: 'Test' }, OWNER_ID),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('delete', () => {
      it('allows provider to delete their own establishment', async () => {
        etablissementModel.findById.mockReturnValue(
          mockOwnerCheckChain({ prestataire: new Types.ObjectId(OWNER_ID) }),
        );

        const result = await service.delete(ETAB_ID, OWNER_ID);

        expect(etablissementModel.findByIdAndDelete).toHaveBeenCalledWith(ETAB_ID);
        expect(result).toEqual(mockEtablissement);
      });

      it('forbids provider from deleting another provider establishment', async () => {
        etablissementModel.findById.mockReturnValue(
          mockOwnerCheckChain({
            prestataire: new Types.ObjectId('507f1f77bcf86cd799439099'),
          }),
        );

        await expect(service.delete(ETAB_ID, OWNER_ID)).rejects.toThrow(
          ForbiddenException,
        );
        expect(etablissementModel.findByIdAndDelete).not.toHaveBeenCalled();
      });

      it('throws NotFoundException when establishment missing before delete', async () => {
        etablissementModel.findById.mockReturnValue(mockOwnerCheckChain(null));

        await expect(service.delete(ETAB_ID, OWNER_ID)).rejects.toThrow(
          NotFoundException,
        );
        expect(etablissementModel.findByIdAndDelete).not.toHaveBeenCalled();
      });

      it('throws NotFoundException when findByIdAndDelete returns null', async () => {
        etablissementModel.findById.mockReturnValue(
          mockOwnerCheckChain({ prestataire: new Types.ObjectId(OWNER_ID) }),
        );
        etablissementModel.findByIdAndDelete.mockResolvedValue(null);

        await expect(service.delete(ETAB_ID, OWNER_ID)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
