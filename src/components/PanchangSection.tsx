import { Calendar, Sun, Moon, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const panchangData = {
  date: "January 10, 2026",
  hinduDate: "Paush Shukla Navami",
  tithi: "Navami",
  nakshatra: "Ashwini",
  yoga: "Siddhi",
  karana: "Balava",
  sunrise: "6:52 AM",
  sunset: "5:47 PM",
  moonrise: "12:30 PM",
  rahukaal: "10:30 AM - 12:00 PM",
  auspicious: ["Vivah Muhurat", "Griha Pravesh", "Vehicle Purchase"],
  inauspicious: ["Long Journey", "Haircut"],
};

export function PanchangSection() {
  return (
    <section id="panchang" className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
            Daily Guidance
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Today's <span className="text-primary">Panchang</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Plan your day according to Vedic astrology. Get detailed information about 
            auspicious timings, muhurat, and celestial positions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Panchang Card */}
          <Card className="md:col-span-2 border-accent/30">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-2xl text-foreground">
                    {panchangData.date}
                  </CardTitle>
                  <p className="text-muted-foreground">{panchangData.hinduDate}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <Moon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Tithi</div>
                  <div className="font-semibold text-foreground">{panchangData.tithi}</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <Star className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Nakshatra</div>
                  <div className="font-semibold text-foreground">{panchangData.nakshatra}</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <Sun className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Yoga</div>
                  <div className="font-semibold text-foreground">{panchangData.yoga}</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground">Karana</div>
                  <div className="font-semibold text-foreground">{panchangData.karana}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Sun className="h-4 w-4 text-accent" />
                    Sun & Moon Timings
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunrise</span>
                      <span className="font-medium">{panchangData.sunrise}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunset</span>
                      <span className="font-medium">{panchangData.sunset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Moonrise</span>
                      <span className="font-medium">{panchangData.moonrise}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rahu Kaal</span>
                      <span className="font-medium text-destructive">{panchangData.rahukaal}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Auspicious Activities</h4>
                  <div className="flex flex-wrap gap-2">
                    {panchangData.auspicious.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 rounded-full bg-sacred-green/10 text-sacred-green text-xs font-medium"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                  <h4 className="font-semibold text-foreground mt-4">Avoid Today</h4>
                  <div className="flex flex-wrap gap-2">
                    {panchangData.inauspicious.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium"
                      >
                        ✗ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dosha Checker Card */}
          <Card className="border-primary/30 bg-gradient-to-b from-card to-primary/5">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-foreground">
                Check Your Dosha
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Get personalized dosha analysis and remedies
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full h-32 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-4xl">🧘</span>
              </div>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="w-full bg-primary hover:bg-primary/90">
                Check Dosha
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
