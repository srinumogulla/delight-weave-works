import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Heart, Cake, Star, Leaf, ArrowRight } from "lucide-react";

const occasions = [
  { value: "birthday", label: "Birthday", icon: Cake },
  { value: "health", label: "Health & Recovery", icon: Heart },
  { value: "anniversary", label: "Anniversary", icon: Star },
  { value: "memory", label: "In Memory", icon: Leaf },
  { value: "blessing", label: "General Blessing", icon: Gift },
  { value: "other", label: "Other", icon: Gift },
];

const GiftPooja = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedService, setSelectedService] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [occasion, setOccasion] = useState("");
  const [message, setMessage] = useState("");
  const [sendPrasadam, setSendPrasadam] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ["active-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pooja_services")
        .select("id, name, price")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to gift a pooja.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!selectedService || !recipientName || !occasion) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("gift_bookings").insert({
        user_id: user.id,
        service_id: selectedService,
        recipient_name: recipientName,
        recipient_email: recipientEmail || null,
        recipient_phone: recipientPhone || null,
        recipient_address: sendPrasadam ? recipientAddress : null,
        occasion,
        message: message || null,
        booking_date: new Date().toISOString().split("T")[0],
        amount: selectedServiceData?.price || 0,
        send_prasadam: sendPrasadam,
      });

      if (error) throw error;

      toast({
        title: "Gift booking created!",
        description: "We'll process your gift pooja and notify the recipient.",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create gift booking.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-16 md:py-24">
        <BackgroundPattern opacity={0.1} />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
              <Gift className="h-4 w-4" />
              Gift a Blessing
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Gift a <span className="text-primary">Pooja</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Sponsor or gift a pooja for friends, family, or loved ones. 
              Share blessings for birthdays, health, anniversaries, or special occasions.
            </p>
          </div>
        </div>
      </section>

      {/* Occasions Grid */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {occasions.map((occ) => (
              <button
                key={occ.value}
                onClick={() => setOccasion(occ.value)}
                className={`p-4 rounded-xl border transition-all text-center ${
                  occasion === occ.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <occ.icon className={`h-6 w-6 mx-auto mb-2 ${occasion === occ.value ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">{occ.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-muted">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl border border-border space-y-6">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                Gift Details
              </h2>

              {/* Select Pooja */}
              <div className="space-y-2">
                <Label htmlFor="service">Select Pooja *</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pooja" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - Rs {Number(service.price).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipient Name */}
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name *</Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Enter recipient's full name"
                  required
                />
              </div>

              {/* Recipient Contact */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="For gift notification"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">Recipient Phone</Label>
                  <Input
                    id="recipientPhone"
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="For WhatsApp notification"
                  />
                </div>
              </div>

              {/* Prasadam Delivery */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <Label>Send Prasadam to Recipient</Label>
                  <p className="text-sm text-muted-foreground">
                    Deliver blessed prasadam to their doorstep
                  </p>
                </div>
                <Switch
                  checked={sendPrasadam}
                  onCheckedChange={setSendPrasadam}
                />
              </div>

              {/* Recipient Address */}
              {sendPrasadam && (
                <div className="space-y-2">
                  <Label htmlFor="recipientAddress">Delivery Address</Label>
                  <Textarea
                    id="recipientAddress"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Complete address for prasadam delivery"
                    rows={3}
                  />
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a heartfelt message for the recipient"
                  rows={4}
                />
              </div>

              {/* Summary */}
              {selectedServiceData && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Gift Amount</span>
                    <span className="font-heading text-2xl font-bold text-primary">
                      Rs {Number(selectedServiceData.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Gift This Pooja"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout showHeader={true}>
        {content}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>{content}</main>
      <Footer />
    </div>
  );
};

export default GiftPooja;