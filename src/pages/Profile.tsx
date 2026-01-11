import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Calendar, Heart, Settings, LogOut, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { format } from 'date-fns';

interface Booking {
  id: string;
  booking_date: string;
  time_slot: string;
  sankalpa_name: string;
  status: string;
  amount: number;
  service: {
    name: string;
    image_url: string;
  };
}

interface SavedPooja {
  id: string;
  service: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    temple: string;
  };
}

const Profile = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gotra, setGotra] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [rashi, setRashi] = useState('');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedPoojas, setSavedPoojas] = useState<SavedPooja[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setGotra(profile.gotra || '');
      setNakshatra(profile.nakshatra || '');
      setRashi(profile.rashi || '');
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchSavedPoojas();
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          time_slot,
          sankalpa_name,
          status,
          amount,
          service:pooja_services(name, image_url)
        `)
        .eq('user_id', user?.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data as unknown as Booking[] || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
    setLoading(false);
  };

  const fetchSavedPoojas = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_poojas')
        .select(`
          id,
          service:pooja_services(id, name, price, image_url, temple)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setSavedPoojas(data as unknown as SavedPooja[] || []);
    } catch (err) {
      console.error('Error fetching saved poojas:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          gotra,
          nakshatra,
          rashi,
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      setSuccess(true);
      await refreshProfile();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err as Error).message);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const removeSavedPooja = async (savedPoojaId: string) => {
    try {
      await supabase
        .from('saved_poojas')
        .delete()
        .eq('id', savedPoojaId);
      
      setSavedPoojas(savedPoojas.filter(sp => sp.id !== savedPoojaId));
    } catch (err) {
      console.error('Error removing saved pooja:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const nakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  const rashis = [
    'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
    'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
    'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-sanskrit text-saffron">My Profile</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="text-red-500 border-red-500/20 hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-temple-dark/50">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Saved</span>
              </TabsTrigger>
              <TabsTrigger value="spiritual" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Spiritual</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="border-saffron/20">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert className="border-green-500/20 bg-green-500/10">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <AlertDescription className="text-green-500">Profile updated successfully!</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-saffron to-gold text-temple-dark"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card className="border-saffron/20">
                <CardHeader>
                  <CardTitle>Booking History</CardTitle>
                  <CardDescription>View your past and upcoming pooja bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-saffron" />
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No bookings yet</p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-saffron to-gold text-temple-dark"
                        onClick={() => navigate('/services')}
                      >
                        Book a Pooja
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div 
                          key={booking.id}
                          className="flex items-center gap-4 p-4 rounded-lg bg-temple-dark/30 border border-saffron/10"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-temple-dark">
                            <img 
                              src={booking.service?.image_url || '/ritual-pooja.jpg'} 
                              alt={booking.service?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{booking.service?.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(booking.booking_date), 'MMMM d, yyyy')} • {booking.time_slot}
                            </p>
                            <p className="text-sm text-saffron">For: {booking.sankalpa_name}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            <p className="text-sm text-gold mt-1">₹{booking.amount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved">
              <Card className="border-saffron/20">
                <CardHeader>
                  <CardTitle>Saved Poojas</CardTitle>
                  <CardDescription>Your favorite poojas for quick booking</CardDescription>
                </CardHeader>
                <CardContent>
                  {savedPoojas.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No saved poojas</p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-saffron to-gold text-temple-dark"
                        onClick={() => navigate('/services')}
                      >
                        Browse Poojas
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {savedPoojas.map((saved) => (
                        <div 
                          key={saved.id}
                          className="p-4 rounded-lg bg-temple-dark/30 border border-saffron/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-temple-dark">
                              <img 
                                src={saved.service?.image_url || '/ritual-pooja.jpg'} 
                                alt={saved.service?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{saved.service?.name}</h3>
                              <p className="text-sm text-muted-foreground">{saved.service?.temple}</p>
                              <p className="text-sm text-gold">₹{saved.service?.price}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-saffron to-gold text-temple-dark"
                              onClick={() => navigate(`/booking/${saved.service?.id}`)}
                            >
                              Book Now
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => removeSavedPooja(saved.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="spiritual">
              <Card className="border-saffron/20">
                <CardHeader>
                  <CardTitle>Spiritual Details</CardTitle>
                  <CardDescription>Update your spiritual information for personalized poojas</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gotra">Gotra (Family Lineage)</Label>
                      <Input
                        id="gotra"
                        value={gotra}
                        onChange={(e) => setGotra(e.target.value)}
                        placeholder="e.g., Kashyapa, Bharadwaja, Vasishtha"
                      />
                      <p className="text-xs text-muted-foreground">Your ancestral sage lineage used in sankalpam</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nakshatra">Nakshatra (Birth Star)</Label>
                      <select
                        id="nakshatra"
                        value={nakshatra}
                        onChange={(e) => setNakshatra(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Select your nakshatra</option>
                        {nakshatras.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rashi">Rashi (Moon Sign)</Label>
                      <select
                        id="rashi"
                        value={rashi}
                        onChange={(e) => setRashi(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Select your rashi</option>
                        {rashis.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-saffron to-gold text-temple-dark"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Spiritual Details'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
