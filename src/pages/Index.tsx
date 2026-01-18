import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { PanchangSection } from "@/components/PanchangSection";
import { UpcomingRituals } from "@/components/UpcomingRituals";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyOnlinePooja } from "@/components/WhyOnlinePooja";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { TempleGateIntro } from "@/components/TempleGateIntro";
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
