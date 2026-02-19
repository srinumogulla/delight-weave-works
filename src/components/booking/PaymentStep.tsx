import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Clock, 
  Lock, 
  ChevronLeft,
  Loader2,
  CheckCircle,
  Shield
} from "lucide-react";

interface PaymentStepProps {
  serviceName: string;
  templeName?: string;
  date?: string;
  time?: string;
  amount: number;
  recipientName?: string;
  gotra?: string;
  onPaymentSuccess: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

const paymentMethods = [
  { id: "card", label: "Card", icon: CreditCard, description: "Visa, Mastercard, RuPay" },
  { id: "upi", label: "UPI", icon: Smartphone, description: "GPay, PhonePe, Paytm" },
  { id: "netbanking", label: "Net Banking", icon: Building2, description: "All major banks" },
  { id: "wallet", label: "Wallets", icon: Wallet, description: "Paytm, Amazon Pay" },
  { id: "paylater", label: "Pay Later", icon: Clock, description: "Simpl, LazyPay" },
];

export function PaymentStep({
  serviceName,
  templeName,
  date,
  time,
  amount,
  recipientName,
  gotra,
  onPaymentSuccess,
  onBack,
  isProcessing,
}: PaymentStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("upi");
  const [paymentStarted, setPaymentStarted] = useState(false);

  const handlePayment = async () => {
    setPaymentStarted(true);
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    onPaymentSuccess();
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="w-5 h-5 text-primary" />
          Complete Payment
        </CardTitle>
        <CardDescription>Secure payment for your booking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Order Summary</h4>
          <div className="space-y-2">
            <h3 className="font-heading text-lg font-semibold text-foreground">{serviceName}</h3>
            {templeName && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {templeName}
              </p>
            )}
            {(date || time) && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {date}{date && time && " at "}{time}
              </p>
            )}
          </div>
          {(recipientName || gotra) && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">For:</span> {recipientName}
                {gotra && <span className="text-muted-foreground"> ({gotra} Gotram)</span>}
              </p>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Price Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pooja Fee</span>
              <span className="text-foreground">₹{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="text-foreground">₹0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST</span>
              <span className="text-foreground">Included</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">Total Amount</span>
            <span className="font-heading text-2xl font-bold text-primary">₹{amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Select Payment Method</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`relative p-4 rounded-xl border-2 transition-all text-center group ${
                  selectedMethod === method.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                {selectedMethod === method.id && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${
                  selectedMethod === method.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}>
                  <method.icon className="h-5 w-5" />
                </div>
                <span className={`text-sm font-medium block ${
                  selectedMethod === method.id ? "text-primary" : "text-foreground"
                }`}>
                  {method.label}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {method.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pay Now Button */}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing || paymentStarted}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          size="lg"
        >
          {isProcessing || paymentStarted ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Pay ₹{amount.toLocaleString()} Securely
            </>
          )}
        </Button>

        {/* Security Badges */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-green-600" />
            <span>256-bit SSL Encrypted</span>
            <span className="text-border">•</span>
            <span>PCI DSS Compliant</span>
          </div>
          <div className="flex items-center gap-4 opacity-60">
            <span className="text-xs font-medium text-muted-foreground">Visa</span>
            <span className="text-xs font-medium text-muted-foreground">Mastercard</span>
            <span className="text-xs font-medium text-muted-foreground">RuPay</span>
            <span className="text-xs font-medium text-muted-foreground">UPI</span>
          </div>
        </div>

        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={onBack} 
          disabled={isProcessing || paymentStarted}
          className="w-full"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Review
        </Button>
      </CardContent>
    </Card>
  );
}
