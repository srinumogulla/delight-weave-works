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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PanchangSection />
        <UpcomingRituals />
        <HowItWorks />
        <WhyOnlinePooja />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
