import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { listPoojas } from "@/integrations/vedhaApi/poojas";
import type { ApiPooja } from "@/integrations/vedhaApi/types";
import { createTransaction } from "@/integrations/vedhaApi/transactions";
import { useToast } from "@/hooks/use-toast";
import { 
  Gift, Heart, Cake, Star, Leaf, ArrowRight, ArrowLeft, Phone, Video, Package, Building2, 
  ChevronLeft, ChevronRight, Check, CheckCircle2, User, CreditCard
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Import components
import { ArchanaVideoPreview } from "./gift-pooja/ArchanaVideoPreview";
import { StepArchanaDetails } from "./gift-pooja/StepArchanaDetails";

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
  { image: heroTemple, title: "Gift Archana Blessings", subtitle: "Send a personalized Archana video to your loved ones" },
  { image: ritualHomam, title: "Sacred Temple Ritual", subtitle: "Performed by authentic priests with your recipient's name" },
  { image: ritualPooja, title: "Traditional Archana", subtitle: "Receive a video of the complete ritual" },
  { image: ritualLakshmi, title: "Divine Blessings", subtitle: "Share spiritual grace for every occasion" }
];

const giftSteps = [
  { step: 1, title: "Select Occasion", icon: Gift, description: "Choose the occasion for the Archana blessing - birthday, health, or any special moment", image: ritualPooja },
  { step: 2, title: "Enter Details", icon: User, description: "Provide the recipient's name and Gotra (family lineage) for the sacred recitation", image: heroTemple },
  { step: 3, title: "Temple Ritual", icon: Building2, description: "Our verified priests perform the Archana at the temple with the provided details", image: ritualHomam },
  { step: 4, title: "Video Delivery", icon: Video, description: "Receive the personalized Archana video to share with your loved one", image: ritualLakshmi }
];

const formSteps = [
  { id: 1, title: "Select Occasion", icon: Gift },
  { id: 2, title: "Recipient Details", icon: User },
  { id: 3, title: "Confirm", icon: CheckCircle2 },
  { id: 4, title: "Payment", icon: CreditCard },
];

const ARCHANA_PRICE = 151;
const ARCHANA_NAME = "Archana";

const GiftPooja = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [recipientName, setRecipientName] = useState("");
  const [gotra, setGotra] = useState("");
  const [occasion, setOccasion] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientImage, setRecipientImage] = useState<string | null>(null);
  const [senderName, setSenderName] = useState("");
  const [senderImage, setSenderImage] = useState<string | null>(null);
  const [senderMessage, setSenderMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const goToStep = (step: number) => setCurrentStep(step);

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: return !!occasion;
      case 2: return !!recipientName && !!gotra;
      case 3: return true;
      default: return false;
    }
  };

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => { if (!emblaApi) return; setSelectedIndex(emblaApi.selectedScrollSnap()); }, [emblaApi]);

  useEffect(() => { if (!emblaApi) return; onSelect(); emblaApi.on("select", onSelect); return () => { emblaApi.off("select", onSelect); }; }, [emblaApi, onSelect]);

  // Fetch archana service from API
  const { data: archanaService } = useQuery({
    queryKey: ["archana-service"],
    queryFn: async () => {
      const all = await listPoojas();
      return (all as ApiPooja[]).find(p => p.is_active && p.name.toLowerCase().includes("archana")) || null;
    },
  });

  const selectedOccasion = occasions.find(o => o.value === occasion);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast({ title: "Please log in", description: "You need to be logged in to gift an Archana.", variant: "destructive" }); navigate("/login"); return; }
    if (!recipientName || !gotra || !occasion) { toast({ title: "Missing information", description: "Please provide recipient name, gotra, and occasion.", variant: "destructive" }); return; }
    // Move to payment step
    navigate("/payment", {
      state: {
        type: "gift",
        serviceName: ARCHANA_NAME,
        amount: archanaService?.price || ARCHANA_PRICE,
        recipientName,
        gotra,
        serviceId: archanaService?.id,
        occasion,
        message: senderMessage,
        senderName,
      },
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Selected Pooja</p><p className="font-heading text-lg font-bold text-foreground">{ARCHANA_NAME}</p></div>
                <div className="text-right"><p className="text-sm text-muted-foreground">Amount</p><p className="font-heading text-2xl font-bold text-primary">₹{(archanaService?.price || ARCHANA_PRICE).toLocaleString()}</p></div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-base font-medium">Select an Occasion *</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {occasions.map((occ) => (
                  <button key={occ.value} type="button" onClick={() => setOccasion(occ.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-center group ${occasion === occ.value ? "border-primary bg-primary/10 shadow-md" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}>
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${occasion === occ.value ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/20"}`}>
                      <occ.icon className={`h-6 w-6 ${occasion === occ.value ? "" : "text-muted-foreground group-hover:text-primary"}`} />
                    </div>
                    <span className={`text-sm font-medium ${occasion === occ.value ? "text-primary" : "text-foreground"}`}>{occ.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return <StepArchanaDetails recipientName={recipientName} setRecipientName={setRecipientName} gotra={gotra} setGotra={setGotra} recipientImage={recipientImage} setRecipientImage={setRecipientImage} senderName={senderName} setSenderName={setSenderName} senderImage={senderImage} setSenderImage={setSenderImage} senderMessage={senderMessage} setSenderMessage={setSenderMessage} />;
      case 3:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-card rounded-xl border border-border space-y-3">
              <h4 className="font-medium text-foreground">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Pooja</span><span className="font-medium">{ARCHANA_NAME}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Occasion</span><span className="font-medium">{selectedOccasion?.label || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Recipient</span><span className="font-medium">{recipientName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Gotra</span><span className="font-medium">{gotra} Gotram</span></div>
                <div className="pt-2 border-t border-border flex justify-between"><span className="font-medium">Total Amount</span><span className="font-heading text-xl font-bold text-primary">₹{(archanaService?.price || ARCHANA_PRICE).toLocaleString()}</span></div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Optional: Contact details to send the video</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Email (Optional)</label><input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="For video delivery" className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground" /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Phone (Optional)</label><input type="tel" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="For WhatsApp updates" className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground" /></div>
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
              <p className="text-xs text-amber-800 dark:text-amber-200 text-center">🙏 The Archana video will be shared with you after the ritual is performed at the temple.</p>
            </div>
          </div>
        );
      case 4:
        navigate("/payment", { state: { type: "gift", serviceName: ARCHANA_NAME, amount: archanaService?.price || ARCHANA_PRICE, recipientName, gotra, serviceId: archanaService?.id, occasion, message: senderMessage, senderName } });
        return null;
      default: return null;
    }
  };

  const content = (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <section className="relative overflow-hidden">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex">
            {bannerSlides.map((slide, index) => (
              <div key={index} className="embla__slide flex-[0_0_100%] min-w-0 relative">
                <div className="relative h-[280px] md:h-[350px]">
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4 max-w-3xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-3 backdrop-blur-sm"><Video className="h-4 w-4" />Gift Archana Video</div>
                      <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{slide.title}</h1>
                      <p className="text-base md:text-lg text-white/90">{slide.subtitle}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {bannerSlides.map((_, i) => <button key={i} type="button" onClick={() => emblaApi?.scrollTo(i)} className={`w-2 h-2 rounded-full transition-all ${selectedIndex === i ? "bg-white w-6" : "bg-white/50"}`} aria-label={`Go to slide ${i + 1}`} />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button type="button" onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors" aria-label="Previous slide"><ChevronLeft className="h-6 w-6" /></button>
        <button type="button" onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors" aria-label="Next slide"><ChevronRight className="h-6 w-6" /></button>
      </section>

      {/* Process Steps */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container">
          <div className="text-center mb-10"><h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">How Gift Archana Works</h2><p className="text-muted-foreground">Send personalized Archana blessings in 4 simple steps</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {giftSteps.map((step, index) => (
              <div key={step.step} className="relative group">
                {index < giftSteps.length - 1 && <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary to-primary/20 z-0" style={{ width: 'calc(100% - 2rem)', left: '50%', transform: 'translateX(50%)' }} />}
                <div className="relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  <div className="relative h-40 overflow-hidden"><img src={step.image} alt={step.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">{step.step}</div><div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg"><step.icon className="h-5 w-5 text-primary" /></div></div>
                  <div className="p-4"><h3 className="font-heading font-semibold text-foreground mb-1">{step.title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container">
          <div className="text-center mb-8"><h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Gift an Archana</h2><p className="text-muted-foreground">Fill in the details to gift a divine Archana video blessing</p></div>
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              {formSteps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <button type="button" onClick={() => step.id <= currentStep && goToStep(step.id)} className={`flex flex-col items-center ${step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`} disabled={step.id > currentStep + 1}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${step.id === currentStep ? 'bg-primary text-primary-foreground shadow-lg scale-110' : step.id < currentStep ? 'bg-primary/20 text-primary' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                      {step.id < currentStep ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs mt-2 font-medium hidden md:block ${step.id === currentStep ? 'text-primary' : 'text-muted-foreground'}`}>{step.title}</span>
                  </button>
                  {index < formSteps.length - 1 && <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${step.id < currentStep ? 'bg-primary' : 'bg-muted-foreground/20'}`} />}
                </div>
              ))}
            </div>
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <form onSubmit={handleSubmit}>
                  <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {(() => { const StepIcon = formSteps[currentStep - 1]?.icon; return StepIcon ? <StepIcon className="h-5 w-5 text-primary" /> : null; })()}
                      </div>
                      <div><p className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</p><h3 className="font-heading text-lg font-semibold">{formSteps[currentStep - 1]?.title}</h3></div>
                    </div>
                    {renderStepContent()}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                      <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1} className="gap-2"><ArrowLeft className="h-4 w-4" />Previous</Button>
                      {currentStep < totalSteps - 1 ? (
                        <Button type="button" onClick={nextStep} disabled={!isStepValid(currentStep)} className="gap-2 bg-primary hover:bg-primary/90">Next Step<ArrowRight className="h-4 w-4" /></Button>
                      ) : currentStep === totalSteps - 1 ? (
                        <Button type="submit" disabled={!isStepValid(currentStep)} className="gap-2 bg-primary hover:bg-primary/90">Proceed to Payment<CreditCard className="h-4 w-4" /></Button>
                      ) : null}
                    </div>
                  </div>
                </form>
              </div>
              <div>
                <div className="lg:sticky lg:top-24">
                  <div className="mb-4 flex items-center gap-2"><Video className="h-4 w-4 text-primary" /><span className="text-base font-medium">Sample Archana Video</span></div>
                  <ArchanaVideoPreview recipientName={recipientName} gotra={gotra} occasion={occasion} selectedOccasion={selectedOccasion} recipientImage={recipientImage} senderName={senderName} senderImage={senderImage} senderMessage={senderMessage} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  if (isMobile) return <MobileLayout showHeader={true}>{content}</MobileLayout>;
  return <div className="min-h-screen"><Header /><main>{content}</main><Footer /></div>;
};

export default GiftPooja;
