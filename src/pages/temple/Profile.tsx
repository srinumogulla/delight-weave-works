import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { getMyTempleProfile } from '@/api/temples';
import { TempleLayout } from '@/components/temple/TempleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Phone, Globe, Building2 } from 'lucide-react';

const TempleProfile = () => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['temple-profile'],
    queryFn: getMyTempleProfile,
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <TempleLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64" />
        </div>
      </TempleLayout>
    );
  }

  return (
    <TempleLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" /> Temple Profile
          </h1>
          {profile && (
            <Badge variant={profile.approval_status === 'approved' ? 'default' : 'secondary'}>
              {profile.approval_status || 'Pending'}
            </Badge>
          )}
        </div>

        {profile ? (
          <Card>
            <CardHeader>
              <CardTitle>{profile.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.description && <p className="text-muted-foreground">{profile.description}</p>}
              <div className="grid md:grid-cols-2 gap-4">
                {profile.deity && <div><p className="text-sm text-muted-foreground">Deity</p><p className="font-medium">{profile.deity}</p></div>}
                {profile.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{profile.location}</span></div>}
                {profile.city && <div><p className="text-sm text-muted-foreground">City</p><p className="font-medium">{profile.city}, {profile.state}</p></div>}
                {profile.contact_phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{profile.contact_phone}</span></div>}
                {profile.website_url && <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /><a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{profile.website_url}</a></div>}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Temple Profile</h3>
              <p className="text-muted-foreground">Contact admin to set up your temple profile.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </TempleLayout>
  );
};

export default TempleProfile;
