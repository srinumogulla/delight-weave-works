import { User, Gift, ArrowRight } from "lucide-react";

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
}

export const CardPreview = ({
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
}: CardPreviewProps) => {
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
      {/* Template Background Image */}
      {!useCustomBg && template.image && (
        <img 
          src={template.image} 
          alt="Template background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {/* Template Gradient Overlay */}
      {!useCustomBg && (
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${template.background} opacity-80`}
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
