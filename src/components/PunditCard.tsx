import { CheckCircle, Clock, Languages } from "lucide-react";
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20" />
        <div className="absolute -bottom-12 left-4">
          <div className="w-24 h-24 rounded-full border-4 border-background overflow-hidden bg-muted">
            <img
              src={pundit.photo_url || "/placeholder.svg"}
              alt={pundit.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {pundit.is_verified && (
          <Badge className="absolute top-2 right-2 bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("pundits.verified")}
          </Badge>
        )}
      </div>
      <CardContent className="pt-14 p-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {pundit.name}
        </h3>
        {pundit.location && (
          <p className="text-sm text-muted-foreground mb-2">
            {pundit.location}
          </p>
        )}
        {pundit.experience_years && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            <span>
              {pundit.experience_years} {t("pundits.yearsExperience")}
            </span>
          </div>
        )}
        {pundit.languages && pundit.languages.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <Languages className="h-4 w-4" />
            <span>{pundit.languages.join(", ")}</span>
          </div>
        )}
        {pundit.specializations && pundit.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1">
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
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">{t("pundits.bookPundit")}</Button>
      </CardFooter>
    </Card>
  );
};
