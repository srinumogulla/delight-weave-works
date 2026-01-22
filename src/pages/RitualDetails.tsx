import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users, MapPin, ArrowLeft, Play, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

// Mock data - same as UpcomingRituals component
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
    description: "Maha Ganapathi Homam is performed to invoke the blessings of Lord Ganesha, the remover of obstacles. This sacred fire ritual helps in achieving success in new ventures, education, and removing hurdles from one's path.",
    benefits: [
      "Removal of obstacles in life",
      "Success in new ventures",
      "Enhanced wisdom and knowledge",
      "Protection from negative energies",
      "Blessings for family prosperity"
    ],
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
    description: "Navagraha Shanti Pooja is performed to pacify the nine celestial bodies and reduce the malefic effects of planetary positions in one's horoscope.",
    benefits: [
      "Reduction in planetary doshas",
      "Improved health and well-being",
      "Better career prospects",
      "Harmonious relationships",
      "Overall life balance"
    ],
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
    description: "Rudra Abhishekam is a powerful Vedic ritual dedicated to Lord Shiva. The sacred bathing of the Shiva Lingam with various holy substances brings immense spiritual benefits.",
    benefits: [
      "Liberation from sins",
      "Divine blessings of Lord Shiva",
      "Peace of mind and soul",
      "Protection from diseases",
      "Fulfillment of wishes"
    ],
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
    description: "Satyanarayan Katha is a sacred ritual dedicated to Lord Vishnu. This pooja is performed on auspicious occasions to seek blessings for prosperity, success, and happiness.",
    benefits: [
      "Blessings of Lord Vishnu",
      "Family harmony and happiness",
      "Success in endeavors",
      "Wealth and prosperity",
      "Spiritual upliftment"
    ],
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
    description: "Lakshmi Narasimha Homam invokes the blessings of Lord Narasimha and Goddess Lakshmi for protection, prosperity, and removal of enemies.",
    benefits: [
      "Protection from enemies",
      "Wealth and abundance",
      "Courage and strength",
      "Victory over obstacles",
      "Divine grace and protection"
    ],
  },
];

export default function RitualDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    gotra: "",
    nakshatra: "",
    specialRequests: "",
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const ritual = rituals.find(r => r.id === Number(id));

  if (!ritual) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Ritual Not Found</h1>
          <p className="text-muted-foreground mb-6">The ritual you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">Go Back Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    // Navigate to payment page
    navigate("/payment", {
      state: {
        type: "ritual",
        serviceName: ritual.name,
        templeName: ritual.temple,
        date: ritual.date,
        time: ritual.time,
        amount: ritual.price,
        recipientName: formData.name,
        gotra: formData.gotra,
      },
    });
  };

  const handleRemindMe = () => {
    toast({
      title: "Reminder Set!",
      description: `We'll remind you before ${ritual.name} starts.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={ritualImages[ritual.category] || ritualHomam}
                alt={ritual.name}
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              
              {ritual.isLive && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
                  LIVE NOW
                </div>
              )}
              
              <Badge className="absolute top-4 right-4 bg-background/90">
                {ritual.category}
              </Badge>
            </div>

            {/* Title & Info */}
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
                {ritual.name}
              </h1>
              <p className="text-lg text-muted-foreground">{ritual.temple}</p>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>{ritual.date}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span>{ritual.time}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>{ritual.participants} devotees joined</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{ritual.temple}</span>
              </div>
            </div>

            {/* Live Stream Section */}
            {ritual.isLive ? (
              <Card className="border-destructive">
                <CardContent className="p-6">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Play className="h-16 w-16 text-primary mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground">Live Stream Active</p>
                      <p className="text-muted-foreground">Click to join the live ritual</p>
                    </div>
                  </div>
                  <Button className="w-full bg-destructive hover:bg-destructive/90" size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Join Live Stream
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground">Starts on {ritual.date}</p>
                      <p className="text-muted-foreground">at {ritual.time}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="lg" onClick={handleRemindMe}>
                    <Bell className="h-5 w-5 mr-2" />
                    Remind Me Before Start
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this Ritual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {ritual.description}
                </p>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ritual.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Participation Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Participate in this Ritual</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Register to receive divine blessings
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name (For Sankalpa) *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gotra">Gotra (Optional)</Label>
                    <Input
                      id="gotra"
                      placeholder="Enter your gotra"
                      value={formData.gotra}
                      onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nakshatra">Nakshatra (Optional)</Label>
                    <Input
                      id="nakshatra"
                      placeholder="Enter your nakshatra"
                      value={formData.nakshatra}
                      onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requests">Special Requests (Optional)</Label>
                    <Textarea
                      id="requests"
                      placeholder="Any specific prayers or requests..."
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-muted-foreground">Participation Fee</span>
                      <span className="text-2xl font-bold text-primary">₹{ritual.price}</span>
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Proceed to Payment
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    By participating, you agree to receive prasadam and blessings
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
