import type { LucideIcon } from "lucide-react";
import {
  Bath,
  Bed,
  Building,
  Car,
  CarFront,
  ChefHat,
  Coffee,
  Dumbbell,
  Home,
  Hotel,
  LayoutGrid,
  Map,
  Music,
  ParkingCircle,
  Plane,
  PlaneLanding,
  ShieldCheck,
  Snowflake,
  Ticket,
  Utensils,
  Waves,
  Wifi,
} from "lucide-react";

/**
 * Prévisualisation admin : clés alignées sur les presets (`admin-icon-presets`) et le mapping mobile Ionicons.
 */
const ADMIN_ICON_LUCIDE: Record<string, LucideIcon> = {
  bed: Bed,
  plane: Plane,
  "plane-landing": PlaneLanding,
  car: Car,
  utensils: Utensils,
  map: Map,
  building: Building,
  hotel: Hotel,
  home: Home,
  "chef-hat": ChefHat,
  "car-front": CarFront,
  ticket: Ticket,
  music: Music,
  wifi: Wifi,
  "parking-circle": ParkingCircle,
  "shield-check": ShieldCheck,
  snowflake: Snowflake,
  bath: Bath,
  coffee: Coffee,
  dumbbell: Dumbbell,
  waves: Waves,
};

export function getLucideForAdminIconKey(key: string): LucideIcon {
  const k = key.trim().toLowerCase();
  return ADMIN_ICON_LUCIDE[k] ?? LayoutGrid;
}
