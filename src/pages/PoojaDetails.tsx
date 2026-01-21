import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  MapPin, 
  Star, 
  Check, 
  Heart,
  Share2,
  ShieldCheck
} from "lucide-react";

import ritualHomam from "@/assets/ritual-homam.jpg";
import ritualAbhishekam from "@/assets/ritual-abhishekam.jpg";
import ritualVratam from "@/assets/ritual-vratam.jpg";
import ritualShanti from "@/assets/ritual-shanti.jpg";
import ritualLakshmi from "@/assets/ritual-lakshmi.jpg";
import ritualPooja from "@/assets/ritual-pooja.jpg";

const imageMap: Record<string, string> = {
  "/ritual-homam.jpg": ritualHomam,
  "/ritual-abhishekam.jpg": ritualAbhishekam,
  "/ritual-vratam.jpg": ritualVratam,
  "/ritual-shanti.jpg": ritualShanti,
  "/ritual-lakshmi.jpg": ritualLakshmi,
  "/ritual-pooja.jpg": ritualPooja,
  "ritual-homam": ritualHomam,
  "ritual-abhishekam": ritualAbhishekam,
  "ritual-vratam": ritualVratam,
  "ritual-shanti": ritualShanti,
  "ritual-lakshmi": ritualLakshmi,
  "ritual-pooja": ritualPooja,
  "homam": ritualHomam,
  "abhishekam": ritualAbhishekam,
  "vratam": ritualVratam,
  "shanti": ritualShanti,
  "lakshmi": ritualLakshmi,
};

// Default benefits for poojas
const defaultBenefits = [
  "Removal of obstacles and negative energies",
  "Blessings for prosperity and success",
  "Spiritual purification and peace of mind",
  "Divine grace and protection",
  "Fulfillment of heartfelt wishes",
];

export default function PoojaDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: pooja, isLoading } = useQuery({
    queryKey: ["pooja-details", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pooja_services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const getImage = (imageUrl?: string | null) => {
    if (!imageUrl) return ritualPooja;
    return imageMap[imageUrl] || imageUrl || ritualPooja;
  };

  const LoadingSkeleton = () => (
    <div className="container py-8">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="grid lg:grid-cols-2 gap-8">
        <Skeleton className="aspect-video rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );

  const content = (
    <>
      {isLoading ? (
        <LoadingSkeleton />
      ) : !pooja ? (
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Pooja Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The pooja you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/services")}>
            Browse All Poojas
          </Button>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-b from-primary/10 to-background">
            <BackgroundPattern opacity={0.05} />
            <div className="container py-6 md:py-8">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                className="mb-4"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image */}
                <div className="relative">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden">
                    <img
                      src={getImage(pooja.image_url)}
                      alt={pooja.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {pooja.category && (
                      <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
                        {pooja.category}
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-card/90 backdrop-blur-sm capitalize">
                      {pooja.ritual_type}
                    </Badge>
                  </div>
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="icon" variant="secondary" className="bg-card/90 backdrop-blur-sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-card/90 backdrop-blur-sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h1 className="font-heading text-2xl md:text-4xl font-bold text-foreground mb-3">
                    {pooja.name}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">4.8</span>
                      <span className="text-muted-foreground">(128 reviews)</span>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6">
                    {pooja.description || "Experience the divine blessings through this sacred ritual performed by experienced priests following authentic Vedic traditions."}
                  </p>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {pooja.duration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{pooja.duration}</span>
                      </div>
                    )}
                    {pooja.guru_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-primary" />
                        <span>{pooja.guru_name}</span>
                      </div>
                    )}
                    {pooja.scheduled_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{pooja.scheduled_date}</span>
                      </div>
                    )}
                    {pooja.temple && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{pooja.temple}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Price & CTA */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Starting from</span>
                      <div className="font-heading text-3xl font-bold text-primary">
                        ₹{pooja.price?.toLocaleString() || "1,100"}
                      </div>
                    </div>
                    <Button size="lg" className="w-full sm:w-auto" asChild>
                      <Link to={`/booking/${pooja.id}`}>
                        Book This Pooja
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-8 md:py-12">
            <div className="container">
              <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-6">
                Benefits of {pooja.name}
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {defaultBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Guru Profile (if available) */}
          {pooja.guru_name && (
            <section className="py-8 md:py-12 bg-muted">
              <div className="container">
                <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-6">
                  Performing Priest
                </h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {pooja.guru_name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Vedic Scholar • 15+ Years Experience
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.9</span>
                          <span className="text-sm text-muted-foreground">(89 ceremonies)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* What's Included */}
          <section className="py-8 md:py-12">
            <div className="container">
              <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-6">
                What's Included
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: "🪔", title: "Complete Pooja Materials", desc: "All samagri & offerings" },
                  { icon: "📹", title: "Live Streaming", desc: "Watch ceremony online" },
                  { icon: "🎁", title: "Prasadam Delivery", desc: "Sacred blessings at home" },
                  { icon: "📜", title: "Digital Certificate", desc: "Participation record" },
                ].map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 text-center">
                      <span className="text-3xl mb-2 block">{item.icon}</span>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-8 md:py-12 bg-primary/5">
            <div className="container text-center">
              <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-4">
                Ready to receive divine blessings?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Book this pooja now and experience the power of authentic Vedic rituals performed by verified priests.
              </p>
              <Button size="lg" asChild>
                <Link to={`/booking/${pooja.id}`}>
                  Book {pooja.name}
                </Link>
              </Button>
            </div>
          </section>
        </>
      )}
    </>
  );

  if (isMobile) {
    return (
      <MobileLayout title={pooja?.name || "Pooja Details"} showSearch={false}>
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
