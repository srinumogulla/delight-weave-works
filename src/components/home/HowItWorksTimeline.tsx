import { MousePointer, Users, Video, Package } from "lucide-react";

interface TimelineStep {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

interface HowItWorksTimelineProps {
  steps?: TimelineStep[];
  variant?: "detailed" | "simple";
}

const defaultSteps: TimelineStep[] = [
  {
    number: "01",
    icon: MousePointer,
    title: "Choose Your Ritual",
    description: "Browse curated poojas by dosha, deity, and intent. Clear inclusions shown before booking.",
  },
  {
    number: "02",
    icon: Users,
    title: "Share Sankalpa Details",
    description: "Add devotee names, gotra, and personal notes. Read carefully before sankalpam.",
  },
  {
    number: "03",
    icon: Video,
    title: "Priest & Slot Confirmation",
    description: "Priest and muhurtham confirmed. Prep steps shared.",
  },
  {
    number: "04",
    icon: Package,
    title: "Live Updates & Prasadam",
    description: "Livestream or recordings provided. Prasadam shipped with blessing note.",
  },
];

const simpleSteps: TimelineStep[] = [
  {
    number: "01",
    icon: MousePointer,
    title: "Pick a Pooja",
    description: "Browse and select your desired ritual.",
  },
  {
    number: "02",
    icon: Users,
    title: "Share Names & Sankalpa",
    description: "Provide devotee details for the ritual.",
  },
  {
    number: "03",
    icon: Video,
    title: "Join Live or Receive Updates",
    description: "Watch the ritual live or get recordings.",
  },
  {
    number: "04",
    icon: Package,
    title: "Receive Prasadam",
    description: "Sacred prasadam delivered to your doorstep.",
  },
];

export function HowItWorksTimeline({ steps, variant = "detailed" }: HowItWorksTimelineProps) {
  const displaySteps = steps || (variant === "simple" ? simpleSteps : defaultSteps);

  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-sacred-green hidden md:block" />
      
      <div className="space-y-8">
        {displaySteps.map((step, index) => (
          <div key={step.number} className="relative flex gap-6">
            {/* Number Circle */}
            <div className="relative z-10 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                {step.number}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 bg-card p-6 rounded-xl border border-border hover:border-primary/50 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}