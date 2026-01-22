import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Import ritual images
import ritualHomam from "@/assets/ritual-homam.jpg";
import ritualAbhishekam from "@/assets/ritual-abhishekam.jpg";
import ritualPooja from "@/assets/ritual-pooja.jpg";
import ritualLakshmi from "@/assets/ritual-lakshmi.jpg";
import ritualShanti from "@/assets/ritual-shanti.jpg";
import ritualVratam from "@/assets/ritual-vratam.jpg";

// Sample services data
const servicesData: Service[] = [
  {
    id: "1",
    name: "Ganapathi Homam",
    description: "Invoke Lord Ganesha's blessings for new beginnings, obstacle removal, and success in all endeavors.",
    price: 2500,
    duration: "2 hours",
    category: "Homam",
    image: ritualHomam,
    rating: 4.9,
    bookings: 1250,
    temple: "Siddhivinayak Temple, Mumbai",
    featured: true,
  },
  {
    id: "2",
    name: "Rudrabhishekam",
    description: "Sacred abhishekam to Lord Shiva for health, prosperity, and liberation from negative energies.",
    price: 3500,
    duration: "3 hours",
    category: "Abhishekam",
    image: ritualAbhishekam,
    rating: 4.8,
    bookings: 890,
    temple: "Kashi Vishwanath Temple, Varanasi",
    featured: true,
  },
  {
    id: "3",
    name: "Lakshmi Pooja",
    description: "Worship Goddess Lakshmi for wealth, abundance, and financial prosperity in your life.",
    price: 1500,
    duration: "1.5 hours",
    category: "Pooja",
    image: ritualLakshmi,
    rating: 4.9,
    bookings: 2100,
    temple: "Mahalakshmi Temple, Kolhapur",
  },
  {
    id: "4",
    name: "Navagraha Shanti",
    description: "Pacify the nine planets and reduce negative planetary influences on your horoscope.",
    price: 5000,
    duration: "4 hours",
    category: "Shanti",
    image: ritualShanti,
    rating: 4.7,
    bookings: 560,
    temple: "Suryanar Kovil, Tamil Nadu",
  },
  {
    id: "5",
    name: "Satyanarayan Katha",
    description: "Listen to the divine story of Lord Vishnu for peace, prosperity, and family harmony.",
    price: 2000,
    duration: "2.5 hours",
    category: "Vratam",
    image: ritualVratam,
    rating: 4.8,
    bookings: 1500,
    temple: "ISKCON Temple, Delhi",
  },
  {
    id: "6",
    name: "Durga Saptashati Path",
    description: "Recitation of 700 verses in praise of Goddess Durga for protection and strength.",
    price: 4000,
    duration: "5 hours",
    category: "Pooja",
    image: ritualPooja,
    rating: 4.9,
    bookings: 780,
    temple: "Vaishno Devi Temple, Jammu",
    featured: true,
  },
  {
    id: "7",
    name: "Maha Mrityunjaya Homam",
    description: "Powerful fire ritual for health, longevity, and protection from untimely death.",
    price: 6000,
    duration: "4 hours",
    category: "Homam",
    image: ritualHomam,
    rating: 4.9,
    bookings: 430,
    temple: "Mahakaleshwar Temple, Ujjain",
  },
  {
    id: "8",
    name: "Vishnu Sahasranamam",
    description: "Chanting of 1000 names of Lord Vishnu for peace, prosperity, and spiritual growth.",
    price: 1800,
    duration: "2 hours",
    category: "Pooja",
    image: ritualAbhishekam,
    rating: 4.8,
    bookings: 920,
    temple: "Tirupati Balaji Temple, Andhra Pradesh",
  },
];

// Extract unique categories and temples
const allCategories = [...new Set(servicesData.map((s) => s.category))];
const allTemples = [...new Set(servicesData.map((s) => s.temple))];
const maxPrice = Math.max(...servicesData.map((s) => s.price));

export default function Services() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [ritualType, setRitualType] = useState("all");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, maxPrice],
    temples: [],
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let result = [...servicesData];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query) ||
          s.temple.toLowerCase().includes(query)
      );
    }

    // Ritual type filter (Dashachara/Vamachara simulation - using category for demo)
    if (ritualType === "dashachara") {
      result = result.filter((s) => 
        ["Homam", "Abhishekam", "Pooja", "Vratam"].includes(s.category)
      );
    } else if (ritualType === "vamachara") {
      result = result.filter((s) => 
        ["Shanti"].includes(s.category)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((s) => filters.categories.includes(s.category));
    }

    // Price filter
    result = result.filter(
      (s) => s.price >= filters.priceRange[0] && s.price <= filters.priceRange[1]
    );

    // Temple filter
    if (filters.temples.length > 0) {
      result = result.filter((s) => filters.temples.includes(s.temple));
    }

    // Sort
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.bookings - a.bookings);
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        // In real app, would sort by created date
        break;
    }

    return result;
  }, [searchQuery, filters, sortBy, ritualType]);

  const handleBook = (service: Service) => {
    navigate(`/booking/${service.id}`);
  };

  const content = (
    <>
      {/* Hero Section */}
      <section className="relative py-8 md:py-24 bg-gradient-to-b from-primary/10 to-background overflow-hidden">
        <BackgroundPattern opacity={0.1} />
        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
              Sacred <span className="text-primary">Pooja Services</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Explore our curated collection of authentic Vedic rituals performed by 
              verified Purohits at sacred temples across India.
            </p>
          </div>
        </div>
      </section>

      {/* Ritual Type Tabs */}
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

      {/* Main Content */}
      <section className="py-4 md:py-12">
        <div className="container">
          {/* Search and Sort Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 md:mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search poojas, temples..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
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
            {/* Filters Sidebar - Hidden on mobile */}
            {!isMobile && (
              <div className="lg:w-64 flex-shrink-0">
                <ServiceFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={allCategories}
                  temples={allTemples}
                  maxPrice={maxPrice}
                />
              </div>
            )}

            {/* Services Grid */}
            <div className="flex-1">
              {/* Results count */}
              <p className="text-sm text-muted-foreground mb-4">
                Showing {filteredServices.length} of {servicesData.length} services
              </p>

              {filteredServices.length > 0 ? (
                isMobile ? (
                  <div className="space-y-4">
                    {filteredServices.map((service) => (
                      <MobileServiceCard
                        key={service.id}
                        id={service.id}
                        name={service.name}
                        description={service.description}
                        price={service.price}
                        duration={service.duration}
                        category={service.category}
                        imageUrl={service.image}
                        rating={service.rating}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onBook={handleBook}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg mb-2">No services found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search query
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Poojas" showSearch>
        {content}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {content}
      <Footer />
      <WhatsAppButton />
    </div>
  );
}