import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '@/components/mobile/MobileLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  const pageContent = (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-saffron/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-saffron to-gold flex items-center justify-center">
            <span className="text-3xl">🔑</span>
          </div>
          <CardTitle className="text-2xl font-sanskrit text-saffron">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                A password reset link has been sent to <strong>{email}</strong>. Please check your inbox and click the link to reset your password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-saffron to-gold text-temple-dark hover:from-saffron/90 hover:to-gold/90"
                disabled={loading}
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link to="/login" className="text-saffron hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Forgot Password" showBottomNav={false}>
        {pageContent}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {pageContent}
      <Footer />
    </div>
  );
};

export default ForgotPassword;
