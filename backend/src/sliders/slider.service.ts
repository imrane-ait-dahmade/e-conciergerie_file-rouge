import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { apiListSuccess, apiSuccess } from './slider-api-response';
import { formatSlider } from './slider.resource';
import { ListSlidersQueryRequest } from './requests/list-sliders-query.request';
import { StoreSliderRequest } from './requests/store-slider.request';
import { UpdateSliderRequest } from './requests/update-slider.request';
import { Slider, SliderDocument } from './schemas/slider.schema';

@Injectable()
export class SliderService {
  constructor(
    @InjectModel(Slider.name)
    private readonly sliderModel: Model<SliderDocument>,
  ) {}

  private assertObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant slider invalide');
    }
  }

  /** Règle métier : si les deux bornes sont définies, ends >= starts. */
  private assertDateOrder(
    starts?: Date | null,
    ends?: Date | null,
  ): void {
    if (starts && ends && ends.getTime() < starts.getTime()) {
      throw new BadRequestException(
        'ends_at doit être postérieur ou égal à starts_at',
      );
    }
  }

  async findAllPaginated(query?: ListSlidersQueryRequest) {
    const page = query?.page != null && query.page > 0 ? query.page : 1;
    const limit = Math.min(
      query?.limit != null && query.limit > 0 ? query.limit : 20,
      100,
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (query?.is_active === true || query?.is_active === false) {
      filter.isActive = query.is_active;
    }
    if (query?.search?.trim()) {
      filter.title = {
        $regex: escapeRegex(query.search.trim()),
        $options: 'i',
      };
    }

    const [raw, total] = await Promise.all([
      this.sliderModel
        .find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.sliderModel.countDocuments(filter).exec(),
    ]);

    const data = raw.map((d) => formatSlider(d));
    const total_pages = total === 0 ? 0 : Math.ceil(total / limit);

    return apiListSuccess('Sliders fetched successfully', data, {
      page,
      limit,
      total,
      total_pages,
    });
  }

  async findOne(id: string) {
    this.assertObjectId(id);
    const doc = await this.sliderModel.findById(id).lean().exec();
    if (!doc) {
      throw new NotFoundException('Slider introuvable');
    }
    return apiSuccess('Slider fetched successfully', formatSlider(doc));
  }

  async create(dto: StoreSliderRequest) {
    this.assertDateOrder(dto.starts_at, dto.ends_at);
    const payload = this.mapStoreToDoc(dto);
    const created = await this.sliderModel.create(payload);
    return apiSuccess(
      'Slider created successfully',
      formatSlider(created.toObject()),
    );
  }

  async update(id: string, dto: UpdateSliderRequest) {
    this.assertObjectId(id);
    const existing = await this.sliderModel.findById(id).lean().exec();
    if (!existing) {
      throw new NotFoundException('Slider introuvable');
    }

    const mergedStarts =
      dto.starts_at !== undefined ? dto.starts_at : existing.startsAt;
    const mergedEnds = dto.ends_at !== undefined ? dto.ends_at : existing.endsAt;
    this.assertDateOrder(mergedStarts, mergedEnds);

    const patch = this.mapUpdateToDoc(dto);
    if (Object.keys(patch).length === 0) {
      return apiSuccess('Slider updated successfully', formatSlider(existing));
    }

    const updated = await this.sliderModel
      .findByIdAndUpdate(id, { $set: patch }, { new: true })
      .lean()
      .exec();

    return apiSuccess('Slider updated successfully', formatSlider(updated!));
  }

  async remove(id: string) {
    this.assertObjectId(id);
    const removed = await this.sliderModel.findByIdAndDelete(id).lean().exec();
    if (!removed) {
      throw new NotFoundException('Slider introuvable');
    }
    return apiSuccess('Slider deleted successfully', formatSlider(removed));
  }

  getModel(): Model<SliderDocument> {
    return this.sliderModel;
  }

  private mapStoreToDoc(dto: StoreSliderRequest): Record<string, unknown> {
    return {
      title: dto.title.trim(),
      description:
        dto.description === undefined || dto.description === null
          ? undefined
          : dto.description,
      picture: dto.picture.trim(),
      color:
        dto.color === undefined || dto.color === null
          ? undefined
          : dto.color,
      isActive: dto.is_active ?? true,
      sortOrder: dto.sort_order ?? 0,
      buttonText:
        dto.button_text === undefined || dto.button_text === null
          ? undefined
          : dto.button_text,
      buttonLink:
        dto.button_link === undefined || dto.button_link === null
          ? undefined
          : dto.button_link,
      startsAt:
        dto.starts_at === undefined || dto.starts_at === null
          ? undefined
          : dto.starts_at,
      endsAt:
        dto.ends_at === undefined || dto.ends_at === null
          ? undefined
          : dto.ends_at,
    };
  }

  private mapUpdateToDoc(dto: UpdateSliderRequest): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    if (dto.title !== undefined) {
      out.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      out.description = dto.description;
    }
    if (dto.picture !== undefined) {
      out.picture = dto.picture.trim();
    }
    if (dto.color !== undefined) {
      out.color = dto.color;
    }
    if (dto.is_active !== undefined) {
      out.isActive = dto.is_active;
    }
    if (dto.sort_order !== undefined) {
      out.sortOrder = dto.sort_order;
    }
    if (dto.button_text !== undefined) {
      out.buttonText = dto.button_text;
    }
    if (dto.button_link !== undefined) {
      out.buttonLink = dto.button_link;
    }
    if (dto.starts_at !== undefined) {
      out.startsAt = dto.starts_at;
    }
    if (dto.ends_at !== undefined) {
      out.endsAt = dto.ends_at;
    }
    return out;
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
