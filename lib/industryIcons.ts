import {
  FileCheck,
  Truck,
  Globe,
  Factory,
  Link2,
  Headphones,
  Search,
  type LucideIcon,
} from "lucide-react";

const industryIconMap: Record<string, LucideIcon> = {
  customs: FileCheck,
  "cross-border-logistics": Truck,
  "cross-border-ecommerce": Globe,
  manufacturing: Factory,
  "supply-chain": Link2,
  "ecommerce-service": Headphones,
  "ai-geo-aeo": Search,
};

export function getIndustryIcon(slug: string): LucideIcon {
  return industryIconMap[slug] || Link2;
}
