import {
  BedDouble,
  BriefcaseBusiness,
  Building2,
  Camera,
  Coffee,
  ConciergeBell,
  MapPin,
  Monitor,
  Phone,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  UtensilsCrossed,
  Waves,
  Wifi,
  type LucideProps,
} from "lucide-react";

const icons = {
  bed: BedDouble,
  breakfast: Coffee,
  business: BriefcaseBusiness,
  camera: Camera,
  concierge: ConciergeBell,
  hotel: Building2,
  location: MapPin,
  monitor: Monitor,
  phone: Phone,
  restaurant: UtensilsCrossed,
  sparkles: Sparkles,
  star: Star,
  store: Store,
  shopping: ShoppingBag,
  pool: Waves,
  wifi: Wifi,
};

type TemplateIconName = keyof typeof icons;

export function TemplateIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[(name as TemplateIconName) || "sparkles"] || Sparkles;
  return <Icon {...props} />;
}
