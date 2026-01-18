import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Gift, Heart, Cake, Star, Leaf, ArrowRight, ArrowLeft, Phone, Video, Package, Building2, 
  ChevronLeft, ChevronRight, Image, Sparkles, Check, CheckCircle2
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Import components
import { CardPreview } from "./gift-pooja/CardPreview";
import { StepSelectBlessing } from "./gift-pooja/StepSelectBlessing";
import { StepDesignCard } from "./gift-pooja/StepDesignCard";
import { StepRecipientDetails } from "./gift-pooja/StepRecipientDetails";
import { StepDeliveryConfirm } from "./gift-pooja/StepDeliveryConfirm";

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
  { id: 3, title: "Recipient Details", icon: CheckCircle2 },
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
  
  // Sender details
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

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepSelectBlessing
            services={services}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            occasions={occasions}
            occasion={occasion}
            setOccasion={setOccasion}
            selectedServiceData={selectedServiceData}
          />
        );
      case 2:
        return (
          <StepDesignCard
            giftTemplates={giftTemplates}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            customBackground={customBackground}
            setCustomBackground={setCustomBackground}
            senderName={senderName}
            setSenderName={setSenderName}
            recipientName={recipientName}
            setRecipientName={setRecipientName}
            senderImage={senderImage}
            setSenderImage={setSenderImage}
            recipientImage={recipientImage}
            setRecipientImage={setRecipientImage}
            senderMessage={senderMessage}
            setSenderMessage={setSenderMessage}
          />
        );
      case 3:
        return (
          <StepRecipientDetails
            recipientEmail={recipientEmail}
            setRecipientEmail={setRecipientEmail}
            recipientPhone={recipientPhone}
            setRecipientPhone={setRecipientPhone}
            message={message}
            setMessage={setMessage}
          />
        );
      case 4:
        return (
          <StepDeliveryConfirm
            sendPrasadam={sendPrasadam}
            setSendPrasadam={setSendPrasadam}
            recipientAddress={recipientAddress}
            setRecipientAddress={setRecipientAddress}
            selectedServiceData={selectedServiceData}
            selectedOccasion={selectedOccasion}
            senderName={senderName}
            recipientName={recipientName}
          />
        );
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
                        type="button"
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
          type="button"
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          type="button"
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
                  <CardPreview
                    occasion={occasion}
                    cardThemes={cardThemes}
                    giftTemplates={giftTemplates}
                    selectedTemplate={selectedTemplate}
                    customBackground={customBackground}
                    senderName={senderName}
                    recipientName={recipientName}
                    senderImage={senderImage}
                    recipientImage={recipientImage}
                    senderMessage={senderMessage}
                    selectedServiceData={selectedServiceData}
                    selectedOccasion={selectedOccasion}
                  />
                  
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
