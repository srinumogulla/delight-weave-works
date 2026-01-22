import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { PaymentStep } from "@/components/PaymentStep";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PaymentState {
  type: "booking" | "ritual" | "gift";
  serviceName: string;
  templeName?: string;
  date?: string;
  time?: string;
  amount: number;
  recipientName?: string;
  gotra?: string;
  // Booking specific
  serviceId?: string;
  nakshatra?: string;
  specialRequests?: string;
  // Gift specific
  occasion?: string;
  message?: string;
  senderName?: string;
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentData = location.state as PaymentState | null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!paymentData) {
      navigate("/services");
    }
  }, [paymentData, navigate]);

  if (!paymentData) {
    return null;
  }

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);

    try {
      if (paymentData.type === "booking" && user) {
        const { error } = await supabase.from("bookings").insert({
          user_id: user.id,
          service_id: paymentData.serviceId!,
          booking_date: paymentData.date || new Date().toISOString().split("T")[0],
          time_slot: paymentData.time,
          sankalpa_name: paymentData.recipientName || "",
          gotra: paymentData.gotra,
          nakshatra: paymentData.nakshatra,
          special_requests: paymentData.specialRequests,
          amount: paymentData.amount,
          status: "confirmed",
          payment_status: "paid",
        });

        if (error) throw error;

        toast({
          title: "Booking Confirmed! 🙏",
          description: `Your ${paymentData.serviceName} has been booked successfully.`,
        });

        navigate("/payment/success", {
          state: {
            serviceName: paymentData.serviceName,
            amount: paymentData.amount,
            date: paymentData.date,
          },
        });
      } else if (paymentData.type === "gift" && user) {
        const { error } = await supabase.from("gift_bookings").insert({
          user_id: user.id,
          service_id: paymentData.serviceId!,
          recipient_name: paymentData.recipientName || "",
          gotra: paymentData.gotra,
          occasion: paymentData.occasion,
          message: paymentData.message,
          booking_date: new Date().toISOString().split("T")[0],
          amount: paymentData.amount,
          status: "confirmed",
        });

        if (error) throw error;

        toast({
          title: "Archana Booking Confirmed! 🙏",
          description: "Your gift archana has been booked. We'll send you the video soon.",
        });

        navigate("/payment/success", {
          state: {
            serviceName: paymentData.serviceName,
            amount: paymentData.amount,
            isGift: true,
            recipientName: paymentData.recipientName,
          },
        });
      } else if (paymentData.type === "ritual") {
        toast({
          title: "Registration Successful! 🙏",
          description: `You have registered for ${paymentData.serviceName}. Payment confirmed!`,
        });

        navigate("/payment/success", {
          state: {
            serviceName: paymentData.serviceName,
            amount: paymentData.amount,
            date: paymentData.date,
          },
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const content = (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <PaymentStep
        serviceName={paymentData.serviceName}
        templeName={paymentData.templeName}
        date={paymentData.date}
        time={paymentData.time}
        amount={paymentData.amount}
        recipientName={paymentData.recipientName}
        gotra={paymentData.gotra}
        onPaymentSuccess={handlePaymentSuccess}
        onBack={handleBack}
        isProcessing={isProcessing}
      />
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Payment" showSearch={false}>
        {content}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {content}
      <Footer />
    </div>
  );
};

export default Payment;
