import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle, User, UserCheck, Calendar, MapPin, Phone } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { TimePickerAMPM } from '@/components/ui/time-picker-ampm';
import { CityAutocomplete } from '@/components/ui/city-autocomplete';

type UserRole = 'user' | 'pundit';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  
  // Additional devotee fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  
  // Additional pundit fields
  const [poojaType, setPoojaType] = useState<'dashachara' | 'vamachara'>('dashachara');
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (selectedRole === 'user') {
      if (!dateOfBirth || !birthLocation || !phone || !gender) {
        setError('Please fill in all required fields including gender');
        return;
      }
    } else if (selectedRole === 'pundit') {
      if (!phone) {
        setError('Please provide your mobile number');
        return;
      }
    }

    setLoading(true);

    try {
      const { error: signUpError } = await signUp({
        full_name: fullName,
        email,
        password,
        phone,
        role: selectedRole,
        date_of_birth: dateOfBirth || undefined,
        time_of_birth: timeOfBirth || undefined,
        birth_place_name: birthLocation || undefined,
        gender: selectedRole === 'user' ? gender || undefined : undefined,
      });
      
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          if (selectedRole === 'pundit') {
            navigate('/pundit/profile');
          } else {
            navigate('/');
          }
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'user' as UserRole, label: 'Devotee', description: 'Book poojas and track spiritual journey', icon: User },
    { value: 'pundit' as UserRole, label: 'Pundit', description: 'Offer pooja services and manage bookings', icon: UserCheck },
  ];

  const successContent = (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-green-500/20">
        <CardContent className="pt-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-sanskrit text-saffron mb-2">Account Created!</h2>
          <p className="text-muted-foreground mb-4">
            {selectedRole === 'pundit' 
              ? 'Your pundit profile is pending admin approval. Complete your profile to speed up the process.'
              : 'Welcome to our spiritual community. You are now signed in.'}
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting you to {selectedRole === 'pundit' ? 'complete your profile' : 'home'}...
          </p>
        </CardContent>
      </Card>
    </main>
  );

  const signupContent = (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg border-saffron/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-saffron to-gold flex items-center justify-center">
            <span className="text-3xl">🙏</span>
          </div>
          <CardTitle className="text-2xl font-sanskrit text-saffron">Join Our Community</CardTitle>
          <CardDescription>Create an account to book poojas and track your spiritual journey</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I am signing up as</Label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedRole === role.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <role.icon className={`h-5 w-5 mb-2 ${selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="font-medium text-sm">{role.label}</div>
                    <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" type="text" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>

            {selectedRole === 'user' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Date of Birth *</Label>
                    <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">Time of Birth</Label>
                    <TimePickerAMPM value={timeOfBirth} onChange={setTimeOfBirth} disabled={loading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Birth Location *</Label>
                  <CityAutocomplete value={birthLocation} onChange={(value) => setBirthLocation(value)} placeholder="City, State, Country" disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><User className="h-4 w-4 text-primary" />Gender *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setGender('male')} disabled={loading} className={`p-3 rounded-lg border-2 transition-all ${gender === 'male' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                      <span className="font-medium text-sm">Male</span>
                    </button>
                    <button type="button" onClick={() => setGender('female')} disabled={loading} className={`p-3 rounded-lg border-2 transition-all ${gender === 'female' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                      <span className="font-medium text-sm">Female</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />Mobile Number *</Label>
              <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={loading} />
            </div>

            {selectedRole === 'pundit' && (
              <div className="space-y-2">
                <Label>Type of Pooja *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPoojaType('dashachara')} disabled={loading} className={`p-3 rounded-lg border-2 text-left transition-all ${poojaType === 'dashachara' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    <span className="font-medium text-sm">Dashachara</span>
                    <p className="text-xs text-muted-foreground mt-1">Traditional Vedic rituals</p>
                  </button>
                  <button type="button" onClick={() => setPoojaType('vamachara')} disabled={loading} className={`p-3 rounded-lg border-2 text-left transition-all ${poojaType === 'vamachara' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    <span className="font-medium text-sm">Vamachara</span>
                    <p className="text-xs text-muted-foreground mt-1">Tantric practices</p>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-gradient-to-r from-saffron to-gold text-temple-dark hover:from-saffron/90 hover:to-gold/90" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : `Create ${selectedRole === 'pundit' ? 'Pundit ' : ''}Account`}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-saffron hover:underline">Sign in</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Create Account" showBottomNav={true}>
        {success ? successContent : signupContent}
      </MobileLayout>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        {successContent}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {signupContent}
      <Footer />
    </div>
  );
};

export default Signup;
