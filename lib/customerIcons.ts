import {
  Ship,
  Package,
  Globe,
  Truck,
  ShoppingCart,
  Sofa,
  Pill,
  Link2,
  Plane,
  Zap,
} from "lucide-react";

/**
 * 客户品牌图标映射
 * 根据客户行业匹配 Lucide 图标，统一暗色科技风
 */
const customerIcons: Record<string, { icon: React.ElementType; color: string }> = {
  海格物流股份: { icon: Ship, color: "#6366F1" },
  达九州供应链: { icon: Package, color: "#8B5CF6" },
  三陌跨境: { icon: Globe, color: "#6366F1" },
  启航跨境物流: { icon: Truck, color: "#8B5CF6" },
  三洋电商: { icon: ShoppingCart, color: "#6366F1" },
  佰瑞纳家具: { icon: Sofa, color: "#8B5CF6" },
  万汉制药: { icon: Pill, color: "#6366F1" },
  海纳供应链: { icon: Link2, color: "#8B5CF6" },
  翱航供应链: { icon: Plane, color: "#6366F1" },
  Anker: { icon: Zap, color: "#8B5CF6" },
};

export function getCustomerIcon(name: string) {
  return customerIcons[name] || { icon: Zap, color: "#6366F1" };
}
