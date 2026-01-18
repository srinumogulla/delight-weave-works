import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { CorePrinciplesSection } from "@/components/CorePrinciplesSection";
import { Target, Eye, Compass, Users } from "lucide-react";

const visionPoints = [
  "Preserve sacred traditions with reverence while sharing them in accessible and inclusive ways.",
  "Uphold dignity for both gurus and seekers through transparency, trust, and ethical conduct.",
  "Use modern platforms responsibly to expand access without diluting spiritual depth or authenticity.",
  "Create a trusted ecosystem where timeless wisdom can guide, heal, and uplift future generations.",
];

const About = () => {
  const isMobile = useIsMobile();

  const content = (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-16 md:py-24">
        <BackgroundPattern opacity={0.1} />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
              <Users className="h-4 w-4" />
              About Us
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="text-primary">VedhaMantra</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              VedhaMantra is a digital spiritual platform connecting seekers with authentic gurus, 
              rituals, and sacred practices—honoring tradition while enabling modern access.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Our <span className="text-primary">Mission</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We build a trusted bridge between ancient wisdom and today's seekers, 
              ensuring authenticity, dignity, and accessibility at every step.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <CorePrinciplesSection />

      {/* Vision Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <Compass className="h-8 w-8 text-accent-foreground" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
                Our <span className="text-primary">Vision</span>
              </h2>
              <p className="text-xl text-muted-foreground font-medium">
                Roots, Reverence, and Reach
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border">
              <p className="text-lg text-foreground mb-6 font-medium">
                VedhaMantra exists to:
              </p>
              <ul className="space-y-4">
                {visionPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* For Gurus & Seekers */}
      <section className="py-16 bg-muted">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Gurus */}
            <div className="bg-card p-8 rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                <span className="text-2xl">🙏</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                For Gurus
              </h3>
              <p className="text-muted-foreground mb-4">
                Join our network of verified spiritual guides. Share your knowledge 
                and blessings with seekers worldwide while maintaining the sanctity 
                of traditional practices.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Reach devotees globally</li>
                <li>• Maintain ritual authenticity</li>
                <li>• Fair and transparent compensation</li>
                <li>• Technical support for livestreaming</li>
              </ul>
            </div>

            {/* For Seekers */}
            <div className="bg-card p-8 rounded-2xl border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground mb-4">
                For Seekers
              </h3>
              <p className="text-muted-foreground mb-4">
                Access authentic spiritual experiences from anywhere in the world. 
                Connect with verified gurus and participate in sacred rituals with 
                complete transparency.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Verified priests and temples</li>
                <li>• Live streaming of rituals</li>
                <li>• Prasadam delivered to your door</li>
                <li>• Personalized sankalpa for your family</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout showHeader={true}>
        {content}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>{content}</main>
      <Footer />
    </div>
  );
};

export default About;