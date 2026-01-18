import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { PunditLayout } from '@/components/pundit/PunditLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Save, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PunditProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch pundit profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['pundit-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('pundits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    experience_years: '',
    languages: '',
    specializations: ''
  });

  // Update form when profile loads
  useState(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        experience_years: profile.experience_years?.toString() || '',
        languages: profile.languages?.join(', ') || '',
        specializations: profile.specializations?.join(', ') || ''
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id || !profile?.id) throw new Error('No profile found');
      
      const { error } = await supabase
        .from('pundits')
        .update({
          name: data.name,
          bio: data.bio,
          location: data.location,
          experience_years: parseInt(data.experience_years) || null,
          languages: data.languages.split(',').map(l => l.trim()).filter(Boolean),
          specializations: data.specializations.split(',').map(s => s.trim()).filter(Boolean)
        })
        .eq('id', profile.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Profile updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['pundit-profile'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error updating profile', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  if (isLoading) {
    return (
      <PunditLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardContent className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </PunditLayout>
    );
  }

  if (!profile) {
    return (
      <PunditLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">Profile Not Set Up</h2>
              <p className="text-muted-foreground mb-4">
                Your pundit profile hasn't been created yet. Please contact support to complete your profile setup.
              </p>
            </CardContent>
          </Card>
        </div>
      </PunditLayout>
    );
  }

  return (
    <PunditLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              My Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your pundit profile and details
            </p>
          </div>
          <Badge 
            variant={profile.is_verified ? "default" : "secondary"}
            className={profile.is_verified ? "bg-green-600" : ""}
          >
            {profile.is_verified ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Pending Verification
              </>
            )}
          </Badge>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile Details</CardTitle>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate(formData);
              }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages (comma separated)</Label>
                    <Input
                      id="languages"
                      value={formData.languages}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      placeholder="Hindi, Sanskrit, Tamil"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specializations">Specializations (comma separated)</Label>
                  <Input
                    id="specializations"
                    value={formData.specializations}
                    onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                    placeholder="Vivah, Griha Pravesh, Satyanarayan Katha"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={updateMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{profile.location || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{profile.experience_years || '-'} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Languages</p>
                  <p className="font-medium">{profile.languages?.join(', ') || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Specializations</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.specializations?.map((spec: string, i: number) => (
                      <Badge key={i} variant="secondary">{spec}</Badge>
                    )) || '-'}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p className="font-medium">{profile.bio || '-'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PunditLayout>
  );
};

export default PunditProfile;
