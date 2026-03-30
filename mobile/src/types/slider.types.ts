/**
 * DTO brut renvoyé par GET /mobile/hero/sliders (Nest `SliderApiResource`).
 * Mapping vers l’UI : **`src/mappers/sliderToHero.mapper.ts`** → `HeroItem`.
 */
export type SliderApiItem = {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
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
};

export type MobileHeroSlidersResponse = {
  success: boolean;
  message: string;
  data: SliderApiItem[];
};
