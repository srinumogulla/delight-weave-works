import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, LogOut, CheckCircle, Mail, Calendar, Clock, MapPin, Bell } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { TimePickerAMPM } from '@/components/ui/time-picker-ampm';
import { CityAutocomplete } from '@/components/ui/city-autocomplete';
import { Switch } from '@/components/ui/switch';

const ProfileDetails = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Basic profile fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Birth details fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  
  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    upcoming_poojas: true,
    festival_reminders: true,
    booking_updates: true
  });
  const [loadingNotifPrefs, setLoadingNotifPrefs] = useState(true);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setDateOfBirth(profile.date_of_birth || '');
      setTimeOfBirth(profile.time_of_birth || '');
      setBirthLocation(profile.birth_location || '');
    }
  }, [profile]);

  // Load notification preferences
  useEffect(() => {
    const loadNotifPrefs = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setNotifPrefs({
            upcoming_poojas: data.upcoming_poojas ?? true,
            festival_reminders: data.festival_reminders ?? true,
            booking_updates: data.booking_updates ?? true
          });
        }
      } catch (err) {
        console.log('No existing notification preferences');
      }
      setLoadingNotifPrefs(false);
    };
    
    loadNotifPrefs();
  }, [user]);

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

  const handleNotifPrefChange = async (key: keyof typeof notifPrefs, value: boolean) => {
    const newPrefs = { ...notifPrefs, [key]: value };
    setNotifPrefs(newPrefs);
    
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user?.id,
          ...newPrefs
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
    } catch (err) {
      console.error('Error saving notification preference:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const content = (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-sanskrit text-saffron">My Profile</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="text-red-500 border-red-500/20 hover:bg-red-500/10">
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>

        <Card className="border-saffron/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal and birth details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
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

              {/* Email - Read Only */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

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

              {/* Birth Details Section */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-4 text-muted-foreground">Birth Details (for Kundali)</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth
                    </Label>
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
                </div>
                <div className="space-y-2 mt-4">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Birth Location
                  </Label>
                  <CityAutocomplete
                    value={birthLocation}
                    onChange={(value) => setBirthLocation(value)}
                    placeholder="City, State, Country"
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

        {/* Notification Preferences Card */}
        <Card className="border-saffron/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Manage your notification settings</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingNotifPrefs ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Upcoming Poojas</Label>
                    <p className="text-xs text-muted-foreground">Reminders for your booked poojas</p>
                  </div>
                  <Switch
                    checked={notifPrefs.upcoming_poojas}
                    onCheckedChange={(checked) => handleNotifPrefChange('upcoming_poojas', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Festival Reminders</Label>
                    <p className="text-xs text-muted-foreground">Alerts for upcoming Hindu festivals</p>
                  </div>
                  <Switch
                    checked={notifPrefs.festival_reminders}
                    onCheckedChange={(checked) => handleNotifPrefChange('festival_reminders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Booking Updates</Label>
                    <p className="text-xs text-muted-foreground">Status updates for your bookings</p>
                  </div>
                  <Switch
                    checked={notifPrefs.booking_updates}
                    onCheckedChange={(checked) => handleNotifPrefChange('booking_updates', checked)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Profile">
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

export default ProfileDetails;
