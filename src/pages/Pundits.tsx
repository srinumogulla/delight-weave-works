import { useState } from "react";
import { Search, Filter, Languages } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PunditCard } from "@/components/PunditCard";
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
}

// Mock data for demonstration
const mockPundits: Pundit[] = [
  {
    id: "1",
    name: "Pandit Ramesh Sharma",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    specializations: ["Vedic Poojas", "Homam", "Satyanarayan Katha"],
    languages: ["Hindi", "Sanskrit", "English"],
    experience_years: 25,
    location: "Varanasi, UP",
    bio: "Renowned Vedic scholar with expertise in traditional rituals and ceremonies.",
    is_verified: true,
  },
  {
    id: "2",
    name: "Pandit Subramaniam Iyer",
    photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    specializations: ["Homam", "Navagraha Pooja", "Temple Rituals"],
    languages: ["Tamil", "Sanskrit", "Telugu"],
    experience_years: 30,
    location: "Chennai, TN",
    bio: "Expert in South Indian temple traditions and Agamic rituals.",
    is_verified: true,
  },
  {
    id: "3",
    name: "Pandit Venkata Rao",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    specializations: ["Kalyana Muhurtham", "Griha Pravesh", "Shanti Poojas"],
    languages: ["Telugu", "Sanskrit", "Hindi"],
    experience_years: 20,
    location: "Hyderabad, TS",
    bio: "Specialist in wedding ceremonies and auspicious house-warming rituals.",
    is_verified: true,
  },
  {
    id: "4",
    name: "Pandit Ashok Mishra",
    photo_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
    specializations: ["Rudra Abhishekam", "Maha Mrityunjaya Japa", "Shiv Poojas"],
    languages: ["Hindi", "Sanskrit"],
    experience_years: 18,
    location: "Ujjain, MP",
    bio: "Devotee of Lord Shiva with deep knowledge of Shaivite traditions.",
    is_verified: true,
  },
  {
    id: "5",
    name: "Pandit Krishna Das",
    photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    specializations: ["Lakshmi Pooja", "Dhanvantari Homam", "Prosperity Rituals"],
    languages: ["Hindi", "Gujarati", "English"],
    experience_years: 15,
    location: "Ahmedabad, GJ",
    bio: "Known for prosperity and wealth-attracting ceremonies.",
    is_verified: false,
  },
  {
    id: "6",
    name: "Pandit Balaji Prabhu",
    photo_url: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400",
    specializations: ["Tirupati Rituals", "Venkateswara Pooja", "Vratams"],
    languages: ["Telugu", "Tamil", "Kannada"],
    experience_years: 22,
    location: "Tirupati, AP",
    bio: "Temple priest with expertise in Vaishnava traditions.",
    is_verified: true,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");

  const { data: dbPundits = [] } = useQuery({
    queryKey: ["pundits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pundits")
        .select("*")
        .eq("is_active", true);
      
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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

      <Footer />
    </div>
  );
};

export default Pundits;
