/**
 * MediaService — tests unitaires sans MinIO ni MongoDB réels.
 *
 * Ce qui est mocké et pourquoi :
 * - UploadsService : encapsule le client MinIO (`uploadFileWithKey`, `removeObject`). On simule
 *   une réponse { bucket, key, size } pour ne jamais appeler le réseau.
 * - ConfigService : `minio.publicUrl` sert à construire l’URL publique ; valeur fixe en test.
 * - Modèles Mongoose (Media, Etablissement, EtablissementService, Pays, Ville) : objets avec
 *   jest.fn() qui reproduisent les chaînes utilisées dans le service (.exec(), .lean(), etc.).
 */
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Etablissement } from '../etablissements/schemas/etablissement.schema';
import { EtablissementService } from '../etablissement-services/schemas/etablissement-service.schema';
import { Pays } from '../pays/schemas/pays.schema';
import { UploadsService } from '../uploads/uploads.service';
import { Ville } from '../villes/schemas/ville.schema';
import { ListMediaQueryDto } from './dto/list-media-query.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { Media } from './schemas/media.schema';
import { MediaService } from './media.service';

const ETAB_ID = '507f1f77bcf86cd799439011';
const PRESTATAIRE_ID = '507f1f77bcf86cd799439012';
const OTHER_PRESTATAIRE_ID = '507f1f77bcf86cd799439013';
const ES_ROW_ID = '507f1f77bcf86cd799439014';
const MEDIA_ID = '507f1f77bcf86cd799439015';
const COUNTRY_ID = '507f1f77bcf86cd799439017';

function mockImageFile(): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-bytes'),
    size: 10,
  } as Express.Multer.File;
}

describe('MediaService', () => {
  let service: MediaService;

  const uploadsService = {
    uploadFileWithKey: jest.fn(),
    removeObject: jest.fn(),
  };

  const configService = {
    getOrThrow: jest.fn().mockReturnValue('http://minio.test'),
  };

  const mediaModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn(),
  };

  const etablissementModel = {
    findById: jest.fn(),
  };

  const etablissementServiceModel = {
    findById: jest.fn(),
  };

  const paysModel = {
    exists: jest.fn(),
  };

  const villeModel = {
    exists: jest.fn(),
  };

  function execChain<T>(value: T) {
    return { exec: jest.fn().mockResolvedValue(value) };
  }

  function mockEtabExists(prestataireId: string) {
    etablissementModel.findById.mockReturnValue(
      execChain({
        _id: new Types.ObjectId(ETAB_ID),
        prestataire: new Types.ObjectId(prestataireId),
      }),
    );
  }

  function mockMediaDoc(overrides: Partial<Record<string, unknown>> = {}) {
    const _id = new Types.ObjectId(MEDIA_ID);
    const objectKey = 'media/presta/abc-photo.jpg';
    return {
      _id,
      url: `http://minio.test/app-bucket/${objectKey.split('/').map(encodeURIComponent).join('/')}`,
      objectKey,
      type: 'image',
      etablissementId: new Types.ObjectId(ETAB_ID),
      entityType: 'etablissement',
      entityId: new Types.ObjectId(ETAB_ID),
      prestataire: new Types.ObjectId(PRESTATAIRE_ID),
      deleteOne: jest.fn().mockResolvedValue({}),
      ...overrides,
    };
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    configService.getOrThrow.mockReturnValue('http://minio.test');
    uploadsService.uploadFileWithKey.mockResolvedValue({
      bucket: 'app-bucket',
      key: 'media/presta/abc-photo.jpg',
      size: 99,
    });
    uploadsService.removeObject.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: getModelToken(Media.name), useValue: mediaModel },
        {
          provide: getModelToken(Etablissement.name),
          useValue: etablissementModel,
        },
        {
          provide: getModelToken(EtablissementService.name),
          useValue: etablissementServiceModel,
        },
        { provide: getModelToken(Pays.name), useValue: paysModel },
        { provide: getModelToken(Ville.name), useValue: villeModel },
        { provide: UploadsService, useValue: uploadsService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMediaForEtablissement', () => {
    it('throws BadRequestException when id is invalid', async () => {
      await expect(service.findMediaForEtablissement('bad')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when establishment does not exist', async () => {
      etablissementModel.findById.mockReturnValue(execChain(null));

      await expect(
        service.findMediaForEtablissement(ETAB_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns media list when establishment exists', async () => {
      mockEtabExists(PRESTATAIRE_ID);
      const rows = [{ _id: new Types.ObjectId() }];
      mediaModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue(execChain(rows)),
      });

      const result = await service.findMediaForEtablissement(ETAB_ID);

      expect(mediaModel.find).toHaveBeenCalled();
      expect(result).toEqual(rows);
    });
  });

  describe('findMediaForEtablissementService', () => {
    it('throws when ligne établissement/service is missing', async () => {
      etablissementServiceModel.findById.mockReturnValue(execChain(null));

      await expect(
        service.findMediaForEtablissementService(ES_ROW_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns list when row exists', async () => {
      etablissementServiceModel.findById.mockReturnValue(
        execChain({ _id: new Types.ObjectId(ES_ROW_ID) }),
      );
      const rows: unknown[] = [];
      mediaModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue(execChain(rows)),
      });

      const result = await service.findMediaForEtablissementService(ES_ROW_ID);

      expect(result).toEqual(rows);
    });
  });

  describe('upload', () => {
    it('throws when file is missing', async () => {
      await expect(
        service.upload(undefined, { etablissementId: ETAB_ID }, PRESTATAIRE_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when both etablissementId and etablissementServiceId are set', async () => {
      await expect(
        service.upload(
          mockImageFile(),
          { etablissementId: ETAB_ID, etablissementServiceId: ES_ROW_ID },
          PRESTATAIRE_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when MIME type is not image or video', async () => {
      mockEtabExists(PRESTATAIRE_ID);
      const file = {
        ...mockImageFile(),
        mimetype: 'application/pdf',
      };

      await expect(
        service.upload(file, { etablissementId: ETAB_ID }, PRESTATAIRE_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('calls UploadsService then saves metadata for establishment parent', async () => {
      mockEtabExists(PRESTATAIRE_ID);
      const created = mockMediaDoc();
      mediaModel.create.mockResolvedValue(created);

      const result = await service.upload(
        mockImageFile(),
        { etablissementId: ETAB_ID },
        PRESTATAIRE_ID,
      );

      expect(uploadsService.uploadFileWithKey).toHaveBeenCalled();
      expect(mediaModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'image',
          etablissementId: new Types.ObjectId(ETAB_ID),
          entityType: 'etablissement',
          bucket: 'app-bucket',
          objectKey: 'media/presta/abc-photo.jpg',
          prestataire: new Types.ObjectId(PRESTATAIRE_ID),
        }),
      );
      expect(result.url).toContain('http://minio.test');
      expect(result).toEqual(created);
    });

    it('validates country exists for geo upload (no MinIO if country missing)', async () => {
      paysModel.exists.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.upload(
          mockImageFile(),
          { entityType: 'country', entityId: COUNTRY_ID },
          PRESTATAIRE_ID,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(uploadsService.uploadFileWithKey).not.toHaveBeenCalled();
    });

    it('forbids upload when establishment belongs to another prestataire', async () => {
      etablissementModel.findById.mockReturnValue(
        execChain({
          _id: new Types.ObjectId(ETAB_ID),
          prestataire: new Types.ObjectId(OTHER_PRESTATAIRE_ID),
        }),
      );

      await expect(
        service.upload(
          mockImageFile(),
          { etablissementId: ETAB_ID },
          PRESTATAIRE_ID,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(uploadsService.uploadFileWithKey).not.toHaveBeenCalled();
    });
  });

  describe('findAll (prestataire list)', () => {
    it('throws when both filters are provided', async () => {
      const q: ListMediaQueryDto = {
        etablissementId: ETAB_ID,
        etablissementServiceId: ES_ROW_ID,
      };
      await expect(
        service.findAll(PRESTATAIRE_ID, q),
      ).rejects.toThrow(BadRequestException);
    });

    it('returns media for prestataire with optional establishment filter', async () => {
      mockEtabExists(PRESTATAIRE_ID);
      const rows = [mockMediaDoc()];
      mediaModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue(execChain(rows)),
      });

      const result = await service.findAll(PRESTATAIRE_ID, {
        etablissementId: ETAB_ID,
      });

      expect(result).toEqual(rows);
      expect(mediaModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          prestataire: new Types.ObjectId(PRESTATAIRE_ID),
        }),
      );
    });

    it('forbids findAll filtered by another prestataire establishment', async () => {
      etablissementModel.findById.mockReturnValue(
        execChain({
          prestataire: new Types.ObjectId(OTHER_PRESTATAIRE_ID),
        }),
      );

      await expect(
        service.findAll(PRESTATAIRE_ID, { etablissementId: ETAB_ID }),
      ).rejects.toThrow(ForbiddenException);
      expect(mediaModel.find).not.toHaveBeenCalled();
    });
  });

  /** Propriété : `assertPrestataireOwnsEtablissement` / ligne service → Forbidden si mauvais JWT. */
  describe('Provider ownership (media linked to establishment)', () => {
    describe('findOne', () => {
      it('throws NotFoundException when media does not exist', async () => {
        mediaModel.findById.mockReturnValue(execChain(null));

        await expect(
          service.findOne(MEDIA_ID, PRESTATAIRE_ID),
        ).rejects.toThrow(NotFoundException);
      });

      it('throws ForbiddenException when prestataire does not own establishment', async () => {
        const doc = mockMediaDoc();
        mediaModel.findById.mockReturnValue(execChain(doc));
        etablissementModel.findById.mockReturnValue(
          execChain({
            prestataire: new Types.ObjectId(OTHER_PRESTATAIRE_ID),
          }),
        );

        await expect(
          service.findOne(MEDIA_ID, PRESTATAIRE_ID),
        ).rejects.toThrow(ForbiddenException);
      });

      it('returns document when prestataire owns linked establishment', async () => {
        const doc = mockMediaDoc();
        mediaModel.findById.mockReturnValue(execChain(doc));
        mockEtabExists(PRESTATAIRE_ID);

        const result = await service.findOne(MEDIA_ID, PRESTATAIRE_ID);

        expect(result).toBe(doc);
      });
    });

    describe('remove', () => {
      it('removes object in storage then deletes DB row', async () => {
        const doc = mockMediaDoc();
        mediaModel.findById.mockReturnValue(execChain(doc));
        mockEtabExists(PRESTATAIRE_ID);

        const result = await service.remove(MEDIA_ID, PRESTATAIRE_ID);

        expect(uploadsService.removeObject).toHaveBeenCalledWith(doc.objectKey);
        expect(doc.deleteOne).toHaveBeenCalled();
        expect(result).toEqual({ deleted: true, id: MEDIA_ID });
      });

      it('still deletes DB row if MinIO removeObject fails', async () => {
        const doc = mockMediaDoc();
        mediaModel.findById.mockReturnValue(execChain(doc));
        mockEtabExists(PRESTATAIRE_ID);
        uploadsService.removeObject.mockRejectedValue(new Error('no such key'));

        await service.remove(MEDIA_ID, PRESTATAIRE_ID);

        expect(doc.deleteOne).toHaveBeenCalled();
      });
    });
  });

  describe('setPrimary', () => {
    it('updates primary flags for an image linked to establishment', async () => {
      const doc = mockMediaDoc({ type: 'image' });
      mediaModel.findById
        .mockReturnValueOnce(execChain(doc))
        .mockReturnValueOnce(
          execChain({ ...doc, isPrimary: true }),
        );
      mockEtabExists(PRESTATAIRE_ID);
      mediaModel.updateMany.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });
      mediaModel.updateOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });

      const result = await service.setPrimary(MEDIA_ID, PRESTATAIRE_ID);

      expect(mediaModel.updateMany).toHaveBeenCalled();
      expect(mediaModel.updateOne).toHaveBeenCalled();
      expect(result.isPrimary).toBe(true);
    });
  });
});
