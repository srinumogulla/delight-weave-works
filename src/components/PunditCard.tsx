import { CheckCircle, Clock, Languages, MapPin, Heart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n";
import { useAuth } from "@/components/AuthProvider";
import { useSavedItems } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";

// Import local assets for fallback images
import ritualHomam from "@/assets/ritual-homam.jpg";
import ritualAbhishekam from "@/assets/ritual-abhishekam.jpg";
import ritualPooja from "@/assets/ritual-pooja.jpg";
import ritualLakshmi from "@/assets/ritual-lakshmi.jpg";
import ritualShanti from "@/assets/ritual-shanti.jpg";
import ritualVratam from "@/assets/ritual-vratam.jpg";

interface Pundit {
  id: string;
  name: string;
  photo_url: string | null;
  specializations: string[] | null;
  languages: string[] | null;
  experience_years: number | null;
  location: string | null;
  bio: string | null;
  is_verified: boolean | null;
}

interface PunditCardProps {
  pundit: Pundit;
}

// Helper to get appropriate pundit image
const getPunditImage = (pundit: Pundit): string => {
  // If it's already a local import (not a URL), return it directly
  if (pundit.photo_url && !pundit.photo_url.startsWith('http')) {
    return pundit.photo_url;
  }
  
  // For external URLs or null, use fallback based on name hash for variety
  const fallbacks = [ritualHomam, ritualAbhishekam, ritualPooja, ritualLakshmi, ritualShanti, ritualVratam];
  const nameHash = pundit.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbacks[nameHash % fallbacks.length];
};

export const PunditCard = ({ pundit }: PunditCardProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isItemSaved, toggleSave, isToggling } = useSavedItems('pundit');
  
  const isSaved = isItemSaved(pundit.id, 'pundit');

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleSave({ itemId: pundit.id, type: 'pundit' });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {/* Header with gradient background and pattern */}
      <div className="relative h-28 bg-gradient-to-br from-primary/40 via-accent/30 to-primary/20">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_hsl(var(--primary))_1px,_transparent_1px)] bg-[length:16px_16px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_hsl(var(--accent))_1px,_transparent_1px)] bg-[length:24px_24px]" />
        </div>
        
        {/* Save button */}
        {user && (
          <button
            onClick={handleSaveClick}
            disabled={isToggling}
            className={cn(
              "absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all",
              isSaved 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-background/80 text-muted-foreground hover:bg-background hover:text-destructive"
            )}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
          </button>
        )}
        
        {pundit.is_verified && (
          <Badge className="absolute top-3 right-3 bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("pundits.verified")}
          </Badge>
        )}
      </div>
      
      {/* Profile section - adjusted to avoid overlap */}
      <CardContent className="flex-1 p-4 pt-0 -mt-12">
        <div className="flex flex-col items-center text-center">
          {/* Avatar - centered */}
          <div className="w-20 h-20 rounded-full border-4 border-background overflow-hidden bg-muted shadow-lg mb-3">
            <img
              src={getPunditImage(pundit)}
              alt={pundit.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Name and location */}
          <h3 className="text-lg font-semibold text-foreground line-clamp-1">
            {pundit.name}
          </h3>
          {pundit.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {pundit.location}
            </p>
          )}
        </div>

        {/* Details section */}
        <div className="mt-4 space-y-2">
          {pundit.experience_years && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                {pundit.experience_years} {t("pundits.yearsExperience")}
              </span>
            </div>
          )}
          {pundit.languages && pundit.languages.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Languages className="h-4 w-4 text-primary" />
              <span className="line-clamp-1">{pundit.languages.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Specializations */}
        {pundit.specializations && pundit.specializations.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-4">
            {pundit.specializations.slice(0, 3).map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
            {pundit.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{pundit.specializations.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button className="w-full">{t("pundits.bookPundit")}</Button>
      </CardFooter>
    </Card>
  );
};