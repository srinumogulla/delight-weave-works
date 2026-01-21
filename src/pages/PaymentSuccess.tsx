import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, User, ArrowRight, Home } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileLayout } from "@/components/mobile/MobileLayout";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  // Get booking details from URL params (optional)
  const bookingId = searchParams.get('booking_id');
  const serviceName = searchParams.get('service') || 'Pooja';
  const amount = searchParams.get('amount') || '0';

  const content = (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-green-500/20 text-center shadow-xl">
        <CardContent className="pt-10 pb-8 px-6">
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-green-500/10 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-green-500/30 animate-ping" />
          </div>
          
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            Payment Successful!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your booking has been confirmed. 🙏
          </p>

          {/* Booking Details */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left space-y-3">
            {bookingId && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Booking ID</span>
                <span className="font-mono font-medium text-foreground">#{bookingId.slice(0, 8)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium text-foreground">{serviceName}</span>
            </div>
            {amount !== '0' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-green-600">₹{parseInt(amount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle className="h-4 w-4" />
                Confirmed
              </span>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-6">
            <p className="text-sm text-muted-foreground">
              📧 A confirmation email has been sent to your registered email address with all the booking details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate('/profile')}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
            >
              <User className="w-4 h-4 mr-2" />
              View Bookings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/services')}
              className="flex-1"
            >
              Book Another
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="w-full mt-3 text-muted-foreground"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Payment Successful" showBottomNav={false}>
        {content}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {content}
      <Footer />
    </div>
  );
}
