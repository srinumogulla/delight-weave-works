import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { PoojaListingCard } from "@/components/PoojaListingCard";
import { HowItWorksTimeline } from "@/components/HowItWorksTimeline";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Search, Flame, Moon, Shield, Skull, Star } from "lucide-react";

// Vamachara-specific decorative component
const TantricSymbol = ({ className = "" }: { className?: string }) => (
  <div className={`absolute opacity-10 ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-red-500">
      <polygon points="50,5 95,95 5,95" strokeWidth="2" fill="none" stroke="currentColor"/>
      <polygon points="50,95 5,5 95,5" strokeWidth="2" fill="none" stroke="currentColor" style={{ transform: 'rotate(180deg)', transformOrigin: 'center' }}/>
    </svg>
  </div>
);

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
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1a0a0a] to-[#0d0d0d]">
      {/* Hero Section - Dark Mystical Theme */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-950/20 via-transparent to-transparent" />
        
        {/* Animated flame particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-500/60 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-500/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-red-600/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-purple-500/50 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Decorative tantric symbols */}
        <TantricSymbol className="w-32 h-32 top-10 left-10 rotate-12" />
        <TantricSymbol className="w-24 h-24 bottom-20 right-16 -rotate-12" />
        
        {/* Border flames effect */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-red-900/20 to-transparent" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/60 border border-red-800/50 text-red-300 text-sm font-medium mb-6 backdrop-blur-sm">
              <Flame className="h-4 w-4 text-red-400 animate-pulse" />
              🔱 Tantric Vamachara Rituals
            </div>
            
            {/* Main Heading */}
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Shakti</span>{" "}
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
                Sadhana
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-400 mb-8 leading-relaxed">
              Experience the <span className="text-red-400 font-medium">transformative power</span> of left-hand path rituals.
              Performed with strict scriptural discipline by verified gurus at sacred tantric temples.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Shield, text: "Verified Gurus" },
                { icon: Moon, text: "Night Rituals" },
                { icon: Star, text: "Sacred Mantras" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-red-900/30 text-gray-300 text-xs font-medium"
                >
                  <item.icon className="h-3.5 w-3.5 text-red-400" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Dark Theme */}
      <section className="py-16 bg-gradient-to-b from-[#0d0d0d] to-[#1a0a0a] border-y border-red-900/20">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/40 text-red-300 text-xs font-medium mb-4">
              <Skull className="h-3 w-3" />
              The Sacred Process
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              How It <span className="text-red-400">Works</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Each Vamachara ritual follows ancient tantric traditions with precise invocations
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <HowItWorksTimeline variant="simple" />
          </div>
        </div>
      </section>

      {/* Search & Listings - Dark Theme */}
      <section className="py-16 bg-gradient-to-b from-[#1a0a0a] to-black">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Browse <span className="text-red-400">Vamachara</span> Rituals
            </h2>
            <p className="text-gray-500">
              Powerful tantric rituals for protection, transformation, and spiritual awakening
            </p>
          </div>

          {/* Search - Dark Theme */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-400/60" />
              <Input
                placeholder="Search (Kali, Bhairava, Chamunda, Shakti...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-black/60 border-red-900/30 text-white placeholder:text-gray-600 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-red-950/20 rounded-xl h-96 animate-pulse border border-red-900/20" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-950/30 flex items-center justify-center">
                <Flame className="h-10 w-10 text-red-400/60" />
              </div>
              <p className="text-gray-400 text-lg">
                {services.length === 0 
                  ? "Vamachara rituals coming soon. The sacred fire awaits."
                  : "No rituals found matching your search."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div key={service.id} className="group">
                  <div className="relative rounded-2xl overflow-hidden border border-red-900/30 bg-gradient-to-b from-red-950/30 to-black/60 hover:border-red-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20">
                    <PoojaListingCard
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA - Dark Theme */}
      <section className="py-16 bg-black border-t border-red-900/20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-900/40 to-red-950/40 flex items-center justify-center border border-red-800/30">
              <span className="text-3xl">🔱</span>
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
              Embrace the <span className="text-red-400">Sacred Path</span>
            </h3>
            <p className="text-gray-500 mb-6">
              All rituals are performed by verified tantric gurus following authentic Agama scriptures.
              Strict confidentiality and spiritual guidance assured.
            </p>
            <p className="text-xs text-gray-600">
              🕉️ Om Aim Hreem Kleem Chamundaye Vichche 🕉️
            </p>
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
    <div className="min-h-screen bg-black">
      <Header />
      <main>{content}</main>
      <Footer />
    </div>
  );
};

export default Vamachara;
