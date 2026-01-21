import { User, Gift, ArrowRight, Download, Sparkles } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";

interface CardTheme {
  gradient: string;
  borderColor: string;
  headerSymbol: string;
  headerText: string;
  decorations: string[];
  accentGradient: string;
}

interface GiftTemplate {
  id: string;
  name: string;
  preview: string;
  background: string;
  overlay: string;
  pattern: string;
  decorIcon: string;
  image: string;
}

interface CardPreviewProps {
  occasion: string;
  cardThemes: Record<string, CardTheme>;
  giftTemplates: GiftTemplate[];
  selectedTemplate: string;
  customBackground: string | null;
  senderName: string;
  recipientName: string;
  senderImage: string | null;
  recipientImage: string | null;
  senderMessage: string;
  selectedServiceData: { name: string; price: number } | undefined;
  selectedOccasion: { value: string; label: string; icon: React.ComponentType<{ className?: string }> } | undefined;
  showDownloadButton?: boolean;
}

export interface CardPreviewHandle {
  downloadCard: () => Promise<void>;
}

// Sparkle component for animated effects
const SparkleEffect = ({ delay = 0, className = "" }: { delay?: number; className?: string }) => (
  <div 
    className={`absolute animate-sparkle ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    <Sparkles className="h-3 w-3 text-yellow-300/80" />
  </div>
);

export const CardPreview = forwardRef<CardPreviewHandle, CardPreviewProps>(({
  occasion,
  cardThemes,
  giftTemplates,
  selectedTemplate,
  customBackground,
  senderName,
  recipientName,
  senderImage,
  recipientImage,
  senderMessage,
  selectedServiceData,
  selectedOccasion,
  showDownloadButton = true,
}, ref) => {
  const theme = cardThemes[occasion] || cardThemes.blessing;
  const template = giftTemplates.find(t => t.id === selectedTemplate) || giftTemplates[0];
  const useCustomBg = selectedTemplate === "custom" && customBackground;
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const handleDownloadCard = async () => {
    if (!cardContainerRef.current) return;
    
    try {
      const element = cardContainerRef.current;
      const originalWidth = element.offsetWidth;
      const originalHeight = element.offsetHeight;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        width: originalWidth,
        height: originalHeight,
      });
      
      const link = document.createElement('a');
      link.download = `gift-card-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download card:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    downloadCard: handleDownloadCard,
  }));
  
  return (
    <div className="space-y-4">
      <div 
        ref={cardContainerRef}
        className={`relative overflow-hidden rounded-2xl border-4 border-double ${theme.borderColor} shadow-xl aspect-[9/16] min-h-[500px] md:min-h-[600px] flex flex-col animate-glow-pulse`}
        style={useCustomBg ? {
          backgroundImage: `url(${customBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {/* Template Background Image */}
        {!useCustomBg && template.image && (
          <img 
            src={template.image} 
            alt="Template background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {/* Dark Overlay for better readability - 65% opacity */}
        <div className="absolute inset-0 bg-black/65" />
        
        {/* Animated gradient overlay */}
        {!useCustomBg && (
          <div 
            className={`absolute inset-0 bg-gradient-to-br ${template.background} opacity-30 animate-gradient-shift`}
            style={{ 
              backgroundImage: template.pattern,
              backgroundSize: "200% 200%",
            }}
          />
        )}

        {/* Animated Sparkle Effects */}
        <SparkleEffect delay={0} className="top-[15%] left-[10%]" />
        <SparkleEffect delay={0.5} className="top-[25%] right-[15%]" />
        <SparkleEffect delay={1} className="top-[40%] left-[20%]" />
        <SparkleEffect delay={1.5} className="top-[60%] right-[10%]" />
        <SparkleEffect delay={2} className="bottom-[30%] left-[15%]" />
        <SparkleEffect delay={0.8} className="bottom-[20%] right-[20%]" />
        
        {/* Header with themed symbol - TOP */}
        <div className="relative text-center pt-8 pb-4 border-b border-white/20 shrink-0">
          <span className="text-5xl drop-shadow-lg animate-float">{theme.headerSymbol}</span>
          <p className="text-sm mt-2 font-medium tracking-wider uppercase text-white/90 animate-shimmer bg-gradient-to-r from-white/70 via-white to-white/70 bg-clip-text text-transparent bg-[length:200%_100%]">
            {theme.headerText}
          </p>
          {selectedOccasion && (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 mt-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/30">
              <selectedOccasion.icon className="h-3.5 w-3.5" />
              {selectedOccasion.label}
            </span>
          )}
        </div>

        {/* Floating Decorations - animated */}
        <div className="absolute top-[20%] left-4 text-2xl opacity-60 drop-shadow-lg animate-float-slow">{theme.decorations[0]}</div>
        <div className="absolute top-[20%] right-4 text-2xl opacity-60 drop-shadow-lg animate-float-slow" style={{ animationDelay: '0.5s' }}>{theme.decorations[1]}</div>
        <div className="absolute bottom-[35%] left-4 text-xl opacity-50 drop-shadow-lg animate-float-slow" style={{ animationDelay: '1s' }}>{theme.decorations[2]}</div>
        <div className="absolute bottom-[35%] right-4 text-xl opacity-50 drop-shadow-lg animate-float-slow" style={{ animationDelay: '1.5s' }}>{theme.decorations[3]}</div>
        
        {/* Spacer to push content to middle/bottom */}
        <div className="flex-1" />

        {/* From/To Section - CENTER */}
        <div className="relative px-4 md:px-6 py-6 flex items-center justify-between gap-2 md:gap-4">
          {/* Sender */}
          <div className="flex-1 text-center">
            <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto">
              {/* Animated pulse ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-pulse-ring" />
              <div className="w-full h-full rounded-full border-4 border-white/40 bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm relative z-10">
                {senderImage ? (
                  <img src={senderImage} alt="Sender" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 md:h-10 md:w-10 text-white" />
                )}
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/80">From</p>
            <p className="font-heading text-base md:text-lg font-bold mt-1 text-white drop-shadow-md">{senderName || "Your Name"}</p>
          </div>
          
          {/* Decorative Gift/Arrow - animated */}
          <div className="flex flex-col items-center px-2">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 animate-glow-pulse">
              <Gift className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            <ArrowRight className="h-5 w-5 text-white/80 mt-2 animate-slide-arrow" />
          </div>
          
          {/* Recipient */}
          <div className="flex-1 text-center">
            <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto">
              {/* Animated pulse ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
              <div className="w-full h-full rounded-full border-4 border-white/40 bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm relative z-10">
                {recipientImage ? (
                  <img src={recipientImage} alt="Recipient" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 md:h-10 md:w-10 text-white" />
                )}
              </div>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/80">To</p>
            <p className="font-heading text-base md:text-lg font-bold mt-1 text-white drop-shadow-md">{recipientName || "Recipient"}</p>
          </div>
        </div>
        
        {/* Message Area - BOTTOM */}
        <div className="relative px-4 md:px-6 pb-4 shrink-0">
          <div className="p-4 md:p-5 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
            <p className="text-center italic text-white/95 leading-relaxed text-sm md:text-base drop-shadow-sm">
              "{senderMessage || 'May divine blessings shower upon you...'}"
            </p>
          </div>
        </div>
        
        {/* Footer with Pooja Tag - BOTTOM */}
        <div className="relative px-4 md:px-6 pb-4 flex flex-wrap items-center justify-center gap-2 shrink-0">
          {selectedServiceData && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-md">
              🙏 {selectedServiceData.name}
            </span>
          )}
        </div>
        
        {/* Decorative Bottom Border */}
        <div className={`h-3 bg-gradient-to-r ${theme.accentGradient} shrink-0 mt-auto animate-shimmer bg-[length:200%_100%]`} />
      </div>

      {/* Download Button */}
      {showDownloadButton && (
        <Button 
          type="button"
          variant="outline" 
          onClick={handleDownloadCard}
          className="w-full gap-2 border-primary/30 hover:bg-primary/10"
        >
          <Download className="h-4 w-4" />
          Download Card as Image
        </Button>
      )}
    </div>
  );
});
