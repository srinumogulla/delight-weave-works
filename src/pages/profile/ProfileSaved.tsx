import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileLayout } from '@/components/mobile/MobileLayout';

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

const ProfileSaved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [savedPoojas, setSavedPoojas] = useState<SavedPooja[]>([]);

  useEffect(() => {
    if (user) {
      fetchSavedPoojas();
    }
  }, [user]);

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

  const content = (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-sanskrit text-saffron">Saved Items</h1>
          <p className="text-muted-foreground text-sm">Your favorite poojas for quick booking</p>
        </div>

        <Card className="border-saffron/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Saved Poojas
            </CardTitle>
            <CardDescription>Quick access to your favorite poojas</CardDescription>
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
      </div>
    </main>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Saved Items">
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

export default ProfileSaved;
