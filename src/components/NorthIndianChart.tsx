import { cn } from "@/lib/utils";

interface House {
  number: number;
  sign: string;
  planets: string[];
}

interface NorthIndianChartProps {
  houses: House[];
  className?: string;
}

// North Indian chart layout: Diamond in center with houses as triangular segments
// House 1 (Lagna) is always at the top center diamond
// Houses go counter-clockwise from house 1
export function NorthIndianChart({ houses, className }: NorthIndianChartProps) {
  // Get house by number
  const getHouse = (num: number) => houses.find(h => h.number === num);

  // Position and render text for each house
  const housePositions: Record<number, { x: number; y: number; anchor: string }> = {
    1: { x: 200, y: 70, anchor: "middle" },      // Top center
    2: { x: 100, y: 70, anchor: "middle" },      // Top left
    3: { x: 40, y: 120, anchor: "middle" },      // Upper left
    4: { x: 40, y: 200, anchor: "middle" },      // Left
    5: { x: 40, y: 280, anchor: "middle" },      // Lower left
    6: { x: 100, y: 330, anchor: "middle" },     // Bottom left
    7: { x: 200, y: 330, anchor: "middle" },     // Bottom center
    8: { x: 300, y: 330, anchor: "middle" },     // Bottom right
    9: { x: 360, y: 280, anchor: "middle" },     // Lower right
    10: { x: 360, y: 200, anchor: "middle" },    // Right
    11: { x: 360, y: 120, anchor: "middle" },    // Upper right
    12: { x: 300, y: 70, anchor: "middle" },     // Top right
  };

  return (
    <div className={cn("max-w-md mx-auto", className)}>
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Outer square */}
        <rect 
          x="10" 
          y="10" 
          width="380" 
          height="380" 
          stroke="currentColor" 
          fill="none" 
          strokeWidth="2"
          className="text-border"
        />
        
        {/* Inner diamond connecting midpoints */}
        <polygon 
          points="200,10 390,200 200,390 10,200" 
          stroke="currentColor" 
          fill="none" 
          strokeWidth="2"
          className="text-border"
        />
        
        {/* Diagonal lines from corners to center */}
        <line x1="10" y1="10" x2="200" y2="200" stroke="currentColor" strokeWidth="1" className="text-border" />
        <line x1="390" y1="10" x2="200" y2="200" stroke="currentColor" strokeWidth="1" className="text-border" />
        <line x1="10" y1="390" x2="200" y2="200" stroke="currentColor" strokeWidth="1" className="text-border" />
        <line x1="390" y1="390" x2="200" y2="200" stroke="currentColor" strokeWidth="1" className="text-border" />

        {/* Center label */}
        <text x="200" y="195" textAnchor="middle" className="text-xs fill-muted-foreground font-medium">
          KUNDALI
        </text>
        <text x="200" y="210" textAnchor="middle" className="text-[10px] fill-muted-foreground">
          North Indian
        </text>

        {/* House 1 - Top center triangle (Lagna) */}
        <polygon 
          points="200,10 200,200 10,200 10,10" 
          fill="hsl(var(--primary) / 0.1)"
          stroke="none"
          style={{ clipPath: "polygon(50% 2.5%, 100% 50%, 50% 50%)" }}
        />
        
        {/* Render houses */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((houseNum) => {
          const house = getHouse(houseNum);
          const pos = housePositions[houseNum];
          const isLagna = houseNum === 1;
          
          return (
            <g key={houseNum}>
              {/* House number */}
              <text 
                x={pos.x} 
                y={pos.y - 20} 
                textAnchor={pos.anchor} 
                className={cn(
                  "text-xs font-semibold",
                  isLagna ? "fill-primary" : "fill-muted-foreground"
                )}
              >
                {houseNum}
              </text>
              
              {/* Planets in house */}
              <text 
                x={pos.x} 
                y={pos.y} 
                textAnchor={pos.anchor} 
                className="text-lg fill-foreground"
              >
                {house?.planets.join(' ') || ''}
              </text>
              
              {/* Sign abbreviation */}
              <text 
                x={pos.x} 
                y={pos.y + 18} 
                textAnchor={pos.anchor} 
                className="text-[10px] fill-muted-foreground"
              >
                {house?.sign.split(' ')[0].substring(0, 3) || ''}
              </text>
            </g>
          );
        })}
        
        {/* Lagna marker */}
        <text 
          x="200" 
          y="40" 
          textAnchor="middle" 
          className="text-xs fill-primary font-bold"
        >
          ASC
        </text>
      </svg>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-primary/20 rounded"></span>
          Lagna (Ascendant)
        </span>
        <span>Houses: Counter-clockwise from 1</span>
      </div>
    </div>
  );
}
