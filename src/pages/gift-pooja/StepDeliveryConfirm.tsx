import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Package, MapPin } from "lucide-react";

interface StepDeliveryConfirmProps {
  sendPrasadam: boolean;
  setSendPrasadam: (value: boolean) => void;
  recipientAddress: string;
  setRecipientAddress: (value: string) => void;
  selectedServiceData: { name: string; price: number } | undefined;
  selectedOccasion: { value: string; label: string } | undefined;
  senderName: string;
  recipientName: string;
}

export const StepDeliveryConfirm = ({
  sendPrasadam,
  setSendPrasadam,
  recipientAddress,
  setRecipientAddress,
  selectedServiceData,
  selectedOccasion,
  senderName,
  recipientName,
}: StepDeliveryConfirmProps) => (
  <div className="space-y-6">
    {/* Prasadam Delivery Toggle */}
    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div>
          <Label className="text-base font-medium">Send Prasadam to Recipient</Label>
          <p className="text-sm text-muted-foreground">
            Deliver blessed prasadam to their doorstep
          </p>
        </div>
      </div>
      <Switch
        checked={sendPrasadam}
        onCheckedChange={setSendPrasadam}
      />
    </div>

    {/* Recipient Address */}
    {sendPrasadam && (
      <div className="space-y-2">
        <Label htmlFor="recipientAddress" className="text-base font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          Delivery Address *
        </Label>
        <Textarea
          id="recipientAddress"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Complete address for prasadam delivery"
          rows={3}
          className="resize-none"
        />
      </div>
    )}

    {/* Order Summary */}
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 bg-muted/50 border-b border-border">
        <h3 className="font-heading text-lg font-semibold">Order Summary</h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pooja</span>
          <span className="font-medium">{selectedServiceData?.name || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Occasion</span>
          <span className="font-medium">{selectedOccasion?.label || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">From</span>
          <span className="font-medium">{senderName || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">To</span>
          <span className="font-medium">{recipientName || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Prasadam Delivery</span>
          <span className="font-medium">{sendPrasadam ? "Yes" : "No"}</span>
        </div>
        <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
          <span className="font-medium">Total Amount</span>
          <span className="font-heading text-2xl font-bold text-primary">
            ₹{Number(selectedServiceData?.price || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  </div>
);
