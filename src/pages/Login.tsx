import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Phone } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mobile OTP state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  const { signIn, sendMobileCode, signInWithMobile, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [loginSuccess, setLoginSuccess] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const redirectByRole = (userRole: string | null) => {
    if (userRole === 'admin') navigate('/admin', { replace: true });
    else if (userRole === 'guru' || userRole === 'pundit') navigate('/pundit', { replace: true });
    else if (userRole === 'temple') navigate('/temple', { replace: true });
    else navigate(from, { replace: true });
  };

  // Wait for role to be loaded after a successful sign-in, then redirect
  useEffect(() => {
    if (loginSuccess && !authLoading) {
      setLoginSuccess(false);
      redirectByRole(role);
    }
  }, [loginSuccess, role, authLoading]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    setLoginSuccess(true);
  };

  const handleSendOtp = async () => {
    setError('');
    setLoading(true);
    const { error } = await sendMobileCode(phone);
    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signInWithMobile(phone, otp);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    setLoginSuccess(true);
  };

  const loginContent = (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-saffron/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-saffron to-gold flex items-center justify-center">
            <span className="text-3xl">🙏</span>
          </div>
          <CardTitle className="text-2xl font-sanskrit text-saffron">Welcome Back</CardTitle>
          <CardDescription>Sign in to continue your spiritual journey</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="mobile">Mobile OTP</TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-saffron to-gold text-temple-dark hover:from-saffron/90 hover:to-gold/90" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="mobile">
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4" /> Mobile Number</Label>
                  <div className="flex gap-2">
                    <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={loading || otpSent} className="flex-1" />
                    {!otpSent && (
                      <Button type="button" onClick={handleSendOtp} disabled={loading || !phone} variant="outline">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                      </Button>
                    )}
                  </div>
                </div>
                {otpSent && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input id="otp" type="text" placeholder="Enter 6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required disabled={loading} maxLength={6} />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-saffron to-gold text-temple-dark" disabled={loading}>
                      {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Verify & Sign In'}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full text-sm" onClick={() => { setOtpSent(false); setOtp(''); }}>
                      Change number
                    </Button>
                  </>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-saffron hover:underline">Create one</Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Sign In" showBottomNav={true}>
        {loginContent}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {loginContent}
      <Footer />
    </div>
  );
};

export default Login;
