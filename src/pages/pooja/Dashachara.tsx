import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { PoojaListingCard } from "@/components/PoojaListingCard";
import { PoojaFilters } from "@/components/PoojaFilters";
import { HowItWorksTimeline } from "@/components/HowItWorksTimeline";
import { supabase } from "@/lib/supabase";
import { Video, Package, Shield, Headphones } from "lucide-react";

const features = [
  { icon: Video, title: "Live Updates & Recordings", description: "Watch rituals live or receive recordings" },
  { icon: Package, title: "Prasadam Dispatch Tracking", description: "Track your blessed prasadam delivery" },
  { icon: Shield, title: "Vetted Temples & Gurus", description: "All priests are temple-verified" },
  { icon: Headphones, title: "Concierge-Managed Experience", description: "Full support from booking to completion" },
];

const Dashachara = () => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["dashachara-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pooja_services")
        .select("*")
        .eq("is_active", true)
        .eq("ritual_type", "dashachara")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      !searchQuery ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.guru_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "dosha" && service.category?.toLowerCase().includes("dosha")) ||
      (typeFilter === "general" && !service.category?.toLowerCase().includes("dosha"));

    return matchesSearch && matchesType;
  });

  const uniqueGurus = [...new Set(services.map((s) => s.guru_name).filter(Boolean))] as string[];

  const content = (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-16 md:py-24">
        <BackgroundPattern opacity={0.1} />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
              Dashachara Rituals
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Concierge Managed <span className="text-primary">Poojas</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Book a pooja that meets you where you are. Verified priests, transparent scheduling, 
              livestreams when available, and prasadam shipped safely. Share your sankalpa and we 
              orchestrate the rest.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground hidden md:block">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              How Dashachara Poojas <span className="text-primary">Work</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <HowItWorksTimeline variant="detailed" />
          </div>
        </div>
      </section>

      {/* Filters & Listings */}
      <section className="py-16 bg-muted">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              Browse <span className="text-primary">Dashachara</span> Poojas
            </h2>
          </div>

          <PoojaFilters
            onSearch={setSearchQuery}
            onFilterType={setTypeFilter}
            gurus={uniqueGurus}
          />

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No poojas found matching your criteria.</p>
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
                  ritualType="dashachara"
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

export default Dashachara;