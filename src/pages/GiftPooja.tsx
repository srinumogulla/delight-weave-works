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
import { Gift, Heart, Cake, Star, Leaf, ArrowRight, Phone, Video, Package, Building2, ChevronLeft, ChevronRight, User, Camera, X, Upload, Image, Sparkles } from "lucide-react";
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

// Card themes based on occasion
const cardThemes: Record<string, {
  gradient: string;
  borderColor: string;
  headerSymbol: string;
  headerText: string;
  decorations: string[];
  accentGradient: string;
}> = {
  birthday: {
    gradient: "from-pink-50 via-purple-50 to-pink-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-pink-900/20",
    borderColor: "border-pink-400/50",
    headerSymbol: "🎂",
    headerText: "Birthday Blessings",
    decorations: ["🎈", "🎉", "✨", "🎁"],
    accentGradient: "from-pink-400/30 via-purple-400/20 to-pink-400/30",
  },
  anniversary: {
    gradient: "from-rose-50 via-amber-50 to-rose-100 dark:from-rose-900/20 dark:via-amber-900/20 dark:to-rose-900/20",
    borderColor: "border-rose-400/50",
    headerSymbol: "💕",
    headerText: "Anniversary Blessings",
    decorations: ["💍", "🌹", "❤️", "✨"],
    accentGradient: "from-rose-400/30 via-amber-400/20 to-rose-400/30",
  },
  health: {
    gradient: "from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-emerald-900/20",
    borderColor: "border-emerald-400/50",
    headerSymbol: "🙏",
    headerText: "Healing Blessings",
    decorations: ["🪷", "☮️", "💚", "🌿"],
    accentGradient: "from-emerald-400/30 via-teal-400/20 to-emerald-400/30",
  },
  memory: {
    gradient: "from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900/20 dark:via-blue-900/20 dark:to-slate-900/20",
    borderColor: "border-slate-400/50",
    headerSymbol: "🪔",
    headerText: "In Loving Memory",
    decorations: ["🕊️", "☁️", "🌸", "✨"],
    accentGradient: "from-slate-400/30 via-blue-400/20 to-slate-400/30",
  },
  blessing: {
    gradient: "from-orange-50 via-amber-50 to-orange-100 dark:from-primary/10 dark:via-accent/5 dark:to-primary/10",
    borderColor: "border-primary/40",
    headerSymbol: "ॐ",
    headerText: "Divine Blessings",
    decorations: ["🙏", "✨", "🌺", "🪷"],
    accentGradient: "from-primary/30 via-accent/20 to-primary/30",
  },
  other: {
    gradient: "from-violet-50 via-indigo-50 to-violet-100 dark:from-violet-900/20 dark:via-indigo-900/20 dark:to-violet-900/20",
    borderColor: "border-violet-400/50",
    headerSymbol: "🙏",
    headerText: "Special Blessings",
    decorations: ["✨", "🌟", "💫", "🪷"],
    accentGradient: "from-violet-400/30 via-indigo-400/20 to-violet-400/30",
  },
};

// Gift card templates with visual styles
const giftTemplates = [
  {
    id: "classic",
    name: "Classic Divine",
    preview: "from-orange-100 via-amber-50 to-orange-100",
    background: "from-orange-50 via-amber-50/80 to-orange-100",
    overlay: "from-orange-900/20 to-amber-900/10",
    pattern: "radial-gradient(circle at 20% 80%, rgba(234,179,8,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(234,88,12,0.1) 0%, transparent 50%)",
    decorIcon: "🕉️",
  },
  {
    id: "celebration",
    name: "Festive Joy",
    preview: "from-pink-100 via-purple-50 to-pink-100",
    background: "from-pink-50 via-purple-50/80 to-pink-100",
    overlay: "from-pink-900/20 to-purple-900/10",
    pattern: "radial-gradient(circle at 30% 70%, rgba(236,72,153,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(168,85,247,0.1) 0%, transparent 50%)",
    decorIcon: "🎉",
  },
  {
    id: "love",
    name: "Eternal Love",
    preview: "from-rose-100 via-red-50 to-rose-100",
    background: "from-rose-50 via-red-50/80 to-rose-100",
    overlay: "from-rose-900/20 to-red-900/10",
    pattern: "radial-gradient(circle at 25% 75%, rgba(244,63,94,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(225,29,72,0.1) 0%, transparent 50%)",
    decorIcon: "💕",
  },
  {
    id: "healing",
    name: "Healing Light",
    preview: "from-emerald-100 via-teal-50 to-emerald-100",
    background: "from-emerald-50 via-teal-50/80 to-emerald-100",
    overlay: "from-emerald-900/20 to-teal-900/10",
    pattern: "radial-gradient(circle at 40% 60%, rgba(16,185,129,0.1) 0%, transparent 50%), radial-gradient(circle at 60% 40%, rgba(20,184,166,0.1) 0%, transparent 50%)",
    decorIcon: "🪷",
  },
  {
    id: "sacred",
    name: "Sacred Memory",
    preview: "from-slate-100 via-blue-50 to-slate-100",
    background: "from-slate-50 via-blue-50/80 to-slate-100",
    overlay: "from-slate-900/20 to-blue-900/10",
    pattern: "radial-gradient(circle at 35% 65%, rgba(100,116,139,0.1) 0%, transparent 50%), radial-gradient(circle at 65% 35%, rgba(59,130,246,0.1) 0%, transparent 50%)",
    decorIcon: "🪔",
  },
  {
    id: "royal",
    name: "Royal Blessing",
    preview: "from-violet-100 via-indigo-50 to-violet-100",
    background: "from-violet-50 via-indigo-50/80 to-violet-100",
    overlay: "from-violet-900/20 to-indigo-900/10",
    pattern: "radial-gradient(circle at 45% 55%, rgba(139,92,246,0.1) 0%, transparent 50%), radial-gradient(circle at 55% 45%, rgba(99,102,241,0.1) 0%, transparent 50%)",
    decorIcon: "👑",
  },
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
  
  // Photo upload state
  const [senderImage, setSenderImage] = useState<string | null>(null);
  const [recipientImage, setRecipientImage] = useState<string | null>(null);
  
  // Template selection state
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [customBackground, setCustomBackground] = useState<string | null>(null);

  // Custom background upload handler
  const handleCustomBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomBackground(url);
      setSelectedTemplate("custom");
    }
  };

  const removeCustomBackground = () => {
    setCustomBackground(null);
    setSelectedTemplate("classic");
  };

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
                  Gift Card Design
                </h3>
                
                {/* Template Selection */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Choose Card Template
                  </Label>
                  <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin">
                    {giftTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setCustomBackground(null);
                        }}
                        className={`flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          selectedTemplate === template.id 
                            ? "border-primary ring-2 ring-primary/30 scale-105" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className={`w-full h-full bg-gradient-to-br ${template.preview} flex flex-col items-center justify-center p-2`}>
                          <span className="text-2xl mb-1">{template.decorIcon}</span>
                          <span className="text-[10px] font-medium text-foreground/70 text-center leading-tight">{template.name}</span>
                        </div>
                      </button>
                    ))}
                    
                    {/* Custom Upload Option */}
                    {customBackground ? (
                      <div className="relative flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden border-2 border-primary ring-2 ring-primary/30">
                        <img src={customBackground} alt="Custom" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={removeCustomBackground}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex-shrink-0 w-20 h-28 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/50">
                        <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-[10px] font-medium text-muted-foreground text-center">Upload<br/>Custom</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleCustomBackgroundUpload} />
                      </label>
                    )}
                  </div>
                </div>
                
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

                {/* Gift Card Preview */}
                {(() => {
                  const theme = cardThemes[occasion] || cardThemes.blessing;
                  const template = giftTemplates.find(t => t.id === selectedTemplate) || giftTemplates[0];
                  const useCustomBg = selectedTemplate === "custom" && customBackground;
                  
                  return (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-primary" />
                        Card Preview
                      </Label>
                      <div 
                        className={`relative overflow-hidden rounded-2xl border-4 border-double ${theme.borderColor} shadow-xl`}
                        style={useCustomBg ? {
                          backgroundImage: `url(${customBackground})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        } : undefined}
                      >
                        {/* Template Background */}
                        {!useCustomBg && (
                          <div 
                            className={`absolute inset-0 bg-gradient-to-br ${template.background}`}
                            style={{ backgroundImage: template.pattern }}
                          />
                        )}
                        
                        {/* Overlay for custom backgrounds */}
                        {useCustomBg && (
                          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                        )}
                        
                        {/* Floating Decorations */}
                        <div className="absolute top-3 left-3 text-2xl opacity-40">{theme.decorations[0]}</div>
                        <div className="absolute top-3 right-3 text-2xl opacity-40">{theme.decorations[1]}</div>
                        <div className="absolute bottom-16 left-3 text-xl opacity-30">{theme.decorations[2]}</div>
                        <div className="absolute bottom-16 right-3 text-xl opacity-30">{theme.decorations[3]}</div>
                        
                        {/* Decorative Corner Elements */}
                        <div className="absolute top-0 left-0 w-16 h-16">
                          <svg viewBox="0 0 100 100" className="w-full h-full text-current opacity-20">
                            <path d="M0,0 Q50,0 50,50 Q50,0 100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="15" cy="15" r="8" fill="currentColor"/>
                            <circle cx="8" cy="25" r="4" fill="currentColor"/>
                            <circle cx="25" cy="8" r="4" fill="currentColor"/>
                          </svg>
                        </div>
                        <div className="absolute top-0 right-0 w-16 h-16 rotate-90">
                          <svg viewBox="0 0 100 100" className="w-full h-full text-current opacity-20">
                            <path d="M0,0 Q50,0 50,50 Q50,0 100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="15" cy="15" r="8" fill="currentColor"/>
                            <circle cx="8" cy="25" r="4" fill="currentColor"/>
                            <circle cx="25" cy="8" r="4" fill="currentColor"/>
                          </svg>
                        </div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 -rotate-90">
                          <svg viewBox="0 0 100 100" className="w-full h-full text-current opacity-20">
                            <path d="M0,0 Q50,0 50,50 Q50,0 100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="15" cy="15" r="8" fill="currentColor"/>
                            <circle cx="8" cy="25" r="4" fill="currentColor"/>
                            <circle cx="25" cy="8" r="4" fill="currentColor"/>
                          </svg>
                        </div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 rotate-180">
                          <svg viewBox="0 0 100 100" className="w-full h-full text-current opacity-20">
                            <path d="M0,0 Q50,0 50,50 Q50,0 100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="15" cy="15" r="8" fill="currentColor"/>
                            <circle cx="8" cy="25" r="4" fill="currentColor"/>
                            <circle cx="25" cy="8" r="4" fill="currentColor"/>
                          </svg>
                        </div>
                        
                        {/* Header with themed symbol */}
                        <div className="relative text-center pt-6 pb-3 border-b border-current/10">
                          <span className="text-4xl drop-shadow-sm">{theme.headerSymbol}</span>
                          <p className={`text-xs mt-1 font-medium tracking-wider uppercase ${useCustomBg ? 'text-white' : 'text-muted-foreground'}`}>{theme.headerText}</p>
                        </div>
                        
                        {/* From/To Section with Photo Upload */}
                        <div className="relative p-6 flex items-center justify-between gap-4">
                          {/* Sender with Photo Upload */}
                          <div className="flex-1 text-center">
                            <div className="relative w-20 h-20 mx-auto">
                              <div className="w-20 h-20 rounded-full border-4 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg overflow-hidden">
                                {senderImage ? (
                                  <img src={senderImage} alt="Sender" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="h-10 w-10 text-primary" />
                                )}
                              </div>
                              {senderImage ? (
                                <button
                                  type="button"
                                  onClick={removeSenderImage}
                                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              ) : (
                                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md cursor-pointer hover:bg-primary/90 transition-colors">
                                  <Camera className="h-3.5 w-3.5" />
                                  <input type="file" accept="image/*" className="hidden" onChange={handleSenderImageUpload} />
                                </label>
                              )}
                            </div>
                            <p className={`mt-3 text-xs font-semibold uppercase tracking-wide ${useCustomBg ? 'text-white' : 'text-primary'}`}>From</p>
                            <p className={`font-heading text-lg font-bold mt-1 ${useCustomBg ? 'text-white' : 'text-foreground'}`}>{senderName || "Your Name"}</p>
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
                          
                          {/* Recipient with Photo Upload */}
                          <div className="flex-1 text-center">
                            <div className="relative w-20 h-20 mx-auto">
                              <div className="w-20 h-20 rounded-full border-4 border-accent/40 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shadow-lg overflow-hidden">
                                {recipientImage ? (
                                  <img src={recipientImage} alt="Recipient" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="h-10 w-10 text-accent-foreground" />
                                )}
                              </div>
                              {recipientImage ? (
                                <button
                                  type="button"
                                  onClick={removeRecipientImage}
                                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              ) : (
                                <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md cursor-pointer hover:bg-accent/90 transition-colors">
                                  <Camera className="h-3.5 w-3.5" />
                                  <input type="file" accept="image/*" className="hidden" onChange={handleRecipientImageUpload} />
                                </label>
                              )}
                            </div>
                            <p className={`mt-3 text-xs font-semibold uppercase tracking-wide ${useCustomBg ? 'text-white' : 'text-accent-foreground'}`}>To</p>
                            <p className={`font-heading text-lg font-bold mt-1 ${useCustomBg ? 'text-white' : 'text-foreground'}`}>{recipientName || "Recipient"}</p>
                          </div>
                        </div>
                        
                        {/* Message Area */}
                        <div className="relative px-6 pb-4">
                          <div className={`p-4 ${useCustomBg ? 'bg-white/80' : 'bg-white/60 dark:bg-background/40'} backdrop-blur-sm rounded-xl border border-current/10 shadow-inner`}>
                            <p className="text-center italic text-muted-foreground leading-relaxed">
                              "{senderMessage || 'May divine blessings shower upon you and bring peace, prosperity, and happiness to your life...'}"
                            </p>
                          </div>
                        </div>
                        
                        {/* Footer with Pooja & Occasion */}
                        <div className="relative px-6 pb-6 flex flex-wrap items-center justify-center gap-3">
                          {selectedServiceData && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-md">
                              🙏 {selectedServiceData.name}
                            </span>
                          )}
                          {selectedOccasion && (
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${useCustomBg ? 'bg-white/80 text-foreground' : 'bg-accent/20 text-foreground'} text-sm font-medium border border-accent/30`}>
                              <selectedOccasion.icon className="h-4 w-4" />
                              {selectedOccasion.label}
                            </span>
                          )}
                        </div>
                        
                        {/* Decorative Bottom Border */}
                        <div className={`h-2 bg-gradient-to-r ${theme.accentGradient}`} />
                      </div>
                    </div>
                  );
                })()}
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
