import { useState } from "react";
import { Search, Filter, Languages } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { PunditCard } from "@/components/PunditCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/i18n";

// Import local assets for pundit images
import ritualHomam from "@/assets/ritual-homam.jpg";
import ritualAbhishekam from "@/assets/ritual-abhishekam.jpg";
import ritualPooja from "@/assets/ritual-pooja.jpg";
import ritualLakshmi from "@/assets/ritual-lakshmi.jpg";
import ritualShanti from "@/assets/ritual-shanti.jpg";
import ritualVratam from "@/assets/ritual-vratam.jpg";

interface Pundit {
  id: string;
  name: string;
  photo_url: string | null;
  specializations: string[] | null;
  languages: string[] | null;
  experience_years: number | null;
  location: string | null;
  bio: string | null;
  is_verified: boolean | null;
  approval_status: string | null;
}

// Mock data with local pundit images
const mockPundits: Pundit[] = [
  {
    id: "1",
    name: "Pandit Ramesh Sharma",
    photo_url: ritualHomam,
    specializations: ["Vedic Poojas", "Homam", "Satyanarayan Katha"],
    languages: ["Hindi", "Sanskrit", "English"],
    experience_years: 25,
    location: "Varanasi, UP",
    bio: "Renowned Vedic scholar with expertise in traditional rituals and ceremonies.",
    is_verified: true,
    approval_status: "approved",
  },
  {
    id: "2",
    name: "Pandit Subramaniam Iyer",
    photo_url: ritualAbhishekam,
    specializations: ["Homam", "Navagraha Pooja", "Temple Rituals"],
    languages: ["Tamil", "Sanskrit", "Telugu"],
    experience_years: 30,
    location: "Chennai, TN",
    bio: "Expert in South Indian temple traditions and Agamic rituals.",
    is_verified: true,
    approval_status: "approved",
  },
  {
    id: "3",
    name: "Pandit Venkata Rao",
    photo_url: ritualPooja,
    specializations: ["Kalyana Muhurtham", "Griha Pravesh", "Shanti Poojas"],
    languages: ["Telugu", "Sanskrit", "Hindi"],
    experience_years: 20,
    location: "Hyderabad, TS",
    bio: "Specialist in wedding ceremonies and auspicious house-warming rituals.",
    is_verified: true,
    approval_status: "approved",
  },
  {
    id: "4",
    name: "Pandit Ashok Mishra",
    photo_url: ritualLakshmi,
    specializations: ["Rudra Abhishekam", "Maha Mrityunjaya Japa", "Shiv Poojas"],
    languages: ["Hindi", "Sanskrit"],
    experience_years: 18,
    location: "Ujjain, MP",
    bio: "Devotee of Lord Shiva with deep knowledge of Shaivite traditions.",
    is_verified: true,
    approval_status: "approved",
  },
  {
    id: "5",
    name: "Pandit Krishna Das",
    photo_url: ritualShanti,
    specializations: ["Lakshmi Pooja", "Dhanvantari Homam", "Prosperity Rituals"],
    languages: ["Hindi", "Gujarati", "English"],
    experience_years: 15,
    location: "Ahmedabad, GJ",
    bio: "Known for prosperity and wealth-attracting ceremonies.",
    is_verified: true,
    approval_status: "approved",
  },
  {
    id: "6",
    name: "Pandit Balaji Prabhu",
    photo_url: ritualVratam,
    specializations: ["Tirupati Rituals", "Venkateswara Pooja", "Vratams"],
    languages: ["Telugu", "Tamil", "Kannada"],
    experience_years: 22,
    location: "Tirupati, AP",
    bio: "Temple priest with expertise in Vaishnava traditions.",
    is_verified: true,
    approval_status: "approved",
  },
];

const specializations = [
  "All Specializations",
  "Vedic Poojas",
  "Homam",
  "Kalyana Muhurtham",
  "Griha Pravesh",
  "Shanti Poojas",
  "Rudra Abhishekam",
  "Lakshmi Pooja",
];

const allLanguages = [
  "All Languages",
  "Hindi",
  "Sanskrit",
  "Tamil",
  "Telugu",
  "Kannada",
  "English",
  "Gujarati",
];

const Pundits = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");

  const { data: dbPundits = [] } = useQuery({
    queryKey: ["pundits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pundits")
        .select("*")
        .eq("is_active", true)
        .eq("approval_status", "approved");
      
      if (error) throw error;
      return data as Pundit[];
    },
  });

  // Combine DB pundits with mock data if DB is empty
  const pundits = dbPundits.length > 0 ? dbPundits : mockPundits;

  const filteredPundits = pundits.filter((pundit) => {
    const matchesSearch = 
      pundit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pundit.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pundit.specializations?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSpecialization = 
      selectedSpecialization === "All Specializations" || 
      pundit.specializations?.includes(selectedSpecialization);
    
    const matchesLanguage = 
      selectedLanguage === "All Languages" || 
      pundit.languages?.includes(selectedLanguage);

    return matchesSearch && matchesSpecialization && matchesLanguage;
  });

  const content = (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {t("pundits.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("pundits.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("pundits.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
          <SelectTrigger className="w-full md:w-56">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t("pundits.filterBySpecialization")} />
          </SelectTrigger>
          <SelectContent>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec === "All Specializations" ? t("pundits.allSpecializations") : spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-full md:w-48">
            <Languages className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t("pundits.filterByLanguage")} />
          </SelectTrigger>
          <SelectContent>
            {allLanguages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang === "All Languages" ? t("pundits.allLanguages") : lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pundits Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPundits.map((pundit) => (
          <PunditCard key={pundit.id} pundit={pundit} />
        ))}
      </div>

      {filteredPundits.length === 0 && (
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

export default Pundits;