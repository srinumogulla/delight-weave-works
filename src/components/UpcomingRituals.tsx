import { Calendar, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import ritualHomam from "@/assets/ritual-homam.jpg";
import ritualAbhishekam from "@/assets/ritual-abhishekam.jpg";
import ritualVratam from "@/assets/ritual-vratam.jpg";
import ritualShanti from "@/assets/ritual-shanti.jpg";
import ritualLakshmi from "@/assets/ritual-lakshmi.jpg";

const ritualImages: Record<string, string> = {
  Homam: ritualHomam,
  Abhishekam: ritualAbhishekam,
  Vratam: ritualVratam,
  Shanti: ritualShanti,
  Lakshmi: ritualLakshmi,
};

const rituals = [
  {
    id: 1,
    name: "Maha Ganapathi Homam",
    temple: "Siddhivinayak Temple",
    date: "Jan 12, 2026",
    time: "9:00 AM",
    price: 1100,
    participants: 45,
    category: "Homam",
    isLive: false,
    isFeatured: true,
  },
  {
    id: 2,
    name: "Navagraha Shanti Pooja",
    temple: "Tirupati Balaji Temple",
    date: "Jan 13, 2026",
    time: "6:00 AM",
    price: 2100,
    participants: 32,
    category: "Shanti",
    isLive: false,
  },
  {
    id: 3,
    name: "Rudra Abhishekam",
    temple: "Kashi Vishwanath",
    date: "Today",
    time: "4:00 PM",
    price: 1500,
    participants: 78,
    category: "Abhishekam",
    isLive: true,
  },
  {
    id: 4,
    name: "Satyanarayan Katha",
    temple: "ISKCON Temple",
    date: "Jan 15, 2026",
    time: "11:00 AM",
    price: 751,
    participants: 120,
    category: "Vratam",
    isLive: false,
  },
  {
    id: 5,
    name: "Lakshmi Narasimha Homam",
    temple: "Ahobilam Temple",
    date: "Jan 16, 2026",
    time: "7:00 AM",
    price: 3100,
    participants: 28,
    category: "Homam",
    isLive: false,
  },
];

export function UpcomingRituals() {
  return (
    <section id="poojas" className="py-16 md:py-24 bg-muted">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
              Participate Live
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Upcoming <span className="text-primary">Rituals</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Join devotees from around the world in these sacred rituals
            </p>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0">
            View All Poojas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rituals.slice(0, 6).map((ritual) => (
            <Card
              key={ritual.id}
              className={`overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                ritual.isFeatured ? "ring-2 ring-accent" : ""
              }`}
            >
              {/* Ritual Image */}
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={ritualImages[ritual.category] || ritualHomam} 
                  alt={ritual.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                
                {ritual.isLive && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
                    LIVE NOW
                  </div>
                )}
                
                {ritual.isFeatured && !ritual.isLive && (
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                    Featured
                  </Badge>
                )}
                
                <Badge
                  variant="secondary"
                  className="absolute top-3 right-3 bg-background/90"
                >
                  {ritual.category}
                </Badge>
              </div>

              <CardContent className="pt-4">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
                  {ritual.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{ritual.temple}</p>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {ritual.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {ritual.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {ritual.participants} joined
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between pt-0">
                <div>
                  <span className="text-2xl font-bold text-primary">₹{ritual.price}</span>
                </div>
                <Button
                  size="sm"
                  className={ritual.isLive ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}
                >
                  {ritual.isLive ? "Join Live" : "Participate"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
