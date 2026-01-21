import { MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n";
import { useAuth } from "@/components/AuthProvider";
import { useSavedItems } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";

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
          src={temple.image_url || "/placeholder.svg"}
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
