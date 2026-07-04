import {
  FileText,
  ShoppingCart,
  Truck,
  Bot,
  Workflow,
  Database,
  Package,
  Stamp,
  Table,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

/**
 * 案例 slug → 图标/颜色/模式映射
 * 用于案例卡片头部的可视化展示
 */
const caseVisualMap: Record<
  string,
  { icon: LucideIcon; gradient: string; pattern: string }
> = {
  "customs-document-ai": {
    icon: FileText,
    gradient: "from-[#6366F1]/20 to-transparent",
    pattern: "document",
  },
  "cross-border-logistics-ai": {
    icon: Package,
    gradient: "from-[#8B5CF6]/20 to-transparent",
    pattern: "flow",
  },
  "ecommerce-ai-production": {
    icon: ShoppingCart,
    gradient: "from-[#6366F1]/20 to-transparent",
    pattern: "production",
  },
  "ecommerce-ai-service-rpa": {
    icon: Bot,
    gradient: "from-[#8B5CF6]/20 to-transparent",
    pattern: "chat",
  },
  "logistics-tracking-ai": {
    icon: Truck,
    gradient: "from-[#6366F1]/20 to-transparent",
    pattern: "tracking",
  },
  "logistics-wecom-ai": {
    icon: Bot,
    gradient: "from-[#8B5CF6]/20 to-transparent",
    pattern: "chat",
  },
  "rpa-data-entry": {
    icon: Table,
    gradient: "from-[#6366F1]/20 to-transparent",
    pattern: "table",
  },
  "rpa-template-conversion": {
    icon: Workflow,
    gradient: "from-[#8B5CF6]/20 to-transparent",
    pattern: "flow",
  },
  "rpa-customs-sorting": {
    icon: FileText,
    gradient: "from-[#6366F1]/20 to-transparent",
    pattern: "document",
  },
  "rpa-e-stamp": {
    icon: Stamp,
    gradient: "from-[#8B5CF6]/20 to-transparent",
    pattern: "stamp",
  },
  "anker-data-platform": {
    icon: BarChart3,
    gradient: "from-[#6366F1]/20 to-transparent",
    pattern: "dashboard",
  },
};

export function getCaseVisual(slug: string) {
  return caseVisualMap[slug] || { icon: Database, gradient: "from-[#6366F1]/20 to-transparent", pattern: "default" };
}
