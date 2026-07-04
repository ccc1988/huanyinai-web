import Hero from "@/components/home/Hero";
import ClientLogos from "@/components/home/ClientLogos";
import CapabilityMatrix from "@/components/home/CapabilityMatrix";
import IndustryTabs from "@/components/home/IndustryTabs";
import CaseHighlights from "@/components/home/CaseHighlights";
import StatsWall from "@/components/home/StatsWall";
import FinalCTA from "@/components/home/FinalCTA";
import { customers, industries, stats } from "@/lib/data";

// 强制动态渲染，确保后台修改即时生效
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ClientLogos customers={customers} />
      <CapabilityMatrix />
      <IndustryTabs industries={industries} />
      <CaseHighlights />
      <StatsWall stats={stats} />
      <FinalCTA />
    </>
  );
}
