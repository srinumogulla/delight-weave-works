import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Shield, Check, Clock, Package } from "lucide-react";

interface StepRecipientDetailsProps {
  recipientEmail: string;
  setRecipientEmail: (value: string) => void;
  recipientPhone: string;
  setRecipientPhone: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
}

export const StepRecipientDetails = ({
  recipientEmail,
  setRecipientEmail,
  recipientPhone,
  setRecipientPhone,
  message,
  setMessage,
}: StepRecipientDetailsProps) => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="recipientEmail" className="text-base font-medium flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Recipient Email
        </Label>
        <Input
          id="recipientEmail"
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="For gift notification"
          className="h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="recipientPhone" className="text-base font-medium flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          Recipient Phone
        </Label>
        <Input
          id="recipientPhone"
          type="tel"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
          placeholder="For WhatsApp updates"
          className="h-12"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="message" className="text-base font-medium">Additional Notes (Optional)</Label>
      <Textarea
        id="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Any special instructions or requests for the pooja..."
        rows={3}
        className="resize-none"
      />
    </div>

    {/* Trust Badges */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
      {[
        { icon: Shield, text: "100% Authentic" },
        { icon: Check, text: "Verified Priests" },
        { icon: Clock, text: "Timely Rituals" },
        { icon: Package, text: "Safe Delivery" },
      ].map((badge, i) => (
        <div key={i} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <badge.icon className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">{badge.text}</span>
        </div>
      ))}
    </div>
  </div>
);
