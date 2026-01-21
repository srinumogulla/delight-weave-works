import { Link } from 'react-router-dom';
import { Clock, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileServiceCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: string;
  category?: string;
  imageUrl?: string;
  rating?: number;
}

export function MobileServiceCard({
  id,
  name,
  description,
  price,
  duration,
  category,
  imageUrl,
  rating = 4.8,
}: MobileServiceCardProps) {
  return (
    <Link 
      to={`/booking/${id}`}
      className="block bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow active:scale-[0.98] transform transition-transform"
    >
      {/* Image */}
      {imageUrl && (
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover"
          />
          {category && (
            <Badge className="absolute top-2 left-2 bg-primary/90">
              {category}
            </Badge>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-primary">₹{price.toLocaleString()}</span>
            {duration && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {duration}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild onClick={(e) => e.stopPropagation()}>
              <Link to={`/pooja/${id}`}>
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Link>
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Book
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
