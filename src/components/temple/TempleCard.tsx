import { MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n";
import { useAuth } from "@/auth/AuthProvider";
import { useSavedItems } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";

// Import local temple images for fallback
import heroTemple from "@/assets/hero-temple.jpg";
import ritualHomam from "@/assets/ritual-homam.jpg";
import ritualAbhishekam from "@/assets/ritual-abhishekam.jpg";
import ritualPooja from "@/assets/ritual-pooja.jpg";
import ritualLakshmi from "@/assets/ritual-lakshmi.jpg";
import ritualShanti from "@/assets/ritual-shanti.jpg";

// Get appropriate temple image based on temple name
const getTempleImage = (temple: { name: string; image_url: string | null }): string => {
  const name = temple.name.toLowerCase();
  
  if (name.includes('tirupati') || name.includes('balaji') || name.includes('venkateshwara')) return heroTemple;
  if (name.includes('kashi') || name.includes('vishwanath') || name.includes('shiva') || name.includes('mahadev')) return ritualAbhishekam;
  if (name.includes('meenakshi') || name.includes('parvati') || name.includes('devi')) return ritualPooja;
  if (name.includes('siddhivinayak') || name.includes('ganesha') || name.includes('ganesh') || name.includes('ganapati')) return ritualHomam;
  if (name.includes('jagannath') || name.includes('vishnu') || name.includes('krishna')) return ritualLakshmi;
  if (name.includes('golden') || name.includes('amritsar')) return ritualShanti;
  
  // Default fallback
  return heroTemple;
};

interface Temple {
  id: string;
  name: string;
  deity: string | null;
  location: string | null;
  state: string | null;
  city: string | null;
  description: string | null;
  image_url: string | null;
  contact_phone: string | null;
  website_url: string | null;
  is_partner: boolean | null;
}

interface TempleCardProps {
  temple: Temple;
}

export const TempleCard = ({ temple }: TempleCardProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isItemSaved, toggleSave, isToggling } = useSavedItems('temple');
  
  const isSaved = isItemSaved(temple.id, 'temple');

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleSave({ itemId: temple.id, type: 'temple' });
  };

  const handleCardClick = () => {
    navigate(`/temple/${temple.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={getTempleImage(temple)}
          alt={temple.name}
          className="w-full h-full object-cover"
        />
        
        {/* Save button */}
        {user && (
          <button
            onClick={handleSaveClick}
            disabled={isToggling}
            className={cn(
              "absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10",
              isSaved 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-background/80 text-muted-foreground hover:bg-background hover:text-destructive"
            )}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
          </button>
        )}
        
        {temple.is_partner && (
          <Badge className="absolute top-2 right-2 bg-primary">
            {t("temples.partnerTemple")}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {temple.name}
        </h3>
        {temple.deity && (
          <p className="text-sm text-primary font-medium mb-2">
            {temple.deity}
          </p>
        )}
        {(temple.city || temple.state) && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span>
              {[temple.city, temple.state].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
        {temple.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {temple.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
