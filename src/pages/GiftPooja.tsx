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
import { Gift, Heart, Cake, Star, Leaf, ArrowRight, Phone, Video, Package, Building2, ChevronLeft, ChevronRight, User, Camera, X } from "lucide-react";
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

// Card themes based on occasion with background patterns
const cardThemes: Record<string, {
  gradient: string;
  borderColor: string;
  headerSymbol: string;
  headerText: string;
  decorations: string[];
  accentGradient: string;
  bgPattern: string;
  bgOpacity: string;
}> = {
  birthday: {
    gradient: "from-pink-50 via-purple-50 to-pink-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-pink-900/20",
    borderColor: "border-pink-400/50",
    headerSymbol: "🎂",
    headerText: "Birthday Blessings",
    decorations: ["🎈", "🎉", "✨", "🎁"],
    accentGradient: "from-pink-400/30 via-purple-400/20 to-pink-400/30",
    bgPattern: "radial-gradient(circle at 20% 30%, rgba(236,72,153,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.1) 0%, transparent 50%)",
    bgOpacity: "0.6",
  },
  anniversary: {
    gradient: "from-rose-50 via-amber-50 to-rose-100 dark:from-rose-900/20 dark:via-amber-900/20 dark:to-rose-900/20",
    borderColor: "border-rose-400/50",
    headerSymbol: "💕",
    headerText: "Anniversary Blessings",
    decorations: ["💍", "🌹", "❤️", "✨"],
    accentGradient: "from-rose-400/30 via-amber-400/20 to-rose-400/30",
    bgPattern: "radial-gradient(ellipse at 30% 20%, rgba(251,113,133,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(251,191,36,0.1) 0%, transparent 50%)",
    bgOpacity: "0.7",
  },
  health: {
    gradient: "from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-emerald-900/20",
    borderColor: "border-emerald-400/50",
    headerSymbol: "🙏",
    headerText: "Healing Blessings",
    decorations: ["🪷", "☮️", "💚", "🌿"],
    accentGradient: "from-emerald-400/30 via-teal-400/20 to-emerald-400/30",
    bgPattern: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 70%), repeating-linear-gradient(45deg, rgba(20,184,166,0.02) 0px, transparent 20px)",
    bgOpacity: "0.8",
  },
  memory: {
    gradient: "from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900/20 dark:via-blue-900/20 dark:to-slate-900/20",
    borderColor: "border-slate-400/50",
    headerSymbol: "🪔",
    headerText: "In Loving Memory",
    decorations: ["🕊️", "☁️", "🌸", "✨"],
    accentGradient: "from-slate-400/30 via-blue-400/20 to-slate-400/30",
    bgPattern: "linear-gradient(180deg, rgba(148,163,184,0.05) 0%, transparent 100%), radial-gradient(circle at 50% 100%, rgba(59,130,246,0.08) 0%, transparent 60%)",
    bgOpacity: "0.6",
  },
  blessing: {
    gradient: "from-orange-50 via-amber-50 to-orange-100 dark:from-primary/10 dark:via-accent/5 dark:to-primary/10",
    borderColor: "border-primary/40",
    headerSymbol: "ॐ",
    headerText: "Divine Blessings",
    decorations: ["🙏", "✨", "🌺", "🪷"],
    accentGradient: "from-primary/30 via-accent/20 to-primary/30",
    bgPattern: "radial-gradient(circle at 50% 0%, rgba(251,146,60,0.1) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(245,158,11,0.08) 0%, transparent 50%)",
    bgOpacity: "0.7",
  },
  other: {
    gradient: "from-violet-50 via-indigo-50 to-violet-100 dark:from-violet-900/20 dark:via-indigo-900/20 dark:to-violet-900/20",
    borderColor: "border-violet-400/50",
    headerSymbol: "🙏",
    headerText: "Special Blessings",
    decorations: ["✨", "🌟", "💫", "🪷"],
    accentGradient: "from-violet-400/30 via-indigo-400/20 to-violet-400/30",
    bgPattern: "radial-gradient(ellipse at 40% 40%, rgba(139,92,246,0.1) 0%, transparent 60%), radial-gradient(circle at 60% 60%, rgba(99,102,241,0.08) 0%, transparent 50%)",
    bgOpacity: "0.6",
  },
};

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
  
  // Photo upload state
  const [senderImage, setSenderImage] = useState<string | null>(null);
  const [recipientImage, setRecipientImage] = useState<string | null>(null);

  // Photo upload handlers
  const handleSenderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSenderImage(url);
    }
  };

  const handleRecipientImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRecipientImage(url);
    }
  };

  const removeSenderImage = () => setSenderImage(null);
  const removeRecipientImage = () => setRecipientImage(null);

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
      {/* Hero Carousel Section - Reduced Height */}
      <section className="relative overflow-hidden">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex">
            {bannerSlides.map((slide, index) => (
              <div key={index} className="embla__slide flex-[0_0_100%] min-w-0 relative">
                <div className="relative h-[260px] md:h-[320px]">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4 max-w-3xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-medium mb-3 backdrop-blur-sm">
                        <Gift className="h-3 w-3" />
                        Gift a Blessing
                      </div>
                      <h1 className="font-heading text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                        {slide.title}
                      </h1>
                      <p className="text-sm md:text-lg text-white/90">
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
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button 
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        
        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                selectedIndex === index ? "bg-white w-6" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Compact Process Steps Section */}
      <section className="py-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
            {giftSteps.map((step, index) => (
              <div key={step.step} className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {step.step}
                  </div>
                  <step.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs md:text-sm font-medium text-foreground">{step.title}</span>
                </div>
                {index < giftSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-10 bg-muted">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-card p-6 md:p-8 rounded-2xl border border-border space-y-6">
              
              {/* Step 1: Pooja & Occasion */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Select Pooja & Occasion</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Select Pooja */}
                  <div className="space-y-2">
                    <Label htmlFor="service">Choose Pooja *</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pooja" />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - ₹{Number(service.price).toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Price Display */}
                  {selectedServiceData && (
                    <div className="flex items-center justify-center p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Gift Amount</p>
                        <p className="font-heading text-2xl font-bold text-primary">₹{Number(selectedServiceData.price).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Select Occasion */}
                <div className="space-y-2">
                  <Label>Select Occasion *</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {occasions.map((occ) => (
                      <button
                        key={occ.value}
                        type="button"
                        onClick={() => setOccasion(occ.value)}
                        className={`p-2 rounded-lg border transition-all text-center ${
                          occasion === occ.value
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <occ.icon className={`h-4 w-4 mx-auto mb-0.5 ${occasion === occ.value ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-[10px] md:text-xs font-medium block">{occ.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Gift Card */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Personalize Gift Card</h3>
                </div>
                
                {/* Template Selection Gallery */}
                <div className="space-y-2">
                  <Label className="text-sm">Choose Card Design</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {Object.entries(cardThemes).map(([key, theme]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setOccasion(key)}
                        className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                          occasion === key ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div 
                          className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`}
                          style={{ backgroundImage: theme.bgPattern }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl">{theme.headerSymbol}</span>
                          <span className="text-[8px] md:text-[10px] font-medium mt-1 text-foreground/80 px-1 text-center leading-tight">
                            {theme.headerText.split(' ')[0]}
                          </span>
                        </div>
                        {occasion === key && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Names in compact row */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="senderName" className="text-sm">From (Your Name) *</Label>
                    <Input
                      id="senderName"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="recipientName" className="text-sm">To (Recipient) *</Label>
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Recipient's name"
                      required
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Personal Greeting */}
                <div className="space-y-1">
                  <Label htmlFor="senderMessage" className="text-sm">Your Blessing Message</Label>
                  <Textarea
                    id="senderMessage"
                    value={senderMessage}
                    onChange={(e) => setSenderMessage(e.target.value)}
                    placeholder="Write a heartfelt blessing..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {/* Themed Gift Card Preview */}
                {(() => {
                  const theme = cardThemes[occasion] || cardThemes.blessing;
                  return (
                    <div 
                      className={`relative overflow-hidden rounded-xl border-2 ${theme.borderColor} bg-gradient-to-br ${theme.gradient} shadow-lg`}
                      style={{ backgroundImage: theme.bgPattern }}
                    >
                      {/* Floating Decorations */}
                      <div className="absolute top-2 left-2 text-xl opacity-40">{theme.decorations[0]}</div>
                      <div className="absolute top-2 right-2 text-xl opacity-40">{theme.decorations[1]}</div>
                      <div className="absolute bottom-12 left-2 text-lg opacity-30">{theme.decorations[2]}</div>
                      <div className="absolute bottom-12 right-2 text-lg opacity-30">{theme.decorations[3]}</div>
                      
                      {/* Header with themed symbol */}
                      <div className="text-center pt-4 pb-2 border-b border-current/10">
                        <span className="text-3xl drop-shadow-sm">{theme.headerSymbol}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-wider uppercase">{theme.headerText}</p>
                      </div>
                      
                      {/* From/To Section with Photo Upload */}
                      <div className="p-4 flex items-center justify-between gap-3">
                        {/* Sender with Photo Upload */}
                        <div className="flex-1 text-center">
                          <div className="relative w-16 h-16 mx-auto">
                            <div className="w-16 h-16 rounded-full border-3 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-md overflow-hidden">
                              {senderImage ? (
                                <img src={senderImage} alt="Sender" className="w-full h-full object-cover" />
                              ) : (
                                <User className="h-8 w-8 text-primary" />
                              )}
                            </div>
                            {senderImage ? (
                              <button
                                type="button"
                                onClick={removeSenderImage}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            ) : (
                              <label className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md cursor-pointer hover:bg-primary/90 transition-colors">
                                <Camera className="h-3 w-3" />
                                <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleSenderImageUpload} />
                              </label>
                            )}
                          </div>
                          <p className="mt-2 text-[10px] font-semibold text-primary uppercase tracking-wide">From</p>
                          <p className="font-heading text-sm font-bold text-foreground">{senderName || "Your Name"}</p>
                        </div>
                        
                        {/* Decorative Gift/Arrow */}
                        <div className="flex flex-col items-center px-1">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Gift className="h-5 w-5 text-primary" />
                          </div>
                          <ArrowRight className="h-3 w-3 text-primary mt-1" />
                        </div>
                        
                        {/* Recipient with Photo Upload */}
                        <div className="flex-1 text-center">
                          <div className="relative w-16 h-16 mx-auto">
                            <div className="w-16 h-16 rounded-full border-3 border-accent/40 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shadow-md overflow-hidden">
                              {recipientImage ? (
                                <img src={recipientImage} alt="Recipient" className="w-full h-full object-cover" />
                              ) : (
                                <User className="h-8 w-8 text-accent-foreground" />
                              )}
                            </div>
                            {recipientImage ? (
                              <button
                                type="button"
                                onClick={removeRecipientImage}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            ) : (
                              <label className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md cursor-pointer hover:bg-accent/90 transition-colors">
                                <Camera className="h-3 w-3" />
                                <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleRecipientImageUpload} />
                              </label>
                            )}
                          </div>
                          <p className="mt-2 text-[10px] font-semibold text-accent-foreground uppercase tracking-wide">To</p>
                          <p className="font-heading text-sm font-bold text-foreground">{recipientName || "Recipient"}</p>
                        </div>
                      </div>
                      
                      {/* Message Area */}
                      <div className="px-4 pb-3">
                        <div className="p-3 bg-white/60 dark:bg-background/40 backdrop-blur-sm rounded-lg border border-current/10">
                          <p className="text-center italic text-xs text-muted-foreground leading-relaxed">
                            "{senderMessage || 'May divine blessings bring peace and happiness...'}"
                          </p>
                        </div>
                      </div>
                      
                      {/* Footer with Pooja */}
                      <div className="px-4 pb-4 flex items-center justify-center">
                        {selectedServiceData && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-sm">
                            🙏 {selectedServiceData.name}
                          </span>
                        )}
                      </div>
                      
                      {/* Decorative Bottom Border */}
                      <div className={`h-1.5 bg-gradient-to-r ${theme.accentGradient}`} />
                    </div>
                  );
                })()}
              </div>

              {/* Step 3: Recipient Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">Delivery Details</h3>
                </div>
                
                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="recipientEmail" className="text-sm">Recipient Email</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="For gift notification"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="recipientPhone" className="text-sm">Recipient Phone</Label>
                    <Input
                      id="recipientPhone"
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="For WhatsApp notification"
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Prasadam Delivery */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm">Send Prasadam</Label>
                    <p className="text-xs text-muted-foreground">Deliver blessed prasadam to doorstep</p>
                  </div>
                  <Switch checked={sendPrasadam} onCheckedChange={setSendPrasadam} />
                </div>

                {/* Recipient Address */}
                {sendPrasadam && (
                  <div className="space-y-1">
                    <Label htmlFor="recipientAddress" className="text-sm">Delivery Address</Label>
                    <Textarea
                      id="recipientAddress"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="Complete address for prasadam delivery"
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                )}

                {/* Additional Notes */}
                <div className="space-y-1">
                  <Label htmlFor="message" className="text-sm">Additional Notes (Optional)</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Any special instructions"
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : (
                  <>
                    Gift This Pooja
                    {selectedServiceData && (
                      <span className="ml-2 px-2 py-0.5 bg-primary-foreground/20 rounded text-sm">
                        ₹{Number(selectedServiceData.price).toLocaleString()}
                      </span>
                    )}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
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
