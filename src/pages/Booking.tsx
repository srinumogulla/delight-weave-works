import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, Calendar as CalendarIcon, User, Clock, CreditCard } from 'lucide-react';
import { PaymentStep } from '@/components/PaymentStep';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { format, addDays } from 'date-fns';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  temple: string;
  image_url: string;
  benefits: string[];
  scheduled_date: string | null;
  scheduled_time: string | null;
}

const timeSlots = [
  '6:00 AM - 7:00 AM',
  '7:00 AM - 8:00 AM',
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM',
  '6:00 PM - 7:00 PM',
];

const nakshatras = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const Booking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();

  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);

  // Form state
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [timeSlot, setTimeSlot] = useState('');
  const [sankalpaName, setSankalpaName] = useState('');
  const [gotra, setGotra] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [serviceId]);

  useEffect(() => {
    if (profile) {
      setSankalpaName(profile.full_name || '');
      setGotra(profile.gotra || '');
      setNakshatra(profile.nakshatra || '');
    }
  }, [profile]);

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const fetchService = async () => {
    if (!serviceId) {
      navigate('/services');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pooja_services')
        .select('*')
        .eq('id', serviceId)
        .maybeSingle();

      if (error || !data) {
        navigate('/services');
        return;
      }

      setService(data as Service);
    } catch (err) {
      console.error('Error fetching service:', err);
      navigate('/services');
    }
    setLoading(false);
  };

  const handlePaymentSuccess = async () => {
    if (!user || !service || !date || !timeSlot || !sankalpaName) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          service_id: service.id,
          booking_date: format(date, 'yyyy-MM-dd'),
          time_slot: timeSlot,
          sankalpa_name: sankalpaName,
          gotra: gotra || null,
          nakshatra: nakshatra || null,
          special_requests: specialRequests || null,
          amount: service.price,
          status: 'confirmed',
          payment_status: 'paid',
        });

      if (error) throw error;

      setBookingComplete(true);
    } catch (err: unknown) {
      setError((err as Error).message);
    }
    setSubmitting(false);
  };

  const nextStep = () => {
    if (step === 1 && !sankalpaName) {
      setError('Please enter the name for sankalpa');
      return;
    }
    setError('');
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleProceedToPayment = () => {
    if (!service) return;
    navigate("/payment", {
      state: {
        type: "booking",
        serviceName: service.name,
        templeName: service.temple,
        date: service.scheduled_date || date ? format(date!, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
        time: service.scheduled_time || timeSlot,
        amount: service.price,
        recipientName: sankalpaName,
        gotra: gotra,
        serviceId: service.id,
        nakshatra: nakshatra,
        specialRequests: specialRequests,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-saffron" />
      </div>
    );
  }

  const bookingConfirmation = (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-green-500/20 text-center">
        <CardContent className="pt-8">
          <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
          <h2 className="text-2xl font-sanskrit text-saffron mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-6">
            Your {service?.name} has been booked for {format(date!, 'MMMM d, yyyy')} at {timeSlot}.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            You will receive a confirmation email shortly with all the details.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => navigate('/profile')}
              className="bg-gradient-to-r from-saffron to-gold text-temple-dark"
            >
              View Bookings
            </Button>
            <Button variant="outline" onClick={() => navigate('/services')}>
              Book Another
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );

  const bookingForm = (
    <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Service Header */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/services')}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-sanskrit text-saffron truncate">{service?.name}</h1>
            <p className="text-sm text-muted-foreground truncate">{service?.temple}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl md:text-2xl font-bold text-gold">₹{service?.price}</p>
            <p className="text-xs text-muted-foreground">{service?.duration}</p>
          </div>
        </div>

        {/* Progress Steps - Now 4 steps */}
        <div className="flex items-center justify-center mb-6 md:mb-8 overflow-x-auto">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm ${
                s === step ? 'bg-saffron text-temple-dark' : 
                s < step ? 'bg-green-500 text-white' : 'bg-temple-dark text-muted-foreground'
              }`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-6 md:w-12 h-1 ${s < step ? 'bg-green-500' : 'bg-temple-dark'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels - Hidden on mobile */}
        <div className="hidden md:flex justify-between mb-8 text-sm text-muted-foreground">
          <span className={step >= 1 ? 'text-saffron' : ''}>Sankalpa</span>
          <span className={step >= 2 ? 'text-saffron' : ''}>Requests</span>
          <span className={step >= 3 ? 'text-saffron' : ''}>Review</span>
          <span className={step >= 4 ? 'text-saffron' : ''}>Payment</span>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Sankalpa Details */}
        {step === 1 && (
          <Card className="border-saffron/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-saffron" />
                Sankalpa Details
              </CardTitle>
              <CardDescription>Enter the details for the sankalpa (sacred intention)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Scheduled Date & Time Display */}
              {(service?.scheduled_date || service?.scheduled_time) && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Scheduled by Temple</p>
                  <div className="flex flex-wrap gap-4">
                    {service?.scheduled_date && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{service.scheduled_date}</span>
                      </div>
                    )}
                    {service?.scheduled_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">{service.scheduled_time}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="sankalpaName">Name for Sankalpa *</Label>
                <Input
                  id="sankalpaName"
                  value={sankalpaName}
                  onChange={(e) => setSankalpaName(e.target.value)}
                  placeholder="Enter the name of the person for whom the pooja is being performed"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gotra">Gotra (Family Lineage)</Label>
                  <Input
                    id="gotra"
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    placeholder="e.g., Kashyapa, Bharadwaja"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nakshatra">Nakshatra (Birth Star)</Label>
                  <select
                    id="nakshatra"
                    value={nakshatra}
                    onChange={(e) => setNakshatra(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select nakshatra</option>
                    {nakshatras.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-saffron/5 border border-saffron/20 rounded-lg p-4 text-sm">
                <p className="text-saffron font-medium mb-1">💡 Tip</p>
                <p className="text-muted-foreground">
                  Providing your gotra and nakshatra helps the priest personalize the sankalpa 
                  and mantras for maximum spiritual benefit.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Special Requests */}
        {step === 2 && (
          <Card className="border-saffron/20">
            <CardHeader>
              <CardTitle className="text-lg">Special Requests</CardTitle>
              <CardDescription>Any additional instructions or requests for the pooja</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Instructions (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="E.g., Please include specific mantras, family member names, or any special prayers..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <Card className="border-saffron/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5 text-saffron" />
                Review & Confirm
              </CardTitle>
              <CardDescription>Please review your booking details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-temple-dark/30 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">{service?.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="text-foreground">{service?.scheduled_date || 'To be confirmed'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="text-foreground">{service?.scheduled_time || 'To be confirmed'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Temple</p>
                    <p className="text-foreground">{service?.temple}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="text-foreground">{service?.duration}</p>
                  </div>
                </div>
              </div>

              <div className="bg-temple-dark/30 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Sankalpa Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="text-foreground">{sankalpaName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gotra</p>
                    <p className="text-foreground">{gotra || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nakshatra</p>
                    <p className="text-foreground">{nakshatra || 'Not specified'}</p>
                  </div>
                </div>
                {specialRequests && (
                  <div className="mt-3">
                    <p className="text-muted-foreground text-sm">Special Requests</p>
                    <p className="text-foreground text-sm">{specialRequests}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-saffron/10 rounded-lg border border-saffron/20">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl md:text-3xl font-bold text-gold">₹{service?.price}</p>
                </div>
                <Badge className="bg-primary">Proceed to Pay</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        {step <= 3 && (
          <div className="flex justify-between mt-6 md:mt-8">
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button onClick={nextStep} className="bg-gradient-to-r from-saffron to-gold text-temple-dark">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleProceedToPayment}
                className="bg-gradient-to-r from-saffron to-gold text-temple-dark"
              >
                Proceed to Payment
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout title={bookingComplete ? "Booking Confirmed" : "Book Pooja"} showBottomNav={false}>
        {bookingComplete ? bookingConfirmation : bookingForm}
      </MobileLayout>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        {bookingConfirmation}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {bookingForm}
      <Footer />
    </div>
  );
};

export default Booking;