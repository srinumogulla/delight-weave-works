import { Shield, Eye, Heart } from "lucide-react";

const principles = [
  {
    icon: Shield,
    title: "Authentic",
    points: [
      "Temple-verified gurus",
      "Scripturally aligned rituals",
    ],
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Eye,
    title: "Transparent",
    points: [
      "Clear pricing",
      "Defined inclusions",
      "Verified scheduling",
    ],
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: Heart,
    title: "Respectful",
    points: [
      "Cultural dignity preserved",
      "Ethical spiritual practices",
    ],
    color: "bg-sacred-green/10 text-sacred-green",
  },
];

export function CorePrinciplesSection() {
  return (
    <section className="py-16 bg-muted">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Core <span className="text-primary">Principles</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The values that guide everything we do at VedhaMantra
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className={`w-14 h-14 rounded-xl ${principle.color} flex items-center justify-center mb-6`}>
                <principle.icon className="h-7 w-7" />
              </div>
              
              <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                {principle.title}
              </h3>
              
              <ul className="space-y-2">
                {principle.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}