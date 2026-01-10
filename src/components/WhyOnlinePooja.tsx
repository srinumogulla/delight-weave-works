import { Heart, BookOpen, Sparkles, ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const reasons = [
  {
    icon: Heart,
    title: "The Performer's Will",
    description:
      "According to scriptures, the spiritual merit (punya) of any ritual is directly proportional to the devotion and sincerity of the performer. Our Purohits are trained to perform each ritual with utmost dedication.",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: BookOpen,
    title: "Ritual Dedication",
    description:
      "The Sankalpa (sacred resolution) taken at the beginning of each pooja dedicates the entire ritual to the devotee. Your name, gotra, and intention are invoked, making you the primary beneficiary.",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: Sparkles,
    title: "Indirect Devotion",
    description:
      "Just as one can sponsor a temple's construction or donate to charity remotely, sponsoring a pooja performed by a qualified priest carries equal spiritual significance as being physically present.",
    gradient: "from-sacred-green/20 to-sacred-green/5",
  },
  {
    icon: ScrollText,
    title: "Scriptural Support",
    description:
      "Ancient texts like the Vishnu Purana and Agni Purana mention that when geographical limitations prevent direct participation, delegation to qualified priests is an acceptable and fruitful alternative.",
    gradient: "from-saffron/20 to-saffron/5",
  },
];

export function WhyOnlinePooja() {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Spiritual Validity
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Online Pooja <span className="text-primary">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Skeptical about remote rituals? Here's the scriptural and spiritual foundation 
            that validates the efficacy of online poojas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {reasons.map((reason, index) => (
            <Card
              key={reason.title}
              className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                <div className={`bg-gradient-to-br ${reason.gradient} p-6`}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm">
                        <reason.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                        {reason.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
