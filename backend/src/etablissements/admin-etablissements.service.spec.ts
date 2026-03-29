import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Avis } from '../avis/schemas/avis.schema';
import { Domaine } from '../domaines/schemas/domaine.schema';
import { EtablissementService } from '../etablissement-services/schemas/etablissement-service.schema';
import { Favori } from '../favoris/schemas/favori.schema';
import { Pays } from '../pays/schemas/pays.schema';
import { Quartier } from '../quartiers/schemas/quartier.schema';
import { Reservation } from '../reservations/schemas/reservation.schema';
import { ROLE_NAMES } from '../roles/seeds/roles.seed';
import { User } from '../users/schemas/user.schema';
import { Ville } from '../villes/schemas/ville.schema';
import { AdminEtablissementsService } from './admin-etablissements.service';
import { AdminCreateEtablissementDto } from './dto/admin-create-etablissement.dto';
import { Etablissement } from './schemas/etablissement.schema';

const ETAB_ID = '507f1f77bcf86cd799439011';
const PRESTATAIRE_ID = '507f1f77bcf86cd799439012';
const DOMAINE_ID = '507f1f77bcf86cd799439013';
const PAYS_ID = '507f1f77bcf86cd799439014';
const VILLE_ID = '507f1f77bcf86cd799439015';
const QUARTIER_ID = '507f1f77bcf86cd799439016';
const OTHER_VILLE_ID = '507f1f77bcf86cd799439017';
const OTHER_PAYS_ID = '507f1f77bcf86cd799439018';

/**
 * AdminEtablissementsService — tout est mocké (models Mongoose), pas de DB.
 * - assertPrestataireUser → userModel.findById().populate('role').lean()
 * - assertDomaineExists → domaineModel.exists()
 * - normalizeGeo → quartier / ville / pays models (cohérence nation ↔ ville ↔ quartier)
 */
describe('AdminEtablissementsService', () => {
  let service: AdminEtablissementsService;

  const etablissementModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const userModel = {
    findById: jest.fn(),
  };

  const domaineModel = {
    exists: jest.fn(),
  };

  const paysModel = { findById: jest.fn() };
  const villeModel = { findById: jest.fn() };
  const quartierModel = { findById: jest.fn() };

  const etablissementServiceModel = {
    countDocuments: jest.fn(),
  };
  const reservationModel = { countDocuments: jest.fn() };
  const favoriModel = { countDocuments: jest.fn() };
  const avisModel = { countDocuments: jest.fn() };

  const execResolved = (n: number) => ({
    exec: jest.fn().mockResolvedValue(n),
  });

  function mockPrestataireUserDoc(roleName: string | null) {
    userModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(PRESTATAIRE_ID),
          role: roleName ? { name: roleName } : {},
        }),
      }),
    });
  }

  function mockEtabFindOneChain(doc: unknown | null) {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(doc),
    };
    etablissementModel.findById.mockReturnValue(chain);
    return chain;
  }

  function mockPaginatedFind(rows: unknown[]) {
    const chain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(rows),
    };
    etablissementModel.find.mockReturnValue(chain);
    return chain;
  }

  const detailDoc = {
    _id: new Types.ObjectId(ETAB_ID),
    nom: 'Hôtel',
    prestataire: new Types.ObjectId(PRESTATAIRE_ID),
    pays: new Types.ObjectId(PAYS_ID),
    ville: new Types.ObjectId(VILLE_ID),
    quartier: new Types.ObjectId(QUARTIER_ID),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    etablissementModel.countDocuments.mockReturnValue(execResolved(0));
    for (const m of [
      etablissementServiceModel,
      reservationModel,
      favoriModel,
      avisModel,
    ]) {
      m.countDocuments.mockReturnValue(execResolved(0));
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminEtablissementsService,
        {
          provide: getModelToken(Etablissement.name),
          useValue: etablissementModel,
        },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Domaine.name), useValue: domaineModel },
        { provide: getModelToken(Pays.name), useValue: paysModel },
        { provide: getModelToken(Ville.name), useValue: villeModel },
        { provide: getModelToken(Quartier.name), useValue: quartierModel },
        {
          provide: getModelToken(EtablissementService.name),
          useValue: etablissementServiceModel,
        },
        {
          provide: getModelToken(Reservation.name),
          useValue: reservationModel,
        },
        { provide: getModelToken(Favori.name), useValue: favoriModel },
        { provide: getModelToken(Avis.name), useValue: avisModel },
      ],
    }).compile();

    service = module.get<AdminEtablissementsService>(AdminEtablissementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllPaginated', () => {
    it('returns data, total, page, limit', async () => {
      mockPaginatedFind([detailDoc]);
      etablissementModel.countDocuments.mockReturnValue(execResolved(3));

      const result = await service.findAllPaginated({ page: 2, limit: 5 });

      expect(result.data).toEqual([detailDoc]);
      expect(result).toMatchObject({ total: 3, page: 2, limit: 5 });
    });
  });

  describe('findOne', () => {
    it('throws BadRequestException when id is invalid', async () => {
      await expect(service.findOne('bad')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when establishment does not exist', async () => {
      mockEtabFindOneChain(null);

      await expect(service.findOne(ETAB_ID)).rejects.toThrow(NotFoundException);
    });

    it('returns document when found', async () => {
      mockEtabFindOneChain(detailDoc);

      await expect(service.findOne(ETAB_ID)).resolves.toEqual(detailDoc);
    });
  });

  describe('create', () => {
    const baseDto: AdminCreateEtablissementDto = {
      nom: '  Mon hôtel  ',
      prestataire: PRESTATAIRE_ID,
    };

    it('throws NotFoundException when prestataire user does not exist', async () => {
      userModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.create(baseDto)).rejects.toMatchObject({
        response: { message: 'Utilisateur (prestataire) introuvable' },
      });
      expect(etablissementModel.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when user is not prestataire role', async () => {
      mockPrestataireUserDoc(ROLE_NAMES.CLIENT);

      await expect(service.create(baseDto)).rejects.toThrow(BadRequestException);
      expect(etablissementModel.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when domaine id does not exist', async () => {
      mockPrestataireUserDoc(ROLE_NAMES.PRESTATAIRE);
      domaineModel.exists.mockResolvedValue(null);

      await expect(
        service.create({ ...baseDto, domaine: DOMAINE_ID }),
      ).rejects.toThrow(NotFoundException);
      expect(etablissementModel.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when quartier is missing', async () => {
      mockPrestataireUserDoc(ROLE_NAMES.PRESTATAIRE);
      quartierModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.create({ ...baseDto, quartier: QUARTIER_ID }),
      ).rejects.toThrow(NotFoundException);
      expect(etablissementModel.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when quartier does not match ville', async () => {
      mockPrestataireUserDoc(ROLE_NAMES.PRESTATAIRE);
      quartierModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          ville: new Types.ObjectId(VILLE_ID),
        }),
      });

      await expect(
        service.create({
          ...baseDto,
          quartier: QUARTIER_ID,
          ville: OTHER_VILLE_ID,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(etablissementModel.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when ville does not match pays', async () => {
      mockPrestataireUserDoc(ROLE_NAMES.PRESTATAIRE);
      villeModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          pays: new Types.ObjectId(PAYS_ID),
        }),
      });

      await expect(
        service.create({
          ...baseDto,
          ville: VILLE_ID,
          pays: OTHER_PAYS_ID,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(etablissementModel.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when pays is missing', async () => {
      mockPrestataireUserDoc(ROLE_NAMES.PRESTATAIRE);
      villeModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          pays: new Types.ObjectId(PAYS_ID),
        }),
      });
      paysModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.create({ ...baseDto, ville: VILLE_ID }),
      ).rejects.toThrow(NotFoundException);
      expect(etablissementModel.create).not.toHaveBeenCalled();
    });

    it('creates and returns findOne result when validations pass', async () => {
      mockPrestataireUserDoc(ROLE_NAMES.PRESTATAIRE);
      domaineModel.exists.mockResolvedValue({ _id: DOMAINE_ID });
      const createdId = new Types.ObjectId(ETAB_ID);
      etablissementModel.create.mockResolvedValue({ _id: createdId });
      mockEtabFindOneChain(detailDoc);

      const dto: AdminCreateEtablissementDto = {
        ...baseDto,
        domaine: DOMAINE_ID,
        email: '  Contact@TEST.com  ',
      };

      const result = await service.create(dto);

      expect(etablissementModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nom: 'Mon hôtel',
          email: 'contact@test.com',
          domaine: new Types.ObjectId(DOMAINE_ID),
          prestataire: new Types.ObjectId(PRESTATAIRE_ID),
        }),
      );
      expect(result).toEqual(detailDoc);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when establishment does not exist', async () => {
      etablissementModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(ETAB_ID, { nom: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns findOne when there is nothing to update', async () => {
      etablissementModel.findById
        .mockReturnValueOnce({
          lean: jest.fn().mockResolvedValue({ ...detailDoc }),
        })
        .mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(detailDoc),
        });

      const result = await service.update(ETAB_ID, {});

      expect(etablissementModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(result).toEqual(detailDoc);
    });

    it('throws BadRequestException when new prestataire is not prestataire role', async () => {
      etablissementModel.findById.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue({ ...detailDoc }),
      });
      mockPrestataireUserDoc(ROLE_NAMES.CLIENT);

      await expect(
        service.update(ETAB_ID, { prestataire: PRESTATAIRE_ID }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('throws NotFoundException when establishment does not exist', async () => {
      etablissementModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateStatus(ETAB_ID, { isActive: false }),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates status and returns findOne', async () => {
      etablissementModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: ETAB_ID }),
      });
      mockEtabFindOneChain(detailDoc);

      const result = await service.updateStatus(ETAB_ID, { isActive: false });

      expect(etablissementModel.findByIdAndUpdate).toHaveBeenCalledWith(
        ETAB_ID,
        { $set: { isActive: false } },
        { new: true },
      );
      expect(result).toEqual(detailDoc);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when establishment does not exist', async () => {
      etablissementModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(ETAB_ID)).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when linked data exists', async () => {
      etablissementModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...detailDoc }),
      });
      etablissementServiceModel.countDocuments.mockReturnValue(
        execResolved(2),
      );

      await expect(service.remove(ETAB_ID)).rejects.toThrow(ConflictException);
      expect(etablissementModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('deletes when there are no blockers', async () => {
      etablissementModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...detailDoc }),
      });
      etablissementModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      await service.remove(ETAB_ID);

      expect(etablissementModel.findByIdAndDelete).toHaveBeenCalledWith(ETAB_ID);
    });
  });
});
