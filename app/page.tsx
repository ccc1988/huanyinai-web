import nextDynamic from "next/dynamic";
import Hero from "@/components/home/Hero";
import { getCustomers, getIndustries, getStats } from "@/lib/data";

// 强制动态渲染，确保后台修改即时生效
export const dynamic = "force-dynamic";

// 首屏以下组件懒加载，减小首包体积，加速 Hero 渲染
const ClientLogos = nextDynamic(() => import("@/components/home/ClientLogos"));
const CapabilityMatrix = nextDynamic(() => import("@/components/home/CapabilityMatrix"));
const IndustryTabs = nextDynamic(() => import("@/components/home/IndustryTabs"));
const CaseHighlights = nextDynamic(() => import("@/components/home/CaseHighlights"));
const StatsWall = nextDynamic(() => import("@/components/home/StatsWall"));
const FinalCTA = nextDynamic(() => import("@/components/home/FinalCTA"));

export default function HomePage() {
  const customers = getCustomers();
  const industries = getIndustries();
  const stats = getStats();
  return (
    <>
      <Hero stats={stats} />
      <ClientLogos customers={customers} />
      <CapabilityMatrix />
      <IndustryTabs industries={industries} />
      <CaseHighlights />
      <StatsWall stats={stats} />
      <FinalCTA />
    </>
  );
}

