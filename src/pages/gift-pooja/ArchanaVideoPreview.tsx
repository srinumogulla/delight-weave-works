import { Video, Play, Sparkles, Volume2 } from "lucide-react";

interface ArchanaVideoPreviewProps {
  recipientName: string;
  gotra: string;
  occasion: string;
  selectedOccasion?: { value: string; label: string; icon: React.ComponentType<{ className?: string }> };
}

export const ArchanaVideoPreview = ({
  recipientName,
  gotra,
  occasion,
  selectedOccasion,
}: ArchanaVideoPreviewProps) => {
  // Sample Archana video placeholder - YouTube embed for temple archana
  const sampleVideoUrl = "https://www.youtube.com/embed/QdEfYXoEqFY?autoplay=0&mute=1&loop=1&playlist=QdEfYXoEqFY";

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-xl bg-black aspect-video">
        {/* Sample Video Embed */}
        <iframe
          src={sampleVideoUrl}
          title="Sample Archana Video"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        
        {/* Overlay Badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium shadow-lg backdrop-blur-sm">
            <Video className="h-3.5 w-3.5" />
            Sample Video
          </div>
        </div>
        
        {/* Volume indicator */}
        <div className="absolute top-3 right-3 z-10">
          <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <Volume2 className="h-4 w-4 text-white/70" />
          </div>
        </div>
      </div>

      {/* Info Card - What will be in the video */}
      <div className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm text-foreground mb-1">
              Your Personalized Archana Video
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The priest will recite the Archana with <span className="text-primary font-medium">{recipientName || "recipient's name"}</span> 
              {gotra && <> and <span className="text-primary font-medium">{gotra} Gotram</span></>} during the ritual. 
              You'll receive the complete video after the ceremony.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">Recipient Name</p>
          <p className="font-medium text-sm truncate">{recipientName || "—"}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">Gotra (Lineage)</p>
          <p className="font-medium text-sm truncate">{gotra || "—"}</p>
        </div>
      </div>

      {/* Occasion Badge */}
      {selectedOccasion && (
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium border border-accent/30">
            <selectedOccasion.icon className="h-4 w-4" />
            {selectedOccasion.label}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground italic">
          🙏 The above is a sample. Your personalized Archana video will be sent after the ritual.
        </p>
      </div>
    </div>
  );
};
