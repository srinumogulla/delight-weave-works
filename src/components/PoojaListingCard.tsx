import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Eye, ArrowRight, Heart } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useSavedItems } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";

import ritualHomam from "@/assets/ritual-homam.jpg";
import ritualAbhishekam from "@/assets/ritual-abhishekam.jpg";
import ritualVratam from "@/assets/ritual-vratam.jpg";
import ritualShanti from "@/assets/ritual-shanti.jpg";
import ritualLakshmi from "@/assets/ritual-lakshmi.jpg";
import ritualPooja from "@/assets/ritual-pooja.jpg";

const imageMap: Record<string, string> = {
  "/ritual-homam.jpg": ritualHomam,
  "/ritual-abhishekam.jpg": ritualAbhishekam,
  "/ritual-vratam.jpg": ritualVratam,
  "/ritual-shanti.jpg": ritualShanti,
  "/ritual-lakshmi.jpg": ritualLakshmi,
  "/ritual-pooja.jpg": ritualPooja,
  "ritual-homam": ritualHomam,
  "ritual-abhishekam": ritualAbhishekam,
  "ritual-vratam": ritualVratam,
  "ritual-shanti": ritualShanti,
  "ritual-lakshmi": ritualLakshmi,
  "ritual-pooja": ritualPooja,
  "homam": ritualHomam,
  "abhishekam": ritualAbhishekam,
  "vratam": ritualVratam,
  "shanti": ritualShanti,
  "lakshmi": ritualLakshmi,
};

interface PoojaListingCardProps {
  id: string;
  name: string;
  description?: string;
  category?: string;
  ritualType: "dashachara" | "vamachara";
  guruName?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  price: number;
  imageUrl?: string;
  temple?: string;
}

export function PoojaListingCard({
  id,
  name,
  description,
  category,
  ritualType,
  guruName,
  scheduledDate,
  scheduledTime,
  price,
  imageUrl,
  temple,
}: PoojaListingCardProps) {
  const { user } = useAuth();
  const { isItemSaved, toggleSave, isToggling } = useSavedItems('pooja');
  
  const isSaved = isItemSaved(id, 'pooja');
  const categoryLabel = category?.toUpperCase() || "GENERAL";
  const isDosha = category?.toLowerCase().includes("dosha");

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleSave({ itemId: id, type: 'pooja' });
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageMap[imageUrl || ""] || imageUrl || ritualPooja}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
        
        {/* Save button */}
        {user && (
          <button
            onClick={handleSaveClick}
            disabled={isToggling}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10",
              isSaved 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-background/80 text-muted-foreground hover:bg-background hover:text-destructive"
            )}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
          </button>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={isDosha ? "destructive" : "secondary"} className="text-xs">
            {categoryLabel}
          </Badge>
          <Badge variant="outline" className="text-xs bg-card/80">
            {ritualType}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        {/* Title */}
        <h3 className="font-heading text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>
        )}

        {/* Meta Info */}
        <div className="space-y-2 mb-4">
          {guruName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{guruName}</span>
            </div>
          )}
          {scheduledDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{scheduledDate}</span>
              {scheduledTime && (
                <>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{scheduledTime}</span>
                </>
              )}
            </div>
          )}
          {temple && (
            <div className="text-sm text-muted-foreground">
              📍 {temple}
            </div>
          )}
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-xs text-muted-foreground">Starting from</span>
            <div className="font-heading text-xl font-bold text-primary">
              Rs {price.toLocaleString()}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/booking/${id}`}>
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Link>
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
              <Link to={`/booking/${id}`}>
                Book
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
