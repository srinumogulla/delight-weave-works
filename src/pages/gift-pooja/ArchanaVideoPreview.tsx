import { Video, Sparkles, User } from "lucide-react";

interface ArchanaVideoPreviewProps {
  recipientName: string;
  gotra: string;
  occasion: string;
  selectedOccasion?: { value: string; label: string; icon: React.ComponentType<{ className?: string }> };
  recipientImage: string | null;
}

export const ArchanaVideoPreview = ({
  recipientName,
  gotra,
  selectedOccasion,
  recipientImage,
}: ArchanaVideoPreviewProps) => {
  // Better sample Archana video - temple pooja video
  const sampleVideoUrl = "https://www.youtube.com/embed/5qap5aO4i9A?autoplay=0&mute=1&loop=1&playlist=5qap5aO4i9A&controls=0&modestbranding=1";

  return (
    <div className="space-y-3">
      {/* 16:9 Video Container with Overlay */}
      <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary/30 shadow-xl bg-gradient-to-br from-amber-900 to-orange-900">
        {/* Video Background */}
        <iframe
          src={sampleVideoUrl}
          title="Sample Archana Video"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
        
        {/* Sample Badge - Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium shadow-lg backdrop-blur-sm">
            <Video className="h-3.5 w-3.5" />
            Sample Video
          </div>
        </div>

        {/* Text Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10 pointer-events-none">
          <div className="flex items-end gap-4">
            {/* Recipient Photo */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-3 border-white/80 shadow-xl overflow-hidden bg-white/20 backdrop-blur-sm">
                {recipientImage ? (
                  <img
                    src={recipientImage}
                    alt="Recipient"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-8 w-8 md:h-10 md:w-10 text-white/70" />
                  </div>
                )}
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              {/* Decorative Icon */}
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs text-white/70 uppercase tracking-wider">Personalized Archana</span>
              </div>
              
              {/* Recipient Name */}
              <h3 className="text-lg md:text-2xl font-bold text-white mb-0.5 drop-shadow-lg truncate">
                {recipientName || "Recipient Name"}
              </h3>
              
              {/* Gotra */}
              {gotra && (
                <p className="text-sm md:text-base text-white/90 font-medium mb-2 drop-shadow-md">
                  {gotra} Gotram
                </p>
              )}
              
              {/* Occasion Badge */}
              {selectedOccasion && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium border border-white/30">
                  <selectedOccasion.icon className="h-3 w-3" />
                  {selectedOccasion.label}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground italic">
          🙏 The above is a sample. Your personalized Archana video will be sent after the ritual.
        </p>
      </div>
    </div>
  );
};
