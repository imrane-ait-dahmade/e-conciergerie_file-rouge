import { Types } from 'mongoose';

/**
 * Représentation API (Resource / Transformer) : snake_case + types simples pour le front.
 */
export interface SliderApiResource {
  id: string;
  title: string;
  description: string | null;
  picture: string;
  color: string | null;
  is_active: boolean;
  sort_order: number;
  button_text: string | null;
  button_link: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

type SliderDocLike = {
  _id: Types.ObjectId;
  title?: string;
  description?: string | null;
  picture?: string;
  color?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  buttonText?: string | null;
  buttonLink?: string | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

function toIso(d?: Date | null): string | null {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString();
}

export function formatSlider(doc: SliderDocLike): SliderApiResource {
  return {
    id: doc._id.toString(),
    title: doc.title ?? '',
    description: doc.description ?? null,
    picture: doc.picture ?? '',
    color: doc.color ?? null,
    is_active: doc.isActive ?? false,
    sort_order: doc.sortOrder ?? 0,
    button_text: doc.buttonText ?? null,
    button_link: doc.buttonLink ?? null,
    starts_at: toIso(doc.startsAt),
    ends_at: toIso(doc.endsAt),
    created_at: toIso(doc.createdAt),
    updated_at: toIso(doc.updatedAt),
  };
}
