import {
  FileCheck,
  Truck,
  Globe,
  Factory,
  Link2,
  Headphones,
  type LucideIcon,
} from "lucide-react";

const industryIconMap: Record<string, LucideIcon> = {
  customs: FileCheck,
  "cross-border-logistics": Truck,
  "cross-border-ecommerce": Globe,
  manufacturing: Factory,
  "supply-chain": Link2,
  "ecommerce-service": Headphones,
};

export function getIndustryIcon(slug: string): LucideIcon {
  return industryIconMap[slug] || Link2;
}
