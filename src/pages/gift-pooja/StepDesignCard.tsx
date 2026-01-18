import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, X, Upload, User, Camera } from "lucide-react";

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

interface StepDesignCardProps {
  giftTemplates: GiftTemplate[];
  selectedTemplate: string;
  setSelectedTemplate: (value: string) => void;
  customBackground: string | null;
  setCustomBackground: (value: string | null) => void;
  senderName: string;
  setSenderName: (value: string) => void;
  recipientName: string;
  setRecipientName: (value: string) => void;
  senderImage: string | null;
  setSenderImage: (value: string | null) => void;
  recipientImage: string | null;
  setRecipientImage: (value: string | null) => void;
  senderMessage: string;
  setSenderMessage: (value: string) => void;
}

export const StepDesignCard = ({
  giftTemplates,
  selectedTemplate,
  setSelectedTemplate,
  customBackground,
  setCustomBackground,
  senderName,
  setSenderName,
  recipientName,
  setRecipientName,
  senderImage,
  setSenderImage,
  recipientImage,
  setRecipientImage,
  senderMessage,
  setSenderMessage,
}: StepDesignCardProps) => {
  const senderInputRef = useRef<HTMLInputElement>(null);
  const recipientInputRef = useRef<HTMLInputElement>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);

  const handleCustomBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomBackground(url);
      setSelectedTemplate("custom");
    }
    e.target.value = "";
  };

  const handleSenderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSenderImage(url);
    }
    e.target.value = "";
  };

  const handleRecipientImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRecipientImage(url);
    }
    e.target.value = "";
  };

  return (
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
                onClick={() => setCustomBackground(null)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => customBgInputRef.current?.click()}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/50"
            >
              <Upload className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-xs font-medium text-muted-foreground text-center">Upload<br/>Custom</span>
            </button>
          )}
          <input 
            ref={customBgInputRef}
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleCustomBackgroundUpload} 
          />
        </div>
      </div>

      {/* Names and Photos */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="senderName" className="text-base font-medium">From (Your Name) *</Label>
          <div className="flex gap-3">
            <div className="relative flex-shrink-0">
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
                  onClick={() => setSenderImage(null)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => senderInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-3 w-3" />
                </button>
              )}
              <input 
                ref={senderInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleSenderImageUpload} 
              />
            </div>
            <Input
              id="senderName"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Enter your name"
              className="flex-1 h-12"
            />
          </div>
          <p className="text-xs text-muted-foreground">Click camera to add your photo</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="recipientName" className="text-base font-medium">To (Recipient Name) *</Label>
          <div className="flex gap-3">
            <div className="relative flex-shrink-0">
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
                  onClick={() => setRecipientImage(null)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => recipientInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center cursor-pointer hover:bg-accent/90 transition-colors"
                >
                  <Camera className="h-3 w-3" />
                </button>
              )}
              <input 
                ref={recipientInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleRecipientImageUpload} 
              />
            </div>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter recipient's name"
              className="flex-1 h-12"
            />
          </div>
          <p className="text-xs text-muted-foreground">Click camera to add recipient's photo</p>
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
};
