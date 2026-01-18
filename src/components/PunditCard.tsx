import { CheckCircle, Clock, Languages, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n";

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

export const PunditCard = ({ pundit }: PunditCardProps) => {
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {/* Header with gradient background */}
      <div className="relative h-24 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_hsl(var(--primary))_1px,_transparent_1px)] bg-[length:20px_20px]" />
        </div>
        {pundit.is_verified && (
          <Badge className="absolute top-3 right-3 bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("pundits.verified")}
          </Badge>
        )}
      </div>
      
      {/* Profile section - restructured to avoid overlap */}
      <CardContent className="flex-1 p-4 pt-0 -mt-10">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full border-4 border-background overflow-hidden bg-muted flex-shrink-0 shadow-lg">
            <img
              src={pundit.photo_url || "/placeholder.svg"}
              alt={pundit.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Name and location */}
          <div className="flex-1 pt-6">
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
        </div>

        {/* Details section */}
        <div className="mt-4 space-y-2">
          {pundit.experience_years && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                {pundit.experience_years} {t("pundits.yearsExperience")}
              </span>
            </div>
          )}
          {pundit.languages && pundit.languages.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Languages className="h-4 w-4 text-primary" />
              <span className="line-clamp-1">{pundit.languages.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Specializations */}
        {pundit.specializations && pundit.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
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
