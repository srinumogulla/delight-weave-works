import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Phone, Globe, Heart, Clock, Calendar } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n";
import { useAuth } from "@/components/AuthProvider";
import { useSavedItems } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";

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

interface PoojaService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string | null;
  image_url: string | null;
  temple: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
}

// Mock temple data for fallback
const mockTemples: Temple[] = [
  {
    id: "1",
    name: "Tirupati Balaji Temple",
    deity: "Lord Venkateswara",
    location: "Tirumala Hills",
    state: "Andhra Pradesh",
    city: "Tirupati",
    description: "One of the most visited pilgrimage centers in the world, dedicated to Lord Venkateswara. The temple is also known as Tirumala Temple, is a Hindu temple located in the hill town of Tirumala at Tirupati in Chittoor district of Andhra Pradesh, India.",
    image_url: "https://images.unsplash.com/photo-1621427728602-28f06c06ef68?w=1200",
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
    description: "One of the most famous Hindu temples dedicated to Lord Shiva, located on the western bank of the holy river Ganga. It is one of the twelve Jyotirlingas and holds immense spiritual significance.",
    image_url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200",
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
    description: "Historic Hindu temple dedicated to Meenakshi, a form of Parvati, and her consort, Sundareshwar, a form of Shiva. The temple is at the center of the ancient temple city of Madurai.",
    image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200",
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
    description: "One of the richest temples in Mumbai, dedicated to Lord Ganesha. The temple is known for granting wishes and is visited by thousands of devotees daily.",
    image_url: "https://images.unsplash.com/photo-1567591370504-80a5653e5150?w=1200",
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
    description: "Famous Hindu temple dedicated to Lord Jagannath, known for the annual Rath Yatra festival. One of the Char Dham pilgrimage sites for Hindus.",
    image_url: "https://images.unsplash.com/photo-1600359756098-8bc52195bbf4?w=1200",
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
    description: "The holiest Gurdwara and the most important pilgrimage site of Sikhism. Known for its stunning golden architecture and the world's largest free kitchen.",
    image_url: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=1200",
    contact_phone: "+91 183 2553957",
    website_url: "https://sgpc.net",
    is_partner: false,
  },
];

const TempleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isItemSaved, toggleSave, isToggling } = useSavedItems('temple');

  // Fetch temple details
  const { data: temple, isLoading: isLoadingTemple } = useQuery({
    queryKey: ["temple", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("temples")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        // Fall back to mock data
        const mockTemple = mockTemples.find(t => t.id === id);
        if (mockTemple) return mockTemple;
        throw error;
      }
      return data as Temple;
    },
  });

  // Fetch poojas associated with this temple
  const { data: poojas = [], isLoading: isLoadingPoojas } = useQuery({
    queryKey: ["temple-poojas", temple?.name],
    queryFn: async () => {
      if (!temple?.name) return [];
      const { data, error } = await supabase
        .from("pooja_services")
        .select("*")
        .eq("is_active", true)
        .ilike("temple", `%${temple.name}%`);
      
      if (error) throw error;
      return data as PoojaService[];
    },
    enabled: !!temple?.name,
  });

  const isSaved = temple ? isItemSaved(temple.id, 'temple') : false;

  const handleSaveClick = () => {
    if (!user || !temple) return;
    toggleSave({ itemId: temple.id, type: 'temple' });
  };

  const content = (
    <main className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/temples")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Temples
      </Button>

      {isLoadingTemple ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : temple ? (
        <div className="space-y-8">
          {/* Hero Image */}
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
            <img
              src={temple.image_url || "/placeholder.svg"}
              alt={temple.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Save Button */}
            {user && (
              <button
                onClick={handleSaveClick}
                disabled={isToggling}
                className={cn(
                  "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isSaved 
                    ? "bg-destructive text-destructive-foreground" 
                    : "bg-background/80 text-muted-foreground hover:bg-background hover:text-destructive"
                )}
              >
                <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
              </button>
            )}

            {temple.is_partner && (
              <Badge className="absolute top-4 left-4 bg-primary">
                Partner Temple
              </Badge>
            )}

            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {temple.name}
              </h1>
              {temple.deity && (
                <p className="text-lg text-white/90">{temple.deity}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About the Temple</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {temple.description || "No description available."}
                  </p>
                </CardContent>
              </Card>

              {/* Poojas at this Temple */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Poojas Available
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingPoojas ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : poojas.length > 0 ? (
                    <div className="space-y-4">
                      {poojas.map((pooja) => (
                        <div
                          key={pooja.id}
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/booking/${pooja.id}`)}
                        >
                          <img
                            src={pooja.image_url || "/placeholder.svg"}
                            alt={pooja.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{pooja.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {pooja.description}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-sm">
                              {pooja.duration && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {pooja.duration}
                                </span>
                              )}
                              <span className="font-semibold text-primary">
                                ₹{pooja.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No poojas currently available at this temple.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(temple.city || temple.state || temple.location) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {[temple.location, temple.city, temple.state].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}

                  {temple.contact_phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a
                          href={`tel:${temple.contact_phone}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {temple.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {temple.website_url && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a
                          href={temple.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Book a Pooja CTA */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Book a Pooja</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Experience divine blessings with our online pooja services.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate("/services")}
                  >
                    Browse All Poojas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Temple not found.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/temples")}
          >
            Back to Temples
          </Button>
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

export default TempleDetails;
