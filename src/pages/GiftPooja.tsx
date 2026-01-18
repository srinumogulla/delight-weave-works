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
import { 
  Gift, Heart, Cake, Star, Leaf, ArrowRight, ArrowLeft, Phone, Video, Package, Building2, 
  ChevronLeft, ChevronRight, User, Camera, X, Upload, Image, Sparkles, Check, 
  Mail, MapPin, Shield, Clock, CheckCircle2
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Import images
import heroTemple from "@/assets/hero-temple.jpg";
import ritualHomam from "@/assets/ritual-homam.jpg";
import ritualPooja from "@/assets/ritual-pooja.jpg";
import ritualLakshmi from "@/assets/ritual-lakshmi.jpg";
import ritualShanti from "@/assets/ritual-shanti.jpg";
import ritualAbhishekam from "@/assets/ritual-abhishekam.jpg";
import meditation from "@/assets/meditation.jpg";

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
    image: ritualPooja,
  },
  {
    id: "celebration",
    name: "Festive Joy",
    preview: "from-pink-100 via-purple-50 to-pink-100",
    background: "from-pink-50 via-purple-50/80 to-pink-100",
    overlay: "from-pink-900/20 to-purple-900/10",
    pattern: "radial-gradient(circle at 30% 70%, rgba(236,72,153,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(168,85,247,0.1) 0%, transparent 50%)",
    decorIcon: "🎉",
    image: ritualLakshmi,
  },
  {
    id: "love",
    name: "Eternal Love",
    preview: "from-rose-100 via-red-50 to-rose-100",
    background: "from-rose-50 via-red-50/80 to-rose-100",
    overlay: "from-rose-900/20 to-red-900/10",
    pattern: "radial-gradient(circle at 25% 75%, rgba(244,63,94,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(225,29,72,0.1) 0%, transparent 50%)",
    decorIcon: "💕",
    image: meditation,
  },
  {
    id: "healing",
    name: "Healing Light",
    preview: "from-emerald-100 via-teal-50 to-emerald-100",
    background: "from-emerald-50 via-teal-50/80 to-emerald-100",
    overlay: "from-emerald-900/20 to-teal-900/10",
    pattern: "radial-gradient(circle at 40% 60%, rgba(16,185,129,0.1) 0%, transparent 50%), radial-gradient(circle at 60% 40%, rgba(20,184,166,0.1) 0%, transparent 50%)",
    decorIcon: "🪷",
    image: ritualShanti,
  },
  {
    id: "sacred",
    name: "Sacred Memory",
    preview: "from-slate-100 via-blue-50 to-slate-100",
    background: "from-slate-50 via-blue-50/80 to-slate-100",
    overlay: "from-slate-900/20 to-blue-900/10",
    pattern: "radial-gradient(circle at 35% 65%, rgba(100,116,139,0.1) 0%, transparent 50%), radial-gradient(circle at 65% 35%, rgba(59,130,246,0.1) 0%, transparent 50%)",
    decorIcon: "🪔",
    image: ritualAbhishekam,
  },
  {
    id: "royal",
    name: "Royal Blessing",
    preview: "from-violet-100 via-indigo-50 to-violet-100",
    background: "from-violet-50 via-indigo-50/80 to-violet-100",
    overlay: "from-violet-900/20 to-indigo-900/10",
    pattern: "radial-gradient(circle at 45% 55%, rgba(139,92,246,0.1) 0%, transparent 50%), radial-gradient(circle at 55% 45%, rgba(99,102,241,0.1) 0%, transparent 50%)",
    decorIcon: "👑",
    image: ritualHomam,
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
  { 
    step: 1, 
    title: "Pick Blessing & Temple", 
    icon: Building2, 
    description: "Choose from our curated selection of sacred poojas and renowned temples across India",
    image: ritualPooja 
  },
  { 
    step: 2, 
    title: "Concierge Call", 
    icon: Phone, 
    description: "Our dedicated team confirms all details with you personally for a perfect experience",
    image: heroTemple 
  },
  { 
    step: 3, 
    title: "Ritual & Live Updates", 
    icon: Video, 
    description: "Receive real-time photos and videos as the pooja is performed at the temple",
    image: ritualHomam 
  },
  { 
    step: 4, 
    title: "Gift Dispatch", 
    icon: Package, 
    description: "Sacred prasadam and blessings beautifully packaged and delivered to your loved one",
    image: ritualLakshmi 
  }
];

// Step definitions for multi-step form
const formSteps = [
  { id: 1, title: "Select Blessing", icon: Gift },
  { id: 2, title: "Design Card", icon: Sparkles },
  { id: 3, title: "Recipient Details", icon: User },
  { id: 4, title: "Delivery & Confirm", icon: CheckCircle2 },
];

const GiftPooja = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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

  // Navigation functions
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const goToStep = (step: number) => setCurrentStep(step);

  // Validation for each step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!selectedService && !!occasion;
      case 2:
        return !!senderName && !!recipientName;
      case 3:
        return true; // Optional fields
      case 4:
        return !sendPrasadam || !!recipientAddress;
      default:
        return false;
    }
  };

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

  // Get card preview component
  const CardPreview = () => {
    const theme = cardThemes[occasion] || cardThemes.blessing;
    const template = giftTemplates.find(t => t.id === selectedTemplate) || giftTemplates[0];
    const useCustomBg = selectedTemplate === "custom" && customBackground;
    
    return (
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
        
        {/* Header with themed symbol */}
        <div className="relative text-center pt-6 pb-3 border-b border-current/10">
          <span className="text-4xl drop-shadow-sm">{theme.headerSymbol}</span>
          <p className={`text-xs mt-1 font-medium tracking-wider uppercase ${useCustomBg ? 'text-white' : 'text-muted-foreground'}`}>{theme.headerText}</p>
        </div>
        
        {/* From/To Section */}
        <div className="relative p-4 md:p-6 flex items-center justify-between gap-2 md:gap-4">
          {/* Sender */}
          <div className="flex-1 text-center">
            <div className="relative w-14 h-14 md:w-20 md:h-20 mx-auto">
              <div className="w-full h-full rounded-full border-4 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg overflow-hidden">
                {senderImage ? (
                  <img src={senderImage} alt="Sender" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-6 w-6 md:h-10 md:w-10 text-primary" />
                )}
              </div>
            </div>
            <p className={`mt-2 md:mt-3 text-xs font-semibold uppercase tracking-wide ${useCustomBg ? 'text-white' : 'text-primary'}`}>From</p>
            <p className={`font-heading text-sm md:text-lg font-bold mt-1 ${useCustomBg ? 'text-white' : 'text-foreground'}`}>{senderName || "Your Name"}</p>
          </div>
          
          {/* Decorative Gift/Arrow */}
          <div className="flex flex-col items-center px-1 md:px-2">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Gift className="h-5 w-5 md:h-7 md:w-7 text-primary" />
            </div>
            <ArrowRight className="h-4 w-4 text-primary mt-1" />
          </div>
          
          {/* Recipient */}
          <div className="flex-1 text-center">
            <div className="relative w-14 h-14 md:w-20 md:h-20 mx-auto">
              <div className="w-full h-full rounded-full border-4 border-accent/40 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shadow-lg overflow-hidden">
                {recipientImage ? (
                  <img src={recipientImage} alt="Recipient" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-6 w-6 md:h-10 md:w-10 text-accent-foreground" />
                )}
              </div>
            </div>
            <p className={`mt-2 md:mt-3 text-xs font-semibold uppercase tracking-wide ${useCustomBg ? 'text-white' : 'text-accent-foreground'}`}>To</p>
            <p className={`font-heading text-sm md:text-lg font-bold mt-1 ${useCustomBg ? 'text-white' : 'text-foreground'}`}>{recipientName || "Recipient"}</p>
          </div>
        </div>
        
        {/* Message Area */}
        <div className="relative px-4 md:px-6 pb-4">
          <div className={`p-3 md:p-4 ${useCustomBg ? 'bg-white/80' : 'bg-white/60 dark:bg-background/40'} backdrop-blur-sm rounded-xl border border-current/10 shadow-inner`}>
            <p className="text-center italic text-muted-foreground leading-relaxed text-sm">
              "{senderMessage || 'May divine blessings shower upon you...'}"
            </p>
          </div>
        </div>
        
        {/* Footer with Pooja & Occasion */}
        <div className="relative px-4 md:px-6 pb-4 flex flex-wrap items-center justify-center gap-2">
          {selectedServiceData && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-md">
              🙏 {selectedServiceData.name}
            </span>
          )}
          {selectedOccasion && (
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full ${useCustomBg ? 'bg-white/80 text-foreground' : 'bg-accent/20 text-foreground'} text-xs font-medium border border-accent/30`}>
              <selectedOccasion.icon className="h-3 w-3" />
              {selectedOccasion.label}
            </span>
          )}
        </div>
        
        {/* Decorative Bottom Border */}
        <div className={`h-2 bg-gradient-to-r ${theme.accentGradient}`} />
      </div>
    );
  };

  // Step 1: Select Blessing
  const StepSelectBlessing = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="service" className="text-base font-medium">Select Pooja *</Label>
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Choose a pooja for your loved one" />
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

      <div className="space-y-3">
        <Label className="text-base font-medium">Select an Occasion *</Label>
        <div className="grid grid-cols-3 gap-3">
          {occasions.map((occ) => (
            <button
              key={occ.value}
              type="button"
              onClick={() => setOccasion(occ.value)}
              className={`p-4 rounded-xl border-2 transition-all text-center group ${
                occasion === occ.value
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${
                occasion === occ.value ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/20"
              }`}>
                <occ.icon className={`h-6 w-6 ${occasion === occ.value ? "" : "text-muted-foreground group-hover:text-primary"}`} />
              </div>
              <span className={`text-sm font-medium ${occasion === occ.value ? "text-primary" : "text-foreground"}`}>{occ.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedServiceData && (
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Selected Pooja</p>
            <p className="font-medium">{selectedServiceData.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-heading text-xl font-bold text-primary">₹{Number(selectedServiceData.price).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );

  // Step 2: Design Card
  const StepDesignCard = () => (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Choose Card Template
        </Label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {giftTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                setSelectedTemplate(template.id);
                setCustomBackground(null);
              }}
              className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                selectedTemplate === template.id 
                  ? "border-primary ring-2 ring-primary/30 scale-105" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              {/* Background Image */}
              <img 
                src={template.image} 
                alt={template.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${template.preview} opacity-60`} />
              {/* Content */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2">
                <span className="text-3xl mb-1 drop-shadow-md">{template.decorIcon}</span>
                <span className="text-xs font-medium text-foreground text-center leading-tight drop-shadow-sm bg-white/70 dark:bg-black/50 px-2 py-0.5 rounded">{template.name}</span>
              </div>
              {selectedTemplate === template.id && (
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-20">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
          
          {/* Custom Upload Option */}
          {customBackground ? (
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-primary ring-2 ring-primary/30">
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
            <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/50">
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-xs font-medium text-muted-foreground text-center">Upload<br/>Custom</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleCustomBackgroundUpload} />
            </label>
          )}
        </div>
      </div>

      {/* Names and Photos */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="senderName" className="text-base font-medium">From (Your Name) *</Label>
          <div className="flex gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-primary/30 bg-muted flex items-center justify-center overflow-hidden">
                {senderImage ? (
                  <img src={senderImage} alt="Sender" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              {senderImage ? (
                <button
                  type="button"
                  onClick={removeSenderImage}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <>
                  <input 
                    type="file" 
                    id="senderImageInput"
                    accept="image/*" 
                    className="sr-only" 
                    onChange={handleSenderImageUpload} 
                  />
                  <label 
                    htmlFor="senderImageInput"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-3 w-3" />
                  </label>
                </>
              )}
            </div>
            <Input
              id="senderName"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 h-12"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="recipientName" className="text-base font-medium">To (Recipient Name) *</Label>
          <div className="flex gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-accent/40 bg-muted flex items-center justify-center overflow-hidden">
                {recipientImage ? (
                  <img src={recipientImage} alt="Recipient" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              {recipientImage ? (
                <button
                  type="button"
                  onClick={removeRecipientImage}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <>
                  <input 
                    type="file" 
                    id="recipientImageInput"
                    accept="image/*" 
                    className="sr-only" 
                    onChange={handleRecipientImageUpload} 
                  />
                  <label 
                    htmlFor="recipientImageInput"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center cursor-pointer hover:bg-accent/90 transition-colors"
                  >
                    <Camera className="h-3 w-3" />
                  </label>
                </>
              )}
            </div>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter recipient's name"
              className="flex-1 h-12"
            />
          </div>
        </div>
      </div>

      {/* Personal Greeting */}
      <div className="space-y-2">
        <Label htmlFor="senderMessage" className="text-base font-medium">Your Blessing Message</Label>
        <Textarea
          id="senderMessage"
          value={senderMessage}
          onChange={(e) => setSenderMessage(e.target.value)}
          placeholder="Write a heartfelt blessing for the recipient..."
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );

  // Step 3: Recipient Details
  const StepRecipientDetails = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recipientEmail" className="text-base font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Recipient Email
          </Label>
          <Input
            id="recipientEmail"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="For gift notification"
            className="h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipientPhone" className="text-base font-medium flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Recipient Phone
          </Label>
          <Input
            id="recipientPhone"
            type="tel"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            placeholder="For WhatsApp updates"
            className="h-12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-base font-medium">Additional Notes (Optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any special instructions or requests for the pooja..."
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
        {[
          { icon: Shield, text: "100% Authentic" },
          { icon: Check, text: "Verified Priests" },
          { icon: Clock, text: "Timely Rituals" },
          { icon: Package, text: "Safe Delivery" },
        ].map((badge, i) => (
          <div key={i} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <badge.icon className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">{badge.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 4: Delivery & Confirm
  const StepDeliveryConfirm = () => (
    <div className="space-y-6">
      {/* Prasadam Delivery Toggle */}
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Label className="text-base font-medium">Send Prasadam to Recipient</Label>
            <p className="text-sm text-muted-foreground">
              Deliver blessed prasadam to their doorstep
            </p>
          </div>
        </div>
        <Switch
          checked={sendPrasadam}
          onCheckedChange={setSendPrasadam}
        />
      </div>

      {/* Recipient Address */}
      {sendPrasadam && (
        <div className="space-y-2">
          <Label htmlFor="recipientAddress" className="text-base font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Delivery Address *
          </Label>
          <Textarea
            id="recipientAddress"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Complete address for prasadam delivery"
            rows={3}
            className="resize-none"
          />
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 bg-muted/50 border-b border-border">
          <h3 className="font-heading text-lg font-semibold">Order Summary</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pooja</span>
            <span className="font-medium">{selectedServiceData?.name || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Occasion</span>
            <span className="font-medium">{selectedOccasion?.label || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">From</span>
            <span className="font-medium">{senderName || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">To</span>
            <span className="font-medium">{recipientName || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prasadam Delivery</span>
            <span className="font-medium">{sendPrasadam ? "Yes" : "No"}</span>
          </div>
          <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
            <span className="font-medium">Total Amount</span>
            <span className="font-heading text-2xl font-bold text-primary">
              ₹{Number(selectedServiceData?.price || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepSelectBlessing />;
      case 2:
        return <StepDesignCard />;
      case 3:
        return <StepRecipientDetails />;
      case 4:
        return <StepDeliveryConfirm />;
      default:
        return null;
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
                <div className="relative h-[280px] md:h-[350px]">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4 max-w-3xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-3 backdrop-blur-sm">
                        <Gift className="h-4 w-4" />
                        Gift a Blessing
                      </div>
                      <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                        {slide.title}
                      </h1>
                      <p className="text-base md:text-lg text-white/90">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  {/* Dots inside banner */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {bannerSlides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => emblaApi?.scrollTo(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          selectedIndex === i ? "bg-white w-6" : "bg-white/50"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
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
      </section>

      {/* Enhanced Process Steps Section with Images */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
              How Gift Pooja Works
            </h2>
            <p className="text-muted-foreground">A seamless spiritual gifting experience in 4 simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {giftSteps.map((step, index) => (
              <div key={step.step} className="relative group">
                {/* Connector Line */}
                {index < giftSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary to-primary/20 z-0" style={{ width: 'calc(100% - 2rem)', left: '50%', transform: 'translateX(50%)' }} />
                )}
                
                <div className="relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Step Number Badge */}
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                      {step.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Step Form Section */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
              Create Your Gift
            </h2>
            <p className="text-muted-foreground">Fill in the details to gift a divine blessing</p>
          </div>

          {/* Progress Indicator */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              {formSteps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => goToStep(step.id)}
                    className={`flex flex-col items-center ${step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                    disabled={step.id > currentStep + 1}
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                      step.id === currentStep 
                        ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                        : step.id < currentStep 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}>
                      {step.id < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium hidden md:block ${
                      step.id === currentStep ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </button>
                  
                  {index < formSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                      step.id < currentStep ? 'bg-primary' : 'bg-muted-foreground/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content - Side by Side Layout on Desktop */}
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Form Panel */}
              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit}>
                  <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {(() => {
                          const StepIcon = formSteps[currentStep - 1]?.icon;
                          return StepIcon ? <StepIcon className="h-5 w-5 text-primary" /> : null;
                        })()}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p>
                        <h3 className="font-heading text-lg font-semibold">{formSteps[currentStep - 1]?.title}</h3>
                      </div>
                    </div>
                    
                    {renderStepContent()}
                    
                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      {currentStep < totalSteps ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!isStepValid(currentStep)}
                          className="gap-2 bg-primary hover:bg-primary/90"
                        >
                          Next Step
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isSubmitting || !isStepValid(currentStep)}
                          className="gap-2 bg-primary hover:bg-primary/90"
                        >
                          {isSubmitting ? "Processing..." : "Gift This Pooja"}
                          <Gift className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Card Preview Panel - Sticky on Desktop */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-24">
                  <div className="mb-4 flex items-center gap-2">
                    <Image className="h-4 w-4 text-primary" />
                    <Label className="text-base font-medium">Live Card Preview</Label>
                  </div>
                  <CardPreview />
                  
                  {/* Quick Tips */}
                  <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Quick Tips
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Add photos for a personal touch</li>
                      <li>• Write a heartfelt blessing message</li>
                      <li>• Choose a template matching the occasion</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
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
