import { Button } from "@/components/ui/button";
import { Play, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-16 md:py-24">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pattern-mandala opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Live Poojas Available
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Bring the{" "}
              <span className="text-primary">Temple</span>{" "}
              Home
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Experience authentic Vedic rituals performed by verified Purohits at sacred temples. 
              Participate live from anywhere in the world.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-red">
                Book a Pooja
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="h-4 w-4" />
                How It Works
              </Button>
            </div>
            
            {/* Stats */}
            <div className="flex gap-8 pt-6">
              <div>
                <div className="font-heading text-2xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Poojas Completed</div>
              </div>
              <div>
                <div className="font-heading text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Verified Purohits</div>
              </div>
              <div>
                <div className="font-heading text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Sacred Temples</div>
              </div>
            </div>
          </div>
          
          {/* Image Placeholder */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-heading text-4xl text-primary">🕉️</span>
                  </div>
                  <p className="text-muted-foreground">Temple Image Placeholder</p>
                </div>
              </div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-xl">🙏</span>
                </div>
                <div>
                  <div className="text-sm font-semibold">Next Live Pooja</div>
                  <div className="text-xs text-muted-foreground">Ganesh Homam • 2:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
