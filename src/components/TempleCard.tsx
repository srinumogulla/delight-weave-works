import { MapPin, Phone, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n";

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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={temple.image_url || "/placeholder.svg"}
          alt={temple.name}
          className="w-full h-full object-cover"
        />
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
      <CardFooter className="p-4 pt-0 flex gap-2">
        {temple.contact_phone && (
          <Button variant="outline" size="sm" asChild>
            <a href={`tel:${temple.contact_phone}`}>
              <Phone className="h-4 w-4 mr-1" />
              Call
            </a>
          </Button>
        )}
        {temple.website_url && (
          <Button variant="outline" size="sm" asChild>
            <a href={temple.website_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Website
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
