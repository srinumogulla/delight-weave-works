import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Users, Info, Camera, X, Heart, MessageCircle } from "lucide-react";

interface StepArchanaDetailsProps {
  recipientName: string;
  setRecipientName: (value: string) => void;
  gotra: string;
  setGotra: (value: string) => void;
  recipientImage: string | null;
  setRecipientImage: (value: string | null) => void;
  senderName: string;
  setSenderName: (value: string) => void;
  senderImage: string | null;
  setSenderImage: (value: string | null) => void;
  senderMessage: string;
  setSenderMessage: (value: string) => void;
}

export const StepArchanaDetails = ({
  recipientName,
  setRecipientName,
  gotra,
  setGotra,
  recipientImage,
  setRecipientImage,
  senderName,
  setSenderName,
  senderImage,
  setSenderImage,
  senderMessage,
  setSenderMessage,
}: StepArchanaDetailsProps) => {
  const recipientFileRef = useRef<HTMLInputElement>(null);
  const senderFileRef = useRef<HTMLInputElement>(null);

  const handleRecipientImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRecipientImage(url);
    }
  };

  const handleSenderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSenderImage(url);
    }
  };

  const removeRecipientImage = () => {
    setRecipientImage(null);
    if (recipientFileRef.current) {
      recipientFileRef.current.value = "";
    }
  };

  const removeSenderImage = () => {
    setSenderImage(null);
    if (senderFileRef.current) {
      senderFileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-sm text-foreground mb-1">
              These details will be used during the Archana
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The priest will recite the recipient's name and gotra while performing the sacred Archana ritual at the temple.
            </p>
          </div>
        </div>
      </div>

      {/* From Section - Sender Details */}
      <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Heart className="h-4 w-4 text-primary" />
          From (Your Details)
        </div>
        
        <div className="flex items-start gap-4">
          {/* Sender Photo */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/40 bg-background flex items-center justify-center overflow-hidden">
              {senderImage ? (
                <img
                  src={senderImage}
                  alt="Sender"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            {senderImage ? (
              <button
                type="button"
                onClick={removeSenderImage}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md"
              >
                <X className="h-3 w-3" />
              </button>
            ) : (
              <label
                htmlFor="sender-photo"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md cursor-pointer hover:bg-primary/90"
              >
                <Camera className="h-3 w-3" />
              </label>
            )}
            <input
              ref={senderFileRef}
              type="file"
              accept="image/*"
              onChange={handleSenderImageUpload}
              className="hidden"
              id="sender-photo"
            />
          </div>
          
          {/* Sender Name */}
          <div className="flex-1 space-y-1">
            <Label htmlFor="senderName" className="text-sm font-medium">
              Your Name
            </Label>
            <Input
              id="senderName"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Enter your name"
              className="h-11"
            />
          </div>
        </div>
      </div>

      {/* To Section - Recipient Details */}
      <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <User className="h-4 w-4 text-primary" />
          To (Recipient Details) *
        </div>
        
        <div className="flex items-start gap-4">
          {/* Recipient Photo */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/40 bg-background flex items-center justify-center overflow-hidden">
              {recipientImage ? (
                <img
                  src={recipientImage}
                  alt="Recipient"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            {recipientImage ? (
              <button
                type="button"
                onClick={removeRecipientImage}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md"
              >
                <X className="h-3 w-3" />
              </button>
            ) : (
              <label
                htmlFor="recipient-photo"
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md cursor-pointer hover:bg-primary/90"
              >
                <Camera className="h-3 w-3" />
              </label>
            )}
            <input
              ref={recipientFileRef}
              type="file"
              accept="image/*"
              onChange={handleRecipientImageUpload}
              className="hidden"
              id="recipient-photo"
            />
          </div>
          
          {/* Recipient Name */}
          <div className="flex-1 space-y-1">
            <Label htmlFor="recipientName" className="text-sm font-medium">
              Recipient's Full Name *
            </Label>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter the full name for the Archana"
              className="h-11"
            />
          </div>
        </div>
      </div>

      {/* Gotra */}
      <div className="space-y-2">
        <Label htmlFor="gotra" className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Gotra
        </Label>
        <Input
          id="gotra"
          value={gotra}
          onChange={(e) => setGotra(e.target.value)}
          placeholder="Enter Gotra (optional)"
          className="h-12 text-base"
        />
        <p className="text-xs text-muted-foreground">
          The ancestral lineage is traditionally recited during Archana (optional)
        </p>
      </div>

      {/* Common Gotras Helper */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Common Gotras:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Bharadwaja",
            "Kashyapa",
            "Vasishta",
            "Vishwamitra",
            "Gautama",
            "Jamadagni",
            "Atri",
            "Agastya",
          ].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGotra(g)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                gotra === g
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Blessing Message */}
      <div className="space-y-2">
        <Label htmlFor="senderMessage" className="text-base font-medium flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          Your Blessing Message (Optional)
        </Label>
        <Textarea
          id="senderMessage"
          value={senderMessage}
          onChange={(e) => setSenderMessage(e.target.value)}
          placeholder="Write a heartfelt message for the recipient... e.g., 'Wishing you good health and happiness on your birthday!'"
          className="min-h-[80px] resize-none"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground flex justify-between">
          <span>This message will appear in the video preview</span>
          <span>{senderMessage.length}/200</span>
        </p>
      </div>

      {/* Preview Card */}
      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800/30">
        <p className="text-sm text-center italic text-amber-900 dark:text-amber-200">
          🙏 <span className="font-medium">{recipientName || "[Name]"}</span>
          {gotra && <span className="font-medium">, {gotra} Gotrasya/Gotrasyah</span>}
        </p>
        <p className="text-xs text-center text-amber-700 dark:text-amber-400 mt-1">
          This is how the priest will recite during the Archana
        </p>
      </div>
    </div>
  );
};
