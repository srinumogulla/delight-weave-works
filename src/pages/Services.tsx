import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { ServiceCard, Service } from "@/components/ServiceCard";
import { ServiceFilters, FilterState } from "@/components/ServiceFilters";
import { MobileServiceCard } from "@/components/mobile/MobileServiceCard";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { listPoojas } from "@/api/poojas";
import type { ApiPooja } from "@/api/types";

// Import ritual images as fallbacks
import ritualHomam from "@/assets/ritual-homam.jpg";
import ritualAbhishekam from "@/assets/ritual-abhishekam.jpg";
import ritualPooja from "@/assets/ritual-pooja.jpg";
import ritualLakshmi from "@/assets/ritual-lakshmi.jpg";
import ritualShanti from "@/assets/ritual-shanti.jpg";
import ritualVratam from "@/assets/ritual-vratam.jpg";

const fallbackImages: Record<string, string> = {
  'Homam': ritualHomam, 'Abhishekam': ritualAbhishekam, 'Pooja': ritualPooja,
  'Archana': ritualLakshmi, 'Shanti': ritualShanti, 'Vratam': ritualVratam,
};

function mapPoojaToService(p: ApiPooja): Service {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: p.price,
    duration: p.duration || '',
    category: p.category || 'Other',
    image: p.image_url || fallbackImages[p.category || ''] || ritualPooja,
    rating: 4.8,
    bookings: 0,
    temple: p.temple || '',
    featured: false,
  };
}

export default function Services() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [ritualType, setRitualType] = useState("all");
  const [filters, setFilters] = useState<FilterState>({ categories: [], priceRange: [0, 100000], temples: [] });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data: poojas = [], isLoading } = useQuery({
    queryKey: ['public-poojas'],
    queryFn: () => listPoojas(),
  });

  const servicesData = useMemo(() => (poojas as ApiPooja[]).map(mapPoojaToService), [poojas]);
  const allCategories = useMemo(() => [...new Set(servicesData.map(s => s.category))], [servicesData]);
  const allTemples = useMemo(() => [...new Set(servicesData.map(s => s.temple).filter(Boolean))], [servicesData]);
  const maxPrice = useMemo(() => Math.max(...servicesData.map(s => s.price), 100000), [servicesData]);

  const filteredServices = useMemo(() => {
    let result = [...servicesData];
    if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.temple.toLowerCase().includes(q)); }
    if (ritualType === "dashachara") result = result.filter(s => ["Homam", "Abhishekam", "Pooja", "Vratam"].includes(s.category));
    else if (ritualType === "vamachara") result = result.filter(s => ["Shanti"].includes(s.category));
    if (filters.categories.length > 0) result = result.filter(s => filters.categories.includes(s.category));
    result = result.filter(s => s.price >= filters.priceRange[0] && s.price <= filters.priceRange[1]);
    if (filters.temples.length > 0) result = result.filter(s => filters.temples.includes(s.temple));
    switch (sortBy) {
      case "popular": result.sort((a, b) => b.bookings - a.bookings); break;
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [searchQuery, filters, sortBy, ritualType, servicesData]);

  const handleBook = (service: Service) => { navigate(`/booking/${service.id}`); };

  const content = (
    <>
      <section className="relative py-8 md:py-24 bg-gradient-to-b from-primary/10 to-background overflow-hidden">
        <BackgroundPattern opacity={0.1} />
        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">Sacred <span className="text-primary">Pooja Services</span></h1>
            <p className="text-muted-foreground text-base md:text-lg">Explore our curated collection of authentic Vedic rituals performed by verified Purohits at sacred temples across India.</p>
          </div>
        </div>
      </section>

      <section className="py-2 md:py-4">
        <div className="container">
          <Tabs value={ritualType} onValueChange={setRitualType} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
              <TabsTrigger value="all">All Poojas</TabsTrigger>
              <TabsTrigger value="dashachara">Dashachara</TabsTrigger>
              <TabsTrigger value="vamachara">Vamachara</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      <section className="py-4 md:py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 mb-6 md:mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search poojas, temples..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {!isMobile && (
              <div className="lg:w-64 flex-shrink-0">
                <ServiceFilters filters={filters} onFiltersChange={setFilters} categories={allCategories} temples={allTemples} maxPrice={maxPrice} />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">Showing {filteredServices.length} services</p>
              {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
                </div>
              ) : filteredServices.length > 0 ? (
                isMobile ? (
                  <div className="space-y-4">{filteredServices.map(service => <MobileServiceCard key={service.id} id={service.id} name={service.name} description={service.description} price={service.price} duration={service.duration} category={service.category} imageUrl={service.image} rating={service.rating} />)}</div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">{filteredServices.map(service => <ServiceCard key={service.id} service={service} onBook={handleBook} />)}</div>
                )
              ) : (
                <div className="text-center py-16"><p className="text-muted-foreground text-lg mb-2">No services found</p><p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p></div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );

  if (isMobile) return <MobileLayout title="Poojas" showSearch>{content}</MobileLayout>;

  return (
    <div className="min-h-screen bg-background">
      <Header />{content}<Footer /><WhatsAppButton />
    </div>
  );
}
