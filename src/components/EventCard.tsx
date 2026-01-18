import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Video, ArrowRight } from "lucide-react";

interface EventCardProps {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  location?: string;
  isOnline?: boolean;
  imageUrl?: string;
}

export function EventCard({
  id,
  title,
  description,
  eventDate,
  eventTime,
  location,
  isOnline = false,
  imageUrl,
}: EventCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg group">
      {/* Image */}
      {imageUrl && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
          
          {/* Online Badge */}
          {isOnline && (
            <Badge className="absolute top-3 right-3 bg-sacred-green text-white">
              <Video className="h-3 w-3 mr-1" />
              Online
            </Badge>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Title */}
        <h3 className="font-heading text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>
        )}

        {/* Meta Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{eventDate}</span>
            {eventTime && <span>• {eventTime}</span>}
          </div>
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <Button className="w-full bg-primary hover:bg-primary/90" size="sm">
          Participate
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}