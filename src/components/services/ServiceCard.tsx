import { Clock, Star, Users, Eye } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image: string;
  rating: number;
  bookings: number;
  temple: string;
  featured?: boolean;
}

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
}

export function ServiceCard({ service, onBook }: ServiceCardProps) {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-xl group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Category badge */}
        <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
          {service.category}
        </Badge>
        
        {/* Featured badge */}
        {service.featured && (
          <Badge className="absolute top-3 right-3 bg-gold text-maroon">
            Featured
          </Badge>
        )}
        
        {/* Price tag */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm border border-border">
          <span className="font-bold text-primary">₹{service.price.toLocaleString()}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {service.name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {service.description}
        </p>
        
        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{service.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-gold fill-gold" />
            <span>{service.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{service.bookings}+</span>
          </div>
        </div>
        
        {/* Temple name */}
        <p className="text-xs text-muted-foreground mb-4">
          🛕 {service.temple}
        </p>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="flex-1"
            asChild
          >
            <Link to={`/pooja/${service.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Link>
          </Button>
          <Button 
            className="flex-1" 
            onClick={() => onBook?.(service)}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
