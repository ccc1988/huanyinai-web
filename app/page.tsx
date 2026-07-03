import Hero from "@/components/home/Hero";
import ClientLogos from "@/components/home/ClientLogos";
import CapabilityMatrix from "@/components/home/CapabilityMatrix";
import IndustryTabs from "@/components/home/IndustryTabs";
import CaseHighlights from "@/components/home/CaseHighlights";
import StatsWall from "@/components/home/StatsWall";
import FinalCTA from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ClientLogos />
      <CapabilityMatrix />
      <IndustryTabs />
      <CaseHighlights />
      <StatsWall />
      <FinalCTA />
    </>
  );
}
