import { useState, useEffect } from "react";
import { Search, MapPin, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { TempleCard } from "@/components/TempleCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n";

// Import local assets for temple images
import heroTemple from "@/assets/hero-temple.jpg";
import ritualHomam from "@/assets/ritual-homam.jpg";
import ritualAbhishekam from "@/assets/ritual-abhishekam.jpg";
import ritualPooja from "@/assets/ritual-pooja.jpg";
import ritualLakshmi from "@/assets/ritual-lakshmi.jpg";
import ritualShanti from "@/assets/ritual-shanti.jpg";

interface Temple {
  id: string;
  name: string;
  deity: string | null;
  location: string | null;
  state: string | null;
  city: string | null;
  description: string | null;
  image_url: string | null;
  contact_phone: string | null;
  website_url: string | null;
  is_partner: boolean | null;
}

// Mock data for demonstration with local images
const mockTemples: Temple[] = [
  {
    id: "1",
    name: "Tirupati Balaji Temple",
    deity: "Lord Venkateswara",
    location: "Tirumala Hills",
    state: "Andhra Pradesh",
    city: "Tirupati",
    description: "One of the most visited pilgrimage centers in the world, dedicated to Lord Venkateswara.",
    image_url: heroTemple,
    contact_phone: "+91 877 2277777",
    website_url: "https://tirumala.org",
    is_partner: true,
  },
  {
    id: "2",
    name: "Kashi Vishwanath Temple",
    deity: "Lord Shiva",
    location: "Varanasi",
    state: "Uttar Pradesh",
    city: "Varanasi",
    description: "One of the most famous Hindu temples dedicated to Lord Shiva, located on the western bank of the Ganga.",
    image_url: ritualAbhishekam,
    contact_phone: "+91 542 2392629",
    website_url: "https://shrikashivishwanath.org",
    is_partner: true,
  },
  {
    id: "3",
    name: "Meenakshi Amman Temple",
    deity: "Goddess Meenakshi",
    location: "Madurai",
    state: "Tamil Nadu",
    city: "Madurai",
    description: "Historic Hindu temple dedicated to Meenakshi, a form of Parvati, and her consort, Sundareshwar.",
    image_url: ritualPooja,
    contact_phone: "+91 452 2349292",
    website_url: null,
    is_partner: true,
  },
  {
    id: "4",
    name: "Siddhivinayak Temple",
    deity: "Lord Ganesha",
    location: "Prabhadevi",
    state: "Maharashtra",
    city: "Mumbai",
    description: "Hindu temple dedicated to Lord Shri Ganesh, known for granting wishes.",
    image_url: ritualHomam,
    contact_phone: "+91 22 24378880",
    website_url: "https://siddhivinayak.org",
    is_partner: false,
  },
  {
    id: "5",
    name: "Jagannath Temple",
    deity: "Lord Jagannath",
    location: "Puri",
    state: "Odisha",
    city: "Puri",
    description: "Famous Hindu temple dedicated to Lord Jagannath, known for the annual Rath Yatra festival.",
    image_url: ritualLakshmi,
    contact_phone: "+91 6752 223002",
    website_url: null,
    is_partner: true,
  },
  {
    id: "6",
    name: "Golden Temple",
    deity: "Guru Granth Sahib",
    location: "Amritsar",
    state: "Punjab",
    city: "Amritsar",
    description: "The holiest Gurdwara and the most important pilgrimage site of Sikhism.",
    image_url: ritualShanti,
    contact_phone: "+91 183 2553957",
    website_url: "https://sgpc.net",
    is_partner: false,
  },
];

const states = ["All States", "Andhra Pradesh", "Maharashtra", "Odisha", "Punjab", "Tamil Nadu", "Uttar Pradesh"];
const deities = ["All Deities", "Lord Venkateswara", "Lord Shiva", "Goddess Meenakshi", "Lord Ganesha", "Lord Jagannath", "Guru Granth Sahib"];

const Temples = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedDeity, setSelectedDeity] = useState("All Deities");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: dbTemples = [] } = useQuery({
    queryKey: ["temples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("temples")
        .select("*")
        .eq("is_active", true);
      
      if (error) throw error;
      return data as Temple[];
    },
  });

  // Combine DB temples with mock data if DB is empty
  const temples = dbTemples.length > 0 ? dbTemples : mockTemples;

  const filteredTemples = temples.filter((temple) => {
    const matchesSearch = 
      temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temple.deity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temple.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesState = selectedState === "All States" || temple.state === selectedState;
    const matchesDeity = selectedDeity === "All Deities" || temple.deity === selectedDeity;

    return matchesSearch && matchesState && matchesDeity;
  });

  const content = (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {t("temples.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("temples.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("temples.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-full md:w-48">
            <MapPin className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t("temples.filterByState")} />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state === "All States" ? t("temples.allStates") : state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDeity} onValueChange={setSelectedDeity}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t("temples.filterByDeity")} />
          </SelectTrigger>
          <SelectContent>
            {deities.map((deity) => (
              <SelectItem key={deity} value={deity}>
                {deity === "All Deities" ? t("temples.allDeities") : deity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Temples Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemples.map((temple) => (
          <TempleCard key={temple.id} temple={temple} />
        ))}
      </div>

      {filteredTemples.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("common.noResults")}</p>
        </div>
      )}
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout showHeader={true}>
        {content}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {content}
      <Footer />
    </div>
  );
};

export default Temples;
