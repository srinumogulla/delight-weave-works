import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { TempleLayout } from '@/components/temple/TempleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, MapPin, Phone, Globe, CheckCircle } from 'lucide-react';

const TempleProfile = () => {
  const { user } = useAuth();

  // Fetch temple profile
  const { data: templeProfile, isLoading } = useQuery({
    queryKey: ['temple-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('temples')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <TempleLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64" />
        </div>
      </TempleLayout>
    );
  }

  if (!templeProfile) {
    return (
      <TempleLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Temple Profile</h3>
            <p className="text-muted-foreground">
              Your account is not linked to a temple yet. Please contact admin.
            </p>
          </CardContent>
        </Card>
      </TempleLayout>
    );
  }

  return (
    <TempleLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Temple Profile</h1>
          <p className="text-muted-foreground">View and manage your temple information</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              {templeProfile.image_url ? (
                <img 
                  src={templeProfile.image_url} 
                  alt={templeProfile.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{templeProfile.name}</CardTitle>
                  {templeProfile.is_partner && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Partner
                    </Badge>
                  )}
                </div>
                {templeProfile.deity && (
                  <p className="text-muted-foreground mt-1">Deity: {templeProfile.deity}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <Badge variant={templeProfile.is_active ? 'default' : 'secondary'}>
                    {templeProfile.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {templeProfile.approval_status || 'approved'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {templeProfile.description && (
              <div>
                <h4 className="font-semibold mb-1">Description</h4>
                <p className="text-muted-foreground">{templeProfile.description}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {[templeProfile.location, templeProfile.city, templeProfile.state]
                    .filter(Boolean)
                    .join(', ') || 'Location not set'}
                </span>
              </div>
              {templeProfile.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{templeProfile.contact_phone}</span>
                </div>
              )}
              {templeProfile.website_url && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={templeProfile.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {templeProfile.website_url}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TempleLayout>
  );
};

export default TempleProfile;
