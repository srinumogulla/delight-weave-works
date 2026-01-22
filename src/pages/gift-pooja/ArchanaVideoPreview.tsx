import { Play, Sparkles, User, Gift } from "lucide-react";
import ritualPooja from "@/assets/ritual-pooja.jpg";

interface ArchanaVideoPreviewProps {
  recipientName: string;
  gotra: string;
  occasion: string;
  selectedOccasion?: { value: string; label: string; icon: React.ComponentType<{ className?: string }> };
  recipientImage: string | null;
  senderName: string;
  senderImage: string | null;
  senderMessage: string;
}

export const ArchanaVideoPreview = ({
  recipientName,
  gotra,
  selectedOccasion,
  recipientImage,
  senderName,
  senderImage,
  senderMessage,
}: ArchanaVideoPreviewProps) => {
  return (
    <div className="space-y-3">
      {/* 9:16 Mobile Video Container with Temple Image Placeholder */}
      <div className="relative aspect-[9/16] max-h-[500px] mx-auto rounded-2xl overflow-hidden border-2 border-primary/30 shadow-xl bg-gradient-to-br from-amber-900 to-orange-900">
        {/* Temple Image Background */}
        <img
          src={ritualPooja}
          alt="Temple Archana Ritual"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Animated Shimmer Overlay - to simulate video-like feel */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" 
          style={{ 
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s infinite linear'
          }} 
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 pointer-events-none" />
        
        {/* Play Button - Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 animate-pulse">
            <Play className="h-8 w-8 md:h-10 md:w-10 text-white fill-white/80 ml-1" />
          </div>
        </div>
        
        {/* Sample Badge - Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium shadow-lg backdrop-blur-sm border border-white/20">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Sample Preview
          </div>
        </div>

        {/* Floating Decorations */}
        <div className="absolute top-4 right-4 text-2xl animate-float opacity-60">🕉️</div>
        <div className="absolute top-20 left-4 text-xl animate-float opacity-50" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute top-32 right-8 text-lg animate-float opacity-40" style={{ animationDelay: '2s' }}>🪷</div>

        {/* Content Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 pointer-events-none">
          {/* From → To Section */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Sender */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-white/60 shadow-lg overflow-hidden bg-white/20 backdrop-blur-sm ring-2 ring-primary/30 ring-offset-1 ring-offset-black/20">
                {senderImage ? (
                  <img
                    src={senderImage}
                    alt="From"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/40 to-amber-500/40">
                    <User className="h-6 w-6 text-white/90" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-white/80 mt-1 font-medium truncate max-w-[60px]">
                {senderName || "From You"}
              </span>
            </div>

            {/* Gift Arrow */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center shadow-lg">
                <Gift className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-0.5">
                <div className="w-4 h-0.5 bg-white/40 rounded-full" />
                <div className="w-0 h-0 border-l-4 border-l-white/40 border-y-2 border-y-transparent" />
              </div>
            </div>

            {/* Recipient */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-primary/80 shadow-lg overflow-hidden bg-white/20 backdrop-blur-sm ring-2 ring-amber-400/50 ring-offset-1 ring-offset-black/20">
                {recipientImage ? (
                  <img
                    src={recipientImage}
                    alt="To"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/40 to-orange-500/40">
                    <User className="h-6 w-6 text-white/90" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-white/80 mt-1 font-medium truncate max-w-[60px]">
                {recipientName || "Recipient"}
              </span>
            </div>
          </div>

          {/* Blessing Message */}
          {senderMessage && (
            <div className="mb-3 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <p className="text-xs text-white/90 italic text-center line-clamp-2">
                "{senderMessage}"
              </p>
            </div>
          )}

          {/* Recipient Details Box */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            {/* Decorative Header */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-white/70 uppercase tracking-widest">Personalized Archana</span>
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            
            {/* Recipient Name */}
            <h3 className="text-lg font-bold text-white text-center drop-shadow-lg truncate">
              {recipientName || "Recipient Name"}
            </h3>
            
            {/* Gotra */}
            <p className="text-sm text-white/90 font-medium text-center mb-2 drop-shadow-md">
              {gotra ? `${gotra} Gotram` : "Your Gotra"}
            </p>
            
            {/* Occasion Badge */}
            {selectedOccasion && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/80 text-white text-xs font-medium border border-primary/50">
                  <selectedOccasion.icon className="h-3 w-3" />
                  {selectedOccasion.label}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground italic">
          🙏 This is a preview. Your personalized Archana video will be sent after the ritual.
        </p>
      </div>
    </div>
  );
};
