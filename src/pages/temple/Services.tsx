import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { TempleLayout } from '@/components/temple/TempleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, IndianRupee, Clock } from 'lucide-react';

const TempleServices = () => {
  const { user } = useAuth();

  // Fetch temple profile
  const { data: templeProfile } = useQuery({
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

  // Fetch services for this temple
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['temple-services', templeProfile?.name],
    queryFn: async () => {
      if (!templeProfile?.name) return [];
      const { data, error } = await supabase
        .from('pooja_services')
        .select('*')
        .eq('temple', templeProfile.name)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!templeProfile?.name
  });

  return (
    <TempleLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Temple Services
          </h1>
          <p className="text-muted-foreground">
            Services offered at {templeProfile?.name || 'your temple'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Services Yet</h3>
              <p className="text-muted-foreground">
                Contact the admin to add services for your temple.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant={service.is_active ? 'default' : 'secondary'}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {service.category && (
                    <Badge variant="outline" className="w-fit">
                      {service.category}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      <span className="font-semibold">₹{service.price}</span>
                    </div>
                    {service.duration && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TempleLayout>
  );
};

export default TempleServices;
