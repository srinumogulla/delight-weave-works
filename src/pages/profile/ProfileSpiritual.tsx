import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Settings, CheckCircle, Calendar, Clock, MapPin } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { TimePickerAMPM } from '@/components/ui/time-picker-ampm';
import { CityAutocomplete } from '@/components/ui/city-autocomplete';

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

const ProfileSpiritual = () => {
  const { user, profile, refreshProfile } = useAuth();
  const isMobile = useIsMobile();
  
  const [gotra, setGotra] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [rashi, setRashi] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setGotra(profile.gotra || '');
      setNakshatra(profile.nakshatra || '');
      setRashi(profile.rashi || '');
      setDateOfBirth(profile.date_of_birth || '');
      setTimeOfBirth(profile.time_of_birth || '');
      setBirthLocation(profile.birth_location || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          gotra,
          nakshatra,
          rashi,
          date_of_birth: dateOfBirth || null,
          time_of_birth: timeOfBirth || null,
          birth_location: birthLocation || null,
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

  const content = (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-sanskrit text-saffron">Spiritual Details</h1>
          <p className="text-muted-foreground text-sm">Update your spiritual information for personalized poojas</p>
        </div>

        <Card className="border-saffron/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Spiritual Information
            </CardTitle>
            <CardDescription>These details help personalize your pooja experience</CardDescription>
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
                  <AlertDescription className="text-green-500">Spiritual details updated successfully!</AlertDescription>
                </Alert>
              )}

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

              {/* Birth Details Section */}
              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Birth Details (for Kundali)
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  These details help calculate your horoscope and personalize pooja recommendations.
                </p>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time of Birth
                    </Label>
                    <TimePickerAMPM
                      value={timeOfBirth}
                      onChange={setTimeOfBirth}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Birth Location
                    </Label>
                    <CityAutocomplete
                      value={birthLocation}
                      onChange={(value) => setBirthLocation(value)}
                      placeholder="e.g., Chennai, Tamil Nadu"
                    />
                  </div>
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
                  'Save Spiritual Details'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Spiritual Details">
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
};

export default ProfileSpiritual;
