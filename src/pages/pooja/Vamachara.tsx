import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { PoojaListingCard } from "@/components/PoojaListingCard";
import { HowItWorksTimeline } from "@/components/HowItWorksTimeline";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Vamachara = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["vamachara-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pooja_services")
        .select("*")
        .eq("is_active", true)
        .eq("ritual_type", "vamachara")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredServices = services.filter((service) => {
    return (
      !searchQuery ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const content = (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-16 md:py-24">
        <BackgroundPattern opacity={0.1} />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon/5 to-transparent" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
              🕉️ Vamachara Rituals
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Vamachara <span className="text-primary">Rituals</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore powerful Vamachara rituals performed with strict scriptural discipline 
              by verified gurus and temples.
            </p>
          </div>
        </div>
      </section>

      {/* Simplified How It Works */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <HowItWorksTimeline variant="simple" />
          </div>
        </div>
      </section>

      {/* Search & Listings */}
      <section className="py-16 bg-muted">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              Browse <span className="text-primary">Vamachara</span> Poojas
            </h2>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name (Kali, Bhairava, Shakti...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {services.length === 0 
                  ? "Vamachara rituals coming soon. Check back later."
                  : "No poojas found matching your search."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <PoojaListingCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  description={service.description || undefined}
                  category={service.category || undefined}
                  ritualType="vamachara"
                  guruName={service.guru_name || undefined}
                  scheduledDate={service.scheduled_date || undefined}
                  scheduledTime={service.scheduled_time || undefined}
                  price={Number(service.price)}
                  imageUrl={service.image_url || undefined}
                  temple={service.temple || undefined}
                />
              ))}
            </div>
          )}
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

export default Vamachara;