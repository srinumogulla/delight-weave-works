import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { PanchangSection } from "@/components/panchang/PanchangSection";
import { UpcomingRituals } from "@/components/home/UpcomingRituals";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyOnlinePooja } from "@/components/home/WhyOnlinePooja";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { Footer } from "@/components/layout/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { TempleGateIntro } from "@/components/home/TempleGateIntro";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();

  const content = (
    <>
      <HeroSection />
      <FeaturesSection />
      <PanchangSection />
      <UpcomingRituals />
      <HowItWorks />
      <WhyOnlinePooja />
      <Testimonials />
      <FAQ />
    </>
  );

  if (isMobile) {
    return (
      <TempleGateIntro>
        <MobileLayout showHeader={true}>
          <main>
            {content}
          </main>
        </MobileLayout>
      </TempleGateIntro>
    );
  }

  return (
    <TempleGateIntro>
      <div className="min-h-screen">
        <Header />
        <main>
          {content}
        </main>
        <Footer />
      </div>
    </TempleGateIntro>
  );
};

export default Index;
