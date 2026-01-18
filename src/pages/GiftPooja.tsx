import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Heart, Cake, Star, Leaf, ArrowRight, Phone, Video, Package, Building2, ChevronLeft, ChevronRight, User } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Import images
import heroTemple from "@/assets/hero-temple.jpg";
import ritualHomam from "@/assets/ritual-homam.jpg";
import ritualPooja from "@/assets/ritual-pooja.jpg";
import ritualLakshmi from "@/assets/ritual-lakshmi.jpg";

const occasions = [
  { value: "birthday", label: "Birthday", icon: Cake },
  { value: "health", label: "Health & Recovery", icon: Heart },
  { value: "anniversary", label: "Anniversary", icon: Star },
  { value: "memory", label: "In Memory", icon: Leaf },
  { value: "blessing", label: "General Blessing", icon: Gift },
  { value: "other", label: "Other", icon: Gift },
];

const bannerSlides = [
  {
    image: heroTemple,
    title: "Gift Divine Blessings",
    subtitle: "Share spiritual grace with your loved ones"
  },
  {
    image: ritualHomam,
    title: "Celebrate Special Moments",
    subtitle: "Birthday, Anniversary, or Health - every occasion blessed"
  },
  {
    image: ritualPooja,
    title: "Traditional Rituals",
    subtitle: "Authentic poojas performed by verified priests"
  },
  {
    image: ritualLakshmi,
    title: "Prasadam Delivery",
    subtitle: "Sacred offerings delivered to their doorstep"
  }
];

const giftSteps = [
  { step: 1, title: "Pick blessing & temple", icon: Building2, description: "Choose pooja and temple" },
  { step: 2, title: "Concierge call", icon: Phone, description: "We confirm details with you" },
  { step: 3, title: "Ritual & updates", icon: Video, description: "Live updates during pooja" },
  { step: 4, title: "Gift dispatch", icon: Package, description: "Prasadam delivered to recipient" }
];

const GiftPooja = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedService, setSelectedService] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [occasion, setOccasion] = useState("");
  const [message, setMessage] = useState("");
  const [sendPrasadam, setSendPrasadam] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for sender details
  const [senderName, setSenderName] = useState("");
  const [senderMessage, setSenderMessage] = useState("");

  // Embla carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const { data: services = [] } = useQuery({
    queryKey: ["active-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pooja_services")
        .select("id, name, price")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const selectedServiceData = services.find((s) => s.id === selectedService);
  const selectedOccasion = occasions.find(o => o.value === occasion);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to gift a pooja.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!selectedService || !recipientName || !occasion || !senderName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields including your name and occasion.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fullMessage = senderMessage 
        ? `From: ${senderName}\n\n${senderMessage}${message ? `\n\nAdditional Note: ${message}` : ''}`
        : `From: ${senderName}${message ? `\n\nMessage: ${message}` : ''}`;

      const { error } = await supabase.from("gift_bookings").insert({
        user_id: user.id,
        service_id: selectedService,
        recipient_name: recipientName,
        recipient_email: recipientEmail || null,
        recipient_phone: recipientPhone || null,
        recipient_address: sendPrasadam ? recipientAddress : null,
        occasion,
        message: fullMessage,
        booking_date: new Date().toISOString().split("T")[0],
        amount: selectedServiceData?.price || 0,
        send_prasadam: sendPrasadam,
      });

      if (error) throw error;

      toast({
        title: "Gift booking created!",
        description: "We'll process your gift pooja and notify the recipient.",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create gift booking.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative overflow-hidden">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex">
            {bannerSlides.map((slide, index) => (
              <div key={index} className="embla__slide flex-[0_0_100%] min-w-0 relative">
                <div className="relative h-[400px] md:h-[500px]">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4 max-w-3xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-4 backdrop-blur-sm">
                        <Gift className="h-4 w-4" />
                        Gift a Blessing
                      </div>
                      <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-xl text-white/90">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Carousel Controls */}
        <button 
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                selectedIndex === index ? "bg-white w-8" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
            How Gift Pooja Works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {giftSteps.map((step, index) => (
              <div key={step.step} className="relative text-center">
                {/* Connector Line */}
                {index < giftSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-primary/30" />
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-4">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-1">Step {step.step}</div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-muted">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl border border-border space-y-6">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                Gift Details
              </h2>

              {/* Select Pooja */}
              <div className="space-y-2">
                <Label htmlFor="service">Select Pooja *</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pooja" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - Rs {Number(service.price).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Occasion - MOVED HERE */}
              <div className="space-y-2">
                <Label>Select an Occasion *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {occasions.map((occ) => (
                    <button
                      key={occ.value}
                      type="button"
                      onClick={() => setOccasion(occ.value)}
                      className={`p-3 rounded-xl border transition-all text-center ${
                        occasion === occ.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <occ.icon className={`h-5 w-5 mx-auto mb-1 ${occasion === occ.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-xs font-medium">{occ.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Gift Card Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  Gift Card
                </h3>
                
                {/* From (Sender) */}
                <div className="space-y-2">
                  <Label htmlFor="senderName">From (Your Name) *</Label>
                  <Input
                    id="senderName"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                {/* To (Recipient) */}
                <div className="space-y-2">
                  <Label htmlFor="recipientName">To (Recipient Name) *</Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient's full name"
                    required
                  />
                </div>

                {/* Personal Greeting */}
                <div className="space-y-2">
                  <Label htmlFor="senderMessage">Your Blessing Message</Label>
                  <Textarea
                    id="senderMessage"
                    value={senderMessage}
                    onChange={(e) => setSenderMessage(e.target.value)}
                    placeholder="Write a heartfelt blessing for the recipient..."
                    rows={3}
                  />
                </div>

                {/* Decorative Gift Card - Greeting Card Style */}
                <div className="relative overflow-hidden rounded-2xl border-4 border-double border-primary/40 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-primary/10 dark:via-accent/5 dark:to-primary/10 shadow-xl">
                  {/* Decorative Corner Elements */}
                  <div className="absolute top-0 left-0 w-16 h-16">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-primary/30">
                      <path d="M0,0 Q50,0 50,50 Q50,0 100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="15" cy="15" r="8" fill="currentColor"/>
                      <circle cx="8" cy="25" r="4" fill="currentColor"/>
                      <circle cx="25" cy="8" r="4" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="absolute top-0 right-0 w-16 h-16 rotate-90">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-primary/30">
                      <path d="M0,0 Q50,0 50,50 Q50,0 100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="15" cy="15" r="8" fill="currentColor"/>
                      <circle cx="8" cy="25" r="4" fill="currentColor"/>
                      <circle cx="25" cy="8" r="4" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 -rotate-90">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-primary/30">
                      <path d="M0,0 Q50,0 50,50 Q50,0 100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="15" cy="15" r="8" fill="currentColor"/>
                      <circle cx="8" cy="25" r="4" fill="currentColor"/>
                      <circle cx="25" cy="8" r="4" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 rotate-180">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-primary/30">
                      <path d="M0,0 Q50,0 50,50 Q50,0 100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="15" cy="15" r="8" fill="currentColor"/>
                      <circle cx="8" cy="25" r="4" fill="currentColor"/>
                      <circle cx="25" cy="8" r="4" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  {/* Header with Om symbol */}
                  <div className="text-center pt-6 pb-3 border-b border-primary/20">
                    <span className="text-4xl text-primary drop-shadow-sm">ॐ</span>
                    <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wider uppercase">Divine Blessings</p>
                  </div>
                  
                  {/* From/To Section */}
                  <div className="p-6 flex items-center justify-between gap-4">
                    {/* Sender */}
                    <div className="flex-1 text-center">
                      <div className="w-20 h-20 mx-auto rounded-full border-4 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                      <p className="mt-3 text-xs font-semibold text-primary uppercase tracking-wide">From</p>
                      <p className="font-heading text-lg font-bold text-foreground mt-1">{senderName || "Your Name"}</p>
                    </div>
                    
                    {/* Decorative Gift/Arrow */}
                    <div className="flex flex-col items-center px-2">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Gift className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-primary/50" />
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <div className="w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                      </div>
                    </div>
                    
                    {/* Recipient */}
                    <div className="flex-1 text-center">
                      <div className="w-20 h-20 mx-auto rounded-full border-4 border-accent/40 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shadow-lg">
                        <User className="h-10 w-10 text-accent-foreground" />
                      </div>
                      <p className="mt-3 text-xs font-semibold text-accent-foreground uppercase tracking-wide">To</p>
                      <p className="font-heading text-lg font-bold text-foreground mt-1">{recipientName || "Recipient"}</p>
                    </div>
                  </div>
                  
                  {/* Message Area */}
                  <div className="px-6 pb-4">
                    <div className="p-4 bg-white/60 dark:bg-background/40 backdrop-blur-sm rounded-xl border border-primary/10 shadow-inner">
                      <p className="text-center italic text-muted-foreground leading-relaxed">
                        "{senderMessage || 'May divine blessings shower upon you and bring peace, prosperity, and happiness to your life...'}"
                      </p>
                    </div>
                  </div>
                  
                  {/* Footer with Pooja & Occasion */}
                  <div className="px-6 pb-6 flex flex-wrap items-center justify-center gap-3">
                    {selectedServiceData && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-md">
                        🙏 {selectedServiceData.name}
                      </span>
                    )}
                    {selectedOccasion && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-foreground text-sm font-medium border border-accent/30">
                        <selectedOccasion.icon className="h-4 w-4" />
                        {selectedOccasion.label}
                      </span>
                    )}
                  </div>
                  
                  {/* Decorative Bottom Border */}
                  <div className="h-2 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30" />
                </div>
              </div>

              {/* Recipient Contact */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="For gift notification"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">Recipient Phone</Label>
                  <Input
                    id="recipientPhone"
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="For WhatsApp notification"
                  />
                </div>
              </div>

              {/* Prasadam Delivery */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label>Send Prasadam to Recipient</Label>
                  <p className="text-sm text-muted-foreground">
                    Deliver blessed prasadam to their doorstep
                  </p>
                </div>
                <Switch
                  checked={sendPrasadam}
                  onCheckedChange={setSendPrasadam}
                />
              </div>

              {/* Recipient Address */}
              {sendPrasadam && (
                <div className="space-y-2">
                  <Label htmlFor="recipientAddress">Delivery Address</Label>
                  <Textarea
                    id="recipientAddress"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Complete address for prasadam delivery"
                    rows={3}
                  />
                </div>
              )}

              {/* Additional Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Additional Notes (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any special instructions or requests"
                  rows={3}
                />
              </div>

              {/* Summary */}
              {selectedServiceData && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Gift Amount</span>
                    <span className="font-heading text-2xl font-bold text-primary">
                      Rs {Number(selectedServiceData.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Gift This Pooja"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
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
    <div className="min-h-screen">
      <Header />
      <main>{content}</main>
      <Footer />
    </div>
  );
};

export default GiftPooja;
