import { Check, Shield, Video, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import ritualPooja from "@/assets/ritual-pooja.jpg";

const features = [
  {
    icon: Shield,
    title: "Verified Purohits",
    description: "All our priests are verified and trained in authentic Vedic traditions",
  },
  {
    icon: Heart,
    title: "Personalized Sankalpa",
    description: "Your name and gotra are included in the ritual for maximum spiritual benefit",
  },
  {
    icon: Video,
    title: "Video Memories",
    description: "Receive complete video recording of your pooja on WhatsApp",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Ritual Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
              <img 
                src={ritualPooja} 
                alt="Hindu priest performing pooja with oil lamps and flowers" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Decorative accent */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          </div>
          
          {/* Content */}
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
              Why Choose Us
            </div>
            
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Beyond the Material,{" "}
              <span className="text-primary">a Gift of Divinity</span>
            </h2>
            
            <p className="text-muted-foreground">
              We bring the sanctity of temple rituals to your home. Our poojas are performed 
              with complete adherence to Vedic scriptures, ensuring spiritual benefits reach you 
              regardless of your physical location.
            </p>
            
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-red">
              Book Your Pooja
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
