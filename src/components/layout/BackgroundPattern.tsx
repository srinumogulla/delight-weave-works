import vedicPattern from "@/assets/vedic-pattern.svg";

interface BackgroundPatternProps {
  className?: string;
  opacity?: number;
}

export function BackgroundPattern({ className = "", opacity = 0.15 }: BackgroundPatternProps) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity }}
    >
      {/* Top left pattern */}
      <img 
        src={vedicPattern} 
        alt="" 
        className="absolute -top-20 -left-20 w-96 h-96 rotate-12"
        style={{ filter: "hue-rotate(0deg)" }}
      />
      
      {/* Top right pattern */}
      <img 
        src={vedicPattern} 
        alt="" 
        className="absolute -top-10 -right-32 w-80 h-80 -rotate-45"
        style={{ filter: "hue-rotate(15deg)" }}
      />
      
      {/* Bottom left pattern */}
      <img 
        src={vedicPattern} 
        alt="" 
        className="absolute -bottom-24 -left-16 w-72 h-72 rotate-90"
        style={{ filter: "hue-rotate(-10deg)" }}
      />
      
      {/* Bottom right pattern */}
      <img 
        src={vedicPattern} 
        alt="" 
        className="absolute -bottom-16 -right-24 w-96 h-96 rotate-180"
        style={{ filter: "hue-rotate(5deg)" }}
      />
      
      {/* Center decorative */}
      <img 
        src={vedicPattern} 
        alt="" 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30"
        style={{ filter: "hue-rotate(20deg)" }}
      />
    </div>
  );
}
