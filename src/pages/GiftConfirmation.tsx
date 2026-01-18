import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Calendar, MapPin, Copy, MessageCircle, CheckCircle, Loader2, Download, Heart, Cake, HeartPulse, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { CardPreview, CardPreviewHandle } from "./gift-pooja/CardPreview";

// Card themes for different occasions
const cardThemes: Record<string, {
  gradient: string;
  borderColor: string;
  headerSymbol: string;
  headerText: string;
  decorations: string[];
  accentGradient: string;
}> = {
  birthday: {
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    borderColor: "border-pink-400/50",
    headerSymbol: "🎂",
    headerText: "Birthday Blessings",
    decorations: ["🎈", "🎊", "✨", "🌟"],
    accentGradient: "from-pink-400 to-purple-500",
  },
  health: {
    gradient: "from-green-500 via-teal-500 to-cyan-500",
    borderColor: "border-green-400/50",
    headerSymbol: "💚",
    headerText: "Healing Wishes",
    decorations: ["🌿", "🍀", "💫", "🌸"],
    accentGradient: "from-green-400 to-teal-500",
  },
  anniversary: {
    gradient: "from-rose-500 via-red-500 to-orange-500",
    borderColor: "border-rose-400/50",
    headerSymbol: "💕",
    headerText: "Anniversary Love",
    decorations: ["💝", "🌹", "💖", "🕊️"],
    accentGradient: "from-rose-400 to-red-500",
  },
  memory: {
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    borderColor: "border-amber-400/50",
    headerSymbol: "🕯️",
    headerText: "In Loving Memory",
    decorations: ["🙏", "🪔", "✨", "🌺"],
    accentGradient: "from-amber-400 to-orange-500",
  },
  blessing: {
    gradient: "from-primary via-accent to-secondary",
    borderColor: "border-primary/50",
    headerSymbol: "🙏",
    headerText: "Divine Blessings",
    decorations: ["🕉️", "🪔", "✨", "🌸"],
    accentGradient: "from-primary to-accent",
  },
};

// Gift templates
const giftTemplates = [
  {
    id: "traditional",
    name: "Traditional Temple",
    preview: "🕉️",
    background: "from-amber-600/80 to-orange-700/80",
    overlay: "bg-gradient-to-b from-transparent via-black/20 to-black/40",
    pattern: "url(\"data:image/svg+xml,...\")",
    decorIcon: "🪔",
    image: "/placeholder.svg",
  },
];

// Occasions for icon mapping
const occasions = [
  { value: "birthday", label: "Birthday Blessings", icon: Cake },
  { value: "health", label: "Health & Recovery", icon: HeartPulse },
  { value: "anniversary", label: "Anniversary", icon: Heart },
  { value: "memory", label: "In Memory Of", icon: Sparkles },
  { value: "blessing", label: "General Blessing", icon: Gift },
];

const GiftConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const cardRef = useRef<CardPreviewHandle>(null);

  const { data: giftBooking, isLoading, error } = useQuery({
    queryKey: ["gift-booking", id],
    queryFn: async () => {
      if (!id) throw new Error("No gift ID provided");
      
      // First fetch gift booking
      const { data: booking, error: bookingError } = await supabase
        .from("gift_bookings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (bookingError) throw bookingError;
      if (!booking) throw new Error("Gift not found");

      // Then fetch the service
      let service = null;
      if (booking.service_id) {
        const { data: serviceData } = await supabase
          .from("pooja_services")
          .select("name, temple, image_url, description")
          .eq("id", booking.service_id)
          .maybeSingle();
        service = serviceData;
      }

      return { ...booking, service };
    },
    enabled: !!id,
  });

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Share this link with the recipient" });
  };

  const handleWhatsAppShare = () => {
    const message = `🙏 You've received a divine blessing!\n\nFrom: ${extractSenderName(giftBooking?.message)}\nPooja: ${giftBooking?.service?.name}\n\nView your gift: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const extractSenderName = (message: string | null) => {
    if (!message) return "A well-wisher";
    const match = message.match(/From: (.+?)(\n|$)/);
    return match ? match[1] : "A well-wisher";
  };

  const extractPersonalMessage = (message: string | null) => {
    if (!message) return null;
    const lines = message.split("\n").filter((l) => l.trim());
    const msgIndex = lines.findIndex((l) => !l.startsWith("From:") && !l.startsWith("Message:") && !l.startsWith("Additional Note:"));
    if (msgIndex > 0 && lines[msgIndex]) {
      return lines.slice(msgIndex).join("\n").trim();
    }
    return null;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getOccasionEmoji = (occasion: string | null) => {
    switch (occasion) {
      case "birthday":
        return "🎂";
      case "health":
        return "💚";
      case "anniversary":
        return "💕";
      case "memory":
        return "🕯️";
      case "blessing":
        return "🙏";
      default:
        return "🎁";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !giftBooking) {
    const content = (
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8">
            <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Gift Not Found</h2>
            <p className="text-muted-foreground">
              This gift link may have expired or doesn't exist.
            </p>
          </CardContent>
        </Card>
      </main>
    );

    if (isMobile) {
      return <MobileLayout showHeader={true}>{content}</MobileLayout>;
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        {content}
        <Footer />
      </div>
    );
  }

  const senderName = extractSenderName(giftBooking.message);
  const personalMessage = extractPersonalMessage(giftBooking.message);

  // Get the selected occasion data
  const selectedOccasion = occasions.find(o => o.value === giftBooking.occasion) || occasions[4]; // Default to blessing

  const content = (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Gift Card Preview with Download */}
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Your Gift Card
            </h2>
            <CardPreview
              ref={cardRef}
              occasion={giftBooking.occasion || "blessing"}
              cardThemes={cardThemes}
              giftTemplates={giftTemplates}
              selectedTemplate="traditional"
              customBackground={null}
              senderName={senderName}
              recipientName={giftBooking.recipient_name}
              senderImage={null}
              recipientImage={null}
              senderMessage={personalMessage || "May divine blessings shower upon you..."}
              selectedServiceData={giftBooking.service ? { name: giftBooking.service.name, price: giftBooking.amount || 0 } : undefined}
              selectedOccasion={selectedOccasion}
              showDownloadButton={true}
            />
          </div>

          {/* Right: Gift Details */}
          <div>
            <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
              <CardContent className="p-6 md:p-8">
                {/* Gift Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getOccasionEmoji(giftBooking.occasion)}</span>
                    <Badge className={getStatusColor(giftBooking.status)}>
                      {giftBooking.status || "Pending"}
                    </Badge>
                  </div>
                  {giftBooking.send_prasadam && (
                    <Badge variant="outline">Prasadam Included</Badge>
                  )}
                </div>

                {/* Gift Header */}
                <div className="text-center mb-8">
                  <p className="text-sm text-muted-foreground mb-2">You've received a blessing from</p>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-4">
                    {senderName}
                  </h1>
                  {personalMessage && (
                    <blockquote className="italic text-muted-foreground text-lg border-l-4 border-primary/30 pl-4 text-left">
                      "{personalMessage}"
                    </blockquote>
                  )}
                </div>

                {/* Pooja Details */}
                <div className="bg-card rounded-xl p-6 border border-border mb-6">
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    Your Gift Pooja
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pooja</p>
                      <p className="font-semibold text-foreground text-lg">{giftBooking.service?.name}</p>
                    </div>
                    
                    {giftBooking.service?.temple && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Temple</p>
                          <p className="text-foreground">{giftBooking.service.temple}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Booked On</p>
                        <p className="text-foreground">
                          {format(new Date(giftBooking.booking_date), "MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {giftBooking.service?.description && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">About this Pooja</p>
                        <p className="text-sm text-foreground">{giftBooking.service.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* For Recipient */}
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      For {giftBooking.recipient_name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This pooja is being performed in your name. May divine blessings be upon you! 🙏
                  </p>
                </div>

                {/* Share Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleCopyLink} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button onClick={handleWhatsAppShare} className="flex-1 bg-green-600 hover:bg-green-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Share on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Questions? Contact us at contact@vedhamantra.com
        </p>
      </div>
    </main>
  );

  if (isMobile) {
    return <MobileLayout showHeader={true}>{content}</MobileLayout>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {content}
      <Footer />
    </div>
  );
};

export default GiftConfirmation;
