import { MousePointer, Users, Video } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MousePointer,
    title: "Choose a Sankalp",
    description:
      "Select your ritual intent - whether it's for health, prosperity, removing obstacles, or spiritual growth. Browse our catalog of authentic Vedic poojas.",
    color: "bg-primary/10 text-primary",
  },
  {
    number: "02",
    icon: Users,
    title: "Sankalp is Performed",
    description:
      "Our verified Purohit performs the ritual at a sacred temple, taking your personalized sankalp with your name, gotra, and nakshatra.",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    number: "03",
    icon: Video,
    title: "Watch Live & Receive Video",
    description:
      "Join the live stream to witness your pooja in real-time. After completion, receive the full video recording on WhatsApp as a divine memory.",
    color: "bg-sacred-green/10 text-sacred-green",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pattern-mandala opacity-20" />
      
      <div className="container relative">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
            Simple Process
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the divine in three simple steps. We've made it easy for you 
            to participate in authentic Vedic rituals from anywhere in the world.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary via-accent to-sacred-green" />
          
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Step Card */}
              <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg">
                {/* Number Badge */}
                <div className="absolute -top-4 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-xl ${step.color} flex items-center justify-center mb-4 mt-2 group-hover:scale-110 transition-transform`}
                >
                  <step.icon className="h-8 w-8" />
                </div>
                
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow for mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">↓</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
