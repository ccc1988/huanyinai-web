import {
  Ship,
  Package,
  Truck,
  ShoppingCart,
  Sofa,
  Pill,
  Link2,
  Zap,
} from "lucide-react";

/**
 * 匿名客户按行业匹配图标，避免在代码中保留客户实名。
 */
const customerIcons: Record<string, { icon: React.ElementType; color: string }> = {
  综合物流: { icon: Ship, color: "#6366F1" },
  供应链: { icon: Link2, color: "#8B5CF6" },
  跨境电商: { icon: ShoppingCart, color: "#22D3EE" },
  跨境物流: { icon: Truck, color: "#6366F1" },
  外贸制造: { icon: Sofa, color: "#8B5CF6" },
  制药: { icon: Pill, color: "#22D3EE" },
};

export function getCustomerIcon(industry: string) {
  return customerIcons[industry] || { icon: Package, color: "#6366F1" };
}
