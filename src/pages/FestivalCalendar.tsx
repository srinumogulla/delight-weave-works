import { useState, useMemo } from "react";
import { Calendar, Search, Star, Filter, ChevronLeft, ChevronRight, BookOpen, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useNavigate } from "react-router-dom";

interface Festival {
  name: string;
  date: string;
  hinduDate: string;
  description: string;
  significance: string;
  type: "major" | "regional" | "observance";
  deity?: string;
  recommendedPoojas: { id: string; name: string }[];
  region?: string;
}

// Comprehensive 2026 festival database
const festivals2026: Festival[] = [
  {
    name: "Makar Sankranti",
    date: "2026-01-14",
    hinduDate: "Pausha Shukla Pratipada",
    description: "Festival marking the sun's transition into Capricorn (Makara Rashi)",
    significance: "Marks the beginning of longer days and the harvest season. Holy dips in rivers like Ganga are considered highly auspicious.",
    type: "major",
    deity: "Surya (Sun God)",
    recommendedPoojas: [
      { id: "surya-namaskar", name: "Surya Namaskar Pooja" },
      { id: "ganga-snan", name: "Ganga Snan Sankalpa" }
    ],
    region: "Pan-India"
  },
  {
    name: "Pongal",
    date: "2026-01-15",
    hinduDate: "Pausha Shukla Dwitiya",
    description: "Tamil harvest festival celebrating abundance and gratitude",
    significance: "Four-day harvest festival thanking the Sun God and nature for agricultural abundance. The boiling over of rice symbolizes prosperity.",
    type: "regional",
    deity: "Surya",
    recommendedPoojas: [
      { id: "anna-lakshmi", name: "Anna Lakshmi Pooja" }
    ],
    region: "Tamil Nadu"
  },
  {
    name: "Republic Day",
    date: "2026-01-26",
    hinduDate: "Magha Krishna Saptami",
    description: "National holiday celebrating India's constitution",
    significance: "Commemorates the adoption of the Indian Constitution in 1950.",
    type: "observance",
    recommendedPoojas: [],
    region: "Pan-India"
  },
  {
    name: "Vasant Panchami",
    date: "2026-02-03",
    hinduDate: "Magha Shukla Panchami",
    description: "Festival dedicated to Goddess Saraswati, deity of knowledge",
    significance: "Marks the arrival of spring. Children are initiated into learning (Vidyarambham). Yellow color is significant.",
    type: "major",
    deity: "Saraswati",
    recommendedPoojas: [
      { id: "saraswati-pooja", name: "Saraswati Pooja" },
      { id: "vidyarambham", name: "Vidyarambham Ceremony" }
    ],
    region: "Pan-India"
  },
  {
    name: "Maha Shivaratri",
    date: "2026-02-27",
    hinduDate: "Phalguna Krishna Chaturdashi",
    description: "The great night of Lord Shiva",
    significance: "Most auspicious night for Shiva worship. Devotees observe fast and perform night-long vigil. Union of Shiva and Shakti is celebrated.",
    type: "major",
    deity: "Shiva",
    recommendedPoojas: [
      { id: "rudrabhishek", name: "Rudrabhishek" },
      { id: "shiva-pooja", name: "Maha Shiva Pooja" },
      { id: "bilva-archana", name: "Bilva Patra Archana" }
    ],
    region: "Pan-India"
  },
  {
    name: "Holika Dahan",
    date: "2026-03-16",
    hinduDate: "Phalguna Purnima",
    description: "Burning of Holika, victory of good over evil",
    significance: "Commemorates the burning of demoness Holika and survival of devotee Prahlad. Bonfire symbolizes destruction of evil.",
    type: "major",
    deity: "Vishnu",
    recommendedPoojas: [
      { id: "narasimha-pooja", name: "Narasimha Pooja" }
    ],
    region: "Pan-India"
  },
  {
    name: "Holi",
    date: "2026-03-17",
    hinduDate: "Chaitra Krishna Pratipada",
    description: "Festival of colors celebrating spring and love",
    significance: "Celebrates the divine love of Radha-Krishna. Colors signify joy, new beginnings, and the vibrant spirit of spring.",
    type: "major",
    deity: "Krishna",
    recommendedPoojas: [
      { id: "radha-krishna", name: "Radha Krishna Pooja" }
    ],
    region: "Pan-India"
  },
  {
    name: "Ugadi / Gudi Padwa",
    date: "2026-03-29",
    hinduDate: "Chaitra Shukla Pratipada",
    description: "New Year for Karnataka, Andhra Pradesh, Maharashtra",
    significance: "Marks the beginning of the Hindu New Year. Panchanga Shravanam (reading of new year's almanac) is performed.",
    type: "major",
    recommendedPoojas: [
      { id: "satyanarayan", name: "Satyanarayan Pooja" },
      { id: "panchanga-shravanam", name: "Panchanga Shravanam" }
    ],
    region: "Maharashtra, Karnataka, Andhra Pradesh"
  },
  {
    name: "Chaitra Navratri Begins",
    date: "2026-03-29",
    hinduDate: "Chaitra Shukla Pratipada",
    description: "Nine nights dedicated to Goddess Durga",
    significance: "Spring Navratri celebrating the victory of Goddess Durga. Each day honors a different form of the Goddess.",
    type: "major",
    deity: "Durga",
    recommendedPoojas: [
      { id: "durga-saptashati", name: "Durga Saptashati Path" },
      { id: "navarna-mantra", name: "Navarna Mantra Japa" }
    ],
    region: "North India"
  },
  {
    name: "Ram Navami",
    date: "2026-04-06",
    hinduDate: "Chaitra Shukla Navami",
    description: "Birthday of Lord Rama",
    significance: "Celebrates the birth of the ideal king, Lord Rama. Rama Katha, fasting, and temple visits are traditional.",
    type: "major",
    deity: "Rama",
    recommendedPoojas: [
      { id: "rama-pooja", name: "Sri Rama Pooja" },
      { id: "sundarkand", name: "Sundarkand Path" }
    ],
    region: "Pan-India"
  },
  {
    name: "Hanuman Jayanti",
    date: "2026-04-14",
    hinduDate: "Chaitra Purnima",
    description: "Birthday of Lord Hanuman",
    significance: "Celebrates the birth of the devoted servant of Lord Rama. Hanuman Chalisa recitation is especially powerful today.",
    type: "major",
    deity: "Hanuman",
    recommendedPoojas: [
      { id: "hanuman-pooja", name: "Hanuman Pooja" },
      { id: "hanuman-chalisa", name: "Hanuman Chalisa Path" }
    ],
    region: "Pan-India"
  },
  {
    name: "Akshaya Tritiya",
    date: "2026-04-26",
    hinduDate: "Vaishakha Shukla Tritiya",
    description: "One of the most auspicious days for new beginnings",
    significance: "Whatever is acquired or started on this day is believed to bring lasting prosperity. Gold purchases are traditional.",
    type: "major",
    deity: "Vishnu, Lakshmi",
    recommendedPoojas: [
      { id: "lakshmi-pooja", name: "Lakshmi Pooja" },
      { id: "vishnu-sahasranama", name: "Vishnu Sahasranama" }
    ],
    region: "Pan-India"
  },
  {
    name: "Buddha Purnima",
    date: "2026-05-12",
    hinduDate: "Vaishakha Purnima",
    description: "Birth, Enlightenment, and Mahaparinirvana of Buddha",
    significance: "Triple blessed day commemorating Buddha's birth, enlightenment under the Bodhi tree, and passing away.",
    type: "major",
    recommendedPoojas: [],
    region: "Pan-India"
  },
  {
    name: "Vat Savitri Vrat",
    date: "2026-05-28",
    hinduDate: "Jyeshtha Krishna Amavasya",
    description: "Married women's fast for husband's longevity",
    significance: "Commemorates Savitri who brought back her husband from Yama (death). Married women tie threads around Banyan trees.",
    type: "regional",
    recommendedPoojas: [
      { id: "savitri-vrat", name: "Savitri Vrat Pooja" }
    ],
    region: "Maharashtra, Gujarat"
  },
  {
    name: "Ganga Dussehra",
    date: "2026-06-06",
    hinduDate: "Jyeshtha Shukla Dashami",
    description: "Descent of River Ganga to Earth",
    significance: "Commemorates the day when Ganga descended from heaven to earth. Holy dip in Ganga washes away ten sins (Dasha-hara).",
    type: "major",
    deity: "Ganga",
    recommendedPoojas: [
      { id: "ganga-pooja", name: "Ganga Pooja" }
    ],
    region: "North India"
  },
  {
    name: "Jagannath Rath Yatra",
    date: "2026-06-23",
    hinduDate: "Ashadha Shukla Dwitiya",
    description: "Grand chariot procession of Lord Jagannath",
    significance: "Lord Jagannath, Balabhadra, and Subhadra are taken in massive chariots. Pulling the rope is considered highly meritorious.",
    type: "major",
    deity: "Jagannath (Krishna)",
    recommendedPoojas: [
      { id: "jagannath-pooja", name: "Jagannath Pooja" }
    ],
    region: "Odisha"
  },
  {
    name: "Guru Purnima",
    date: "2026-07-10",
    hinduDate: "Ashadha Purnima",
    description: "Day to honor spiritual teachers and gurus",
    significance: "Dedicated to Sage Vyasa who compiled the Vedas. Day to express gratitude to teachers and gurus.",
    type: "major",
    recommendedPoojas: [
      { id: "guru-pooja", name: "Guru Paduka Pooja" }
    ],
    region: "Pan-India"
  },
  {
    name: "Nag Panchami",
    date: "2026-07-26",
    hinduDate: "Shravana Shukla Panchami",
    description: "Worship of serpent deities",
    significance: "Serpents are worshipped as they are associated with Lord Shiva and fertility. Milk is offered to snake idols.",
    type: "major",
    deity: "Nagas (Serpent Gods)",
    recommendedPoojas: [
      { id: "nag-pooja", name: "Nag Devta Pooja" },
      { id: "kaal-sarpa", name: "Kaal Sarpa Dosha Nivaran" }
    ],
    region: "Pan-India"
  },
  {
    name: "Raksha Bandhan",
    date: "2026-08-09",
    hinduDate: "Shravana Purnima",
    description: "Festival of sibling bond",
    significance: "Sisters tie protective thread (rakhi) on brothers' wrists, symbolizing love and protection. Brothers pledge to protect sisters.",
    type: "major",
    recommendedPoojas: [],
    region: "Pan-India"
  },
  {
    name: "Janmashtami",
    date: "2026-08-15",
    hinduDate: "Bhadrapada Krishna Ashtami",
    description: "Birthday of Lord Krishna",
    significance: "Celebrates the midnight birth of Krishna. Fasting, bhajans, and Dahi Handi (breaking pot of curd) are traditional.",
    type: "major",
    deity: "Krishna",
    recommendedPoojas: [
      { id: "krishna-pooja", name: "Krishna Janmashtami Pooja" },
      { id: "krishna-abhishek", name: "Krishna Abhishekam" }
    ],
    region: "Pan-India"
  },
  {
    name: "Ganesh Chaturthi",
    date: "2026-08-22",
    hinduDate: "Bhadrapada Shukla Chaturthi",
    description: "Birthday of Lord Ganesha",
    significance: "Ten-day festival celebrating the elephant-headed God. Clay idols are installed and immersed on the final day.",
    type: "major",
    deity: "Ganesha",
    recommendedPoojas: [
      { id: "ganesh-pooja", name: "Ganesh Pooja" },
      { id: "ganapati-atharvashirsha", name: "Ganapati Atharvashirsha" }
    ],
    region: "Pan-India"
  },
  {
    name: "Onam",
    date: "2026-08-30",
    hinduDate: "Bhadrapada Shukla Dwadashi",
    description: "Harvest festival of Kerala",
    significance: "Celebrates the annual return of legendary King Mahabali. Elaborate flower carpets (Pookalam) and Onam Sadya feast.",
    type: "regional",
    recommendedPoojas: [
      { id: "vishnu-pooja", name: "Vamana Vishnu Pooja" }
    ],
    region: "Kerala"
  },
  {
    name: "Anant Chaturdashi",
    date: "2026-08-31",
    hinduDate: "Bhadrapada Shukla Chaturdashi",
    description: "Ganesh Visarjan and Anant Vrat",
    significance: "Final day of Ganesh festival. Also the day of Anant Vrat for Lord Vishnu's eternal blessings.",
    type: "major",
    deity: "Ganesha, Vishnu",
    recommendedPoojas: [
      { id: "anant-vrat", name: "Anant Vrat Pooja" }
    ],
    region: "Pan-India"
  },
  {
    name: "Pitru Paksha Begins",
    date: "2026-09-03",
    hinduDate: "Bhadrapada Purnima",
    description: "Fortnight for honoring ancestors",
    significance: "16-day period to pay homage to departed ancestors through Shraddha rituals. Tarpan and Pind Daan are performed.",
    type: "major",
    recommendedPoojas: [
      { id: "shraddha", name: "Shraddha Ceremony" },
      { id: "tarpan", name: "Tarpan Vidhi" }
    ],
    region: "Pan-India"
  },
  {
    name: "Mahalaya Amavasya",
    date: "2026-09-17",
    hinduDate: "Ashwin Krishna Amavasya",
    description: "End of Pitru Paksha, beginning of Devi Paksha",
    significance: "Most important day for ancestral rites. Also marks the invocation of Goddess Durga for Navratri.",
    type: "major",
    deity: "Ancestors, Durga",
    recommendedPoojas: [
      { id: "mahalaya-shraddha", name: "Mahalaya Shraddha" }
    ],
    region: "Pan-India"
  },
  {
    name: "Sharad Navratri Begins",
    date: "2026-09-18",
    hinduDate: "Ashwin Shukla Pratipada",
    description: "Nine nights of Goddess Durga worship",
    significance: "Most celebrated Navratri. Nine forms of Durga worshipped. Garba, Dandiya, and fasting are traditional.",
    type: "major",
    deity: "Durga",
    recommendedPoojas: [
      { id: "durga-saptashati", name: "Durga Saptashati Path" },
      { id: "chandi-path", name: "Chandi Path" },
      { id: "kanya-pujan", name: "Kanya Pujan" }
    ],
    region: "Pan-India"
  },
  {
    name: "Durga Ashtami",
    date: "2026-09-25",
    hinduDate: "Ashwin Shukla Ashtami",
    description: "Eighth day of Navratri - Maha Ashtami",
    significance: "One of the most powerful days of Navratri. Sandhi Puja is performed at the junction of Ashtami and Navami.",
    type: "major",
    deity: "Durga",
    recommendedPoojas: [
      { id: "sandhi-puja", name: "Sandhi Puja" },
      { id: "kanya-pujan", name: "Kanya Pujan" }
    ],
    region: "Pan-India"
  },
  {
    name: "Maha Navami",
    date: "2026-09-26",
    hinduDate: "Ashwin Shukla Navami",
    description: "Ninth day of Navratri",
    significance: "Day of Ayudha Puja (worship of tools and vehicles) in South India. Weapons and instruments are worshipped.",
    type: "major",
    deity: "Durga",
    recommendedPoojas: [
      { id: "ayudha-puja", name: "Ayudha Puja" }
    ],
    region: "Pan-India"
  },
  {
    name: "Dussehra / Vijayadashami",
    date: "2026-09-27",
    hinduDate: "Ashwin Shukla Dashami",
    description: "Victory of good over evil",
    significance: "Celebrates Rama's victory over Ravana and Durga's victory over Mahishasura. Effigies of Ravana are burned.",
    type: "major",
    deity: "Rama, Durga",
    recommendedPoojas: [
      { id: "durga-visarjan", name: "Durga Visarjan" },
      { id: "shami-puja", name: "Shami Puja" }
    ],
    region: "Pan-India"
  },
  {
    name: "Sharad Purnima",
    date: "2026-10-02",
    hinduDate: "Ashwin Purnima",
    description: "Full moon night celebrating divine love",
    significance: "Night when Krishna performed the divine Raas Leela. Moon is believed to shower nectar (amrit). Kheer is kept under moonlight.",
    type: "major",
    deity: "Krishna, Lakshmi",
    recommendedPoojas: [
      { id: "lakshmi-pooja", name: "Kojagiri Lakshmi Pooja" }
    ],
    region: "Pan-India"
  },
  {
    name: "Karwa Chauth",
    date: "2026-10-11",
    hinduDate: "Kartik Krishna Chaturthi",
    description: "Fast observed by married women for husband's longevity",
    significance: "Married women fast from sunrise until moonrise. They break the fast after seeing the moon through a sieve.",
    type: "regional",
    recommendedPoojas: [
      { id: "karwa-chauth", name: "Karwa Chauth Pooja" }
    ],
    region: "North India"
  },
  {
    name: "Dhanteras",
    date: "2026-10-29",
    hinduDate: "Kartik Krishna Trayodashi",
    description: "First day of Diwali celebrations",
    significance: "Day of Dhanvantari (God of Ayurveda). Auspicious for purchasing gold, silver, and new items.",
    type: "major",
    deity: "Dhanvantari, Lakshmi",
    recommendedPoojas: [
      { id: "dhanvantari-pooja", name: "Dhanvantari Pooja" }
    ],
    region: "Pan-India"
  },
  {
    name: "Narak Chaturdashi / Choti Diwali",
    date: "2026-10-30",
    hinduDate: "Kartik Krishna Chaturdashi",
    description: "Victory of Krishna over Narakasura",
    significance: "Celebrates Krishna's victory over demon Narakasura. Oil bath before sunrise removes sins.",
    type: "major",
    deity: "Krishna",
    recommendedPoojas: [
      { id: "abhyanga-snan", name: "Abhyanga Snan" }
    ],
    region: "Pan-India"
  },
  {
    name: "Diwali / Lakshmi Puja",
    date: "2026-10-31",
    hinduDate: "Kartik Amavasya",
    description: "Festival of lights - worship of Goddess Lakshmi",
    significance: "Most celebrated Hindu festival. Homes are lit with diyas, firecrackers are burst, and Goddess Lakshmi is worshipped for prosperity.",
    type: "major",
    deity: "Lakshmi, Ganesha",
    recommendedPoojas: [
      { id: "lakshmi-ganesh-pooja", name: "Lakshmi Ganesh Pooja" },
      { id: "shree-sukta", name: "Shree Sukta Path" }
    ],
    region: "Pan-India"
  },
  {
    name: "Govardhan Puja",
    date: "2026-11-01",
    hinduDate: "Kartik Shukla Pratipada",
    description: "Worship of Govardhan Hill",
    significance: "Celebrates Krishna lifting Govardhan Hill to protect villagers from Indra's wrath. Also called Annakut.",
    type: "major",
    deity: "Krishna",
    recommendedPoojas: [
      { id: "govardhan-pooja", name: "Govardhan Pooja" }
    ],
    region: "North India"
  },
  {
    name: "Bhai Dooj",
    date: "2026-11-02",
    hinduDate: "Kartik Shukla Dwitiya",
    description: "Celebration of sibling bond",
    significance: "Sisters apply tilak on brothers' foreheads and pray for their long life. Similar to Raksha Bandhan.",
    type: "major",
    recommendedPoojas: [],
    region: "Pan-India"
  },
  {
    name: "Chhath Puja",
    date: "2026-11-06",
    hinduDate: "Kartik Shukla Shashthi",
    description: "Worship of the Sun God",
    significance: "Ancient Vedic festival worshipping the Sun and his consort Chhathi Maiya. Rigorous fasting and standing in water.",
    type: "regional",
    deity: "Surya",
    recommendedPoojas: [
      { id: "surya-pooja", name: "Surya Pooja" }
    ],
    region: "Bihar, Jharkhand, UP"
  },
  {
    name: "Dev Uthani Ekadashi",
    date: "2026-11-11",
    hinduDate: "Kartik Shukla Ekadashi",
    description: "Lord Vishnu awakens from cosmic sleep",
    significance: "Marks the end of Chaturmas when Vishnu awakens. Marriages and auspicious events resume. Also called Prabodhini Ekadashi.",
    type: "major",
    deity: "Vishnu",
    recommendedPoojas: [
      { id: "tulsi-vivah", name: "Tulsi Vivah" },
      { id: "vishnu-pooja", name: "Vishnu Pooja" }
    ],
    region: "Pan-India"
  },
  {
    name: "Kartik Purnima",
    date: "2026-11-15",
    hinduDate: "Kartik Purnima",
    description: "Sacred full moon of Kartik month",
    significance: "One of the most sacred Purnimas. Also celebrated as Dev Diwali in Varanasi with thousands of lamps on ghats.",
    type: "major",
    deity: "Shiva, Vishnu",
    recommendedPoojas: [
      { id: "deep-daan", name: "Deep Daan" }
    ],
    region: "Pan-India"
  },
  {
    name: "Vivah Panchami",
    date: "2026-12-04",
    hinduDate: "Margashirsha Shukla Panchami",
    description: "Wedding anniversary of Rama and Sita",
    significance: "Celebrates the divine marriage of Lord Rama and Goddess Sita. Grand celebrations at Janakpur.",
    type: "regional",
    deity: "Rama, Sita",
    recommendedPoojas: [
      { id: "rama-sita-pooja", name: "Rama Sita Vivah Pooja" }
    ],
    region: "North India"
  },
  {
    name: "Gita Jayanti",
    date: "2026-12-11",
    hinduDate: "Margashirsha Shukla Ekadashi",
    description: "Day when Krishna spoke the Bhagavad Gita",
    significance: "Anniversary of Krishna imparting the sacred Bhagavad Gita to Arjuna on the battlefield of Kurukshetra.",
    type: "major",
    deity: "Krishna",
    recommendedPoojas: [
      { id: "gita-path", name: "Bhagavad Gita Path" }
    ],
    region: "Pan-India"
  },
  {
    name: "Dhanu Sankranti",
    date: "2026-12-15",
    hinduDate: "Margashirsha Shukla Ekadashi",
    description: "Sun enters Sagittarius",
    significance: "Beginning of the holy month of Dhanu. Especially auspicious in Odisha with Dhanu Yatra celebrations.",
    type: "regional",
    recommendedPoojas: [],
    region: "Odisha"
  }
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function FestivalCalendar() {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = January
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);

  const filteredFestivals = useMemo(() => {
    return festivals2026.filter(festival => {
      const matchesSearch = festival.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           festival.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (festival.deity?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === "all" || festival.type === typeFilter;
      
      if (currentMonth === -1) return matchesSearch && matchesType; // All year view
      
      const festivalMonth = new Date(festival.date).getMonth();
      return festivalMonth === currentMonth && matchesSearch && matchesType;
    });
  }, [currentMonth, searchQuery, typeFilter]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "major":
        return <Badge className="bg-primary text-primary-foreground">Major Festival</Badge>;
      case "regional":
        return <Badge variant="secondary">Regional</Badge>;
      default:
        return <Badge variant="outline">Observance</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const festivalDate = new Date(dateStr);
    const diffTime = festivalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const content = (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Hindu Festival Calendar 2026
          </h1>
          <p className="text-muted-foreground">
            Complete guide to festivals, their significance, and recommended poojas
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search festivals, deities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Month Selector */}
              <Select value={currentMonth.toString()} onValueChange={(v) => setCurrentMonth(parseInt(v))}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1">All Year</SelectItem>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month} 2026
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Festival Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="major">Major Festivals</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="observance">Observances</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Month Navigation */}
            {currentMonth !== -1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold min-w-32 text-center">
                  {months[currentMonth]} 2026
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Festival List */}
        <div className="space-y-4">
          {filteredFestivals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No festivals found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFestivals.map((festival, index) => {
              const daysUntil = getDaysUntil(festival.date);
              const isPast = daysUntil < 0;
              const isToday = daysUntil === 0;
              
              return (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all hover:shadow-md ${isPast ? 'opacity-60' : ''} ${isToday ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedFestival(festival)}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Date Box */}
                      <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {new Date(festival.date).getDate()}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase">
                          {months[new Date(festival.date).getMonth()].slice(0, 3)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 flex-wrap">
                              {festival.name}
                              {isToday && (
                                <Badge className="bg-green-500 text-white">Today!</Badge>
                              )}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {festival.hinduDate}
                            </p>
                          </div>
                          {getTypeBadge(festival.type)}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {festival.description}
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs">
                          {festival.deity && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Sparkles className="h-3 w-3" />
                              {festival.deity}
                            </span>
                          )}
                          {festival.region && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {festival.region}
                            </span>
                          )}
                          {festival.recommendedPoojas.length > 0 && (
                            <span className="flex items-center gap-1 text-primary">
                              <BookOpen className="h-3 w-3" />
                              {festival.recommendedPoojas.length} recommended pooja(s)
                            </span>
                          )}
                        </div>

                        {!isPast && (
                          <p className="text-xs text-primary mt-2 font-medium">
                            {isToday ? "Happening today!" : `${daysUntil} days away`}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Festival Detail Dialog */}
      <Dialog open={!!selectedFestival} onOpenChange={() => setSelectedFestival(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFestival && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Star className="h-6 w-6 text-primary" />
                  {selectedFestival.name}
                </DialogTitle>
                <DialogDescription>
                  {formatDate(selectedFestival.date)} • {selectedFestival.hinduDate}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Type and Region */}
                <div className="flex flex-wrap gap-2">
                  {getTypeBadge(selectedFestival.type)}
                  {selectedFestival.deity && (
                    <Badge variant="outline">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {selectedFestival.deity}
                    </Badge>
                  )}
                  {selectedFestival.region && (
                    <Badge variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedFestival.region}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-muted-foreground">{selectedFestival.description}</p>
                </div>

                {/* Significance */}
                <div>
                  <h4 className="font-semibold mb-2">Significance</h4>
                  <p className="text-muted-foreground">{selectedFestival.significance}</p>
                </div>

                {/* Recommended Poojas */}
                {selectedFestival.recommendedPoojas.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Recommended Poojas</h4>
                    <div className="space-y-2">
                      {selectedFestival.recommendedPoojas.map((pooja, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            setSelectedFestival(null);
                            navigate(`/booking?service=${pooja.id}`);
                          }}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          {pooja.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Days Until */}
                {getDaysUntil(selectedFestival.date) >= 0 && (
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <span className="text-3xl font-bold text-primary">
                      {getDaysUntil(selectedFestival.date)}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {getDaysUntil(selectedFestival.date) === 0 ? "Today!" : "days until this festival"}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  if (isMobile) {
    return <MobileLayout title="Festival Calendar">{content}</MobileLayout>;
  }

  return (
    <>
      <Header />
      {content}
      <Footer />
    </>
  );
}
