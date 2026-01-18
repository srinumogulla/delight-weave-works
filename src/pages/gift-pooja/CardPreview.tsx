import { User, Gift, ArrowRight, Download } from "lucide-react";
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
      const canvas = await html2canvas(cardContainerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
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
        className={`relative overflow-hidden rounded-2xl border-4 border-double ${theme.borderColor} shadow-xl`}
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
        
        {/* Subtle gradient overlay for visual styling */}
        {!useCustomBg && (
          <div 
            className={`absolute inset-0 bg-gradient-to-br ${template.background} opacity-30`}
            style={{ backgroundImage: template.pattern }}
          />
        )}
        
        {/* Floating Decorations */}
        <div className="absolute top-3 left-3 text-2xl opacity-60 drop-shadow-lg">{theme.decorations[0]}</div>
        <div className="absolute top-3 right-3 text-2xl opacity-60 drop-shadow-lg">{theme.decorations[1]}</div>
        <div className="absolute bottom-16 left-3 text-xl opacity-50 drop-shadow-lg">{theme.decorations[2]}</div>
        <div className="absolute bottom-16 right-3 text-xl opacity-50 drop-shadow-lg">{theme.decorations[3]}</div>
        
        {/* Header with themed symbol */}
        <div className="relative text-center pt-6 pb-3 border-b border-white/20">
          <span className="text-4xl drop-shadow-lg">{theme.headerSymbol}</span>
          <p className="text-xs mt-1 font-medium tracking-wider uppercase text-white/90">{theme.headerText}</p>
        </div>
        
        {/* From/To Section */}
        <div className="relative p-4 md:p-6 flex items-center justify-between gap-2 md:gap-4">
          {/* Sender */}
          <div className="flex-1 text-center">
            <div className="relative w-14 h-14 md:w-20 md:h-20 mx-auto">
              <div className="w-full h-full rounded-full border-4 border-white/40 bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm">
                {senderImage ? (
                  <img src={senderImage} alt="Sender" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-6 w-6 md:h-10 md:w-10 text-white" />
                )}
              </div>
            </div>
            <p className="mt-2 md:mt-3 text-xs font-semibold uppercase tracking-wide text-white/80">From</p>
            <p className="font-heading text-sm md:text-lg font-bold mt-1 text-white drop-shadow-md">{senderName || "Your Name"}</p>
          </div>
          
          {/* Decorative Gift/Arrow */}
          <div className="flex flex-col items-center px-1 md:px-2">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Gift className="h-5 w-5 md:h-7 md:w-7 text-white" />
            </div>
            <ArrowRight className="h-4 w-4 text-white/80 mt-1" />
          </div>
          
          {/* Recipient */}
          <div className="flex-1 text-center">
            <div className="relative w-14 h-14 md:w-20 md:h-20 mx-auto">
              <div className="w-full h-full rounded-full border-4 border-white/40 bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm">
                {recipientImage ? (
                  <img src={recipientImage} alt="Recipient" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-6 w-6 md:h-10 md:w-10 text-white" />
                )}
              </div>
            </div>
            <p className="mt-2 md:mt-3 text-xs font-semibold uppercase tracking-wide text-white/80">To</p>
            <p className="font-heading text-sm md:text-lg font-bold mt-1 text-white drop-shadow-md">{recipientName || "Recipient"}</p>
          </div>
        </div>
        
        {/* Message Area */}
        <div className="relative px-4 md:px-6 pb-4">
          <div className="p-3 md:p-4 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
            <p className="text-center italic text-white/95 leading-relaxed text-sm drop-shadow-sm">
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
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/30">
              <selectedOccasion.icon className="h-3 w-3" />
              {selectedOccasion.label}
            </span>
          )}
        </div>
        
        {/* Decorative Bottom Border */}
        <div className={`h-2 bg-gradient-to-r ${theme.accentGradient}`} />
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
