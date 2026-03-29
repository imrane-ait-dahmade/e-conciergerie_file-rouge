import { PartialType } from '@nestjs/swagger';
import { StoreSliderRequest } from './store-slider.request';

/**
 * PATCH/PUT /sliders/:id — tous les champs optionnels.
 * L’ordre des dates (ends_at >= starts_at) est vérifié dans le service après fusion avec l’existant.
 */
export class UpdateSliderRequest extends PartialType(StoreSliderRequest) {}
