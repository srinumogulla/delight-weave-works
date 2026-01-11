import { useState, useEffect, ReactNode } from "react";
import vedicPattern from "@/assets/vedic-pattern.svg";

interface TempleGateIntroProps {
  children: ReactNode;
}

export function TempleGateIntro({ children }: TempleGateIntroProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check if animation has been shown this session
    const hasSeenIntro = sessionStorage.getItem("templeIntroShown");
    
    if (hasSeenIntro) {
      setIsAnimating(false);
      setIsComplete(true);
      return;
    }

    // Start opening animation after brief pause
    const openTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);

    // Complete and hide overlay after animation finishes
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      sessionStorage.setItem("templeIntroShown", "true");
    }, 3000);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  return (
    <>
      {children}
      
      {!isComplete && (
        <div 
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
            !isAnimating ? "opacity-0 pointer-events-none" : ""
          }`}
          style={{ 
            transitionDelay: "1.5s",
            perspective: "1500px"
          }}
        >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-maroon" />
          
          {/* Left Door */}
          <div
            className={`temple-door temple-door-left ${!isAnimating ? "door-open-left" : ""}`}
          >
            <div className="door-inner">
              {/* Ornate Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url(${vedicPattern})`,
                  backgroundSize: "100px 100px",
                  backgroundRepeat: "repeat"
                }}
              />
              
              {/* Decorative Border */}
              <div className="absolute inset-3 border-4 border-gold rounded-sm" />
              <div className="absolute inset-5 border-2 border-gold/50 rounded-sm" />
              
              {/* Door Ring */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <div className="w-16 h-16 rounded-full border-4 border-gold bg-maroon/50 flex items-center justify-center shadow-lg">
                  <div className="w-10 h-10 rounded-full border-3 border-gold/70" />
                </div>
              </div>
              
              {/* Om Symbol */}
              <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
                <span className="text-6xl md:text-8xl text-gold font-heading opacity-60">ॐ</span>
              </div>
              
              {/* Decorative Top */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-gold to-transparent" />
              
              {/* Decorative Bottom */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
          </div>
          
          {/* Right Door */}
          <div
            className={`temple-door temple-door-right ${!isAnimating ? "door-open-right" : ""}`}
          >
            <div className="door-inner">
              {/* Ornate Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url(${vedicPattern})`,
                  backgroundSize: "100px 100px",
                  backgroundRepeat: "repeat"
                }}
              />
              
              {/* Decorative Border */}
              <div className="absolute inset-3 border-4 border-gold rounded-sm" />
              <div className="absolute inset-5 border-2 border-gold/50 rounded-sm" />
              
              {/* Door Ring */}
              <div className="absolute left-8 top-1/2 -translate-y-1/2">
                <div className="w-16 h-16 rounded-full border-4 border-gold bg-maroon/50 flex items-center justify-center shadow-lg">
                  <div className="w-10 h-10 rounded-full border-3 border-gold/70" />
                </div>
              </div>
              
              {/* Om Symbol */}
              <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
                <span className="text-6xl md:text-8xl text-gold font-heading opacity-60">ॐ</span>
              </div>
              
              {/* Decorative Top */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-gold to-transparent" />
              
              {/* Decorative Bottom */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
          </div>
          
          {/* Center divider line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gold/30 -translate-x-1/2 z-10" />
          
          {/* Welcome text */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-20">
            <p className="text-gold text-lg md:text-xl font-heading tracking-widest animate-pulse">
              स्वागतम्
            </p>
            <p className="text-gold/70 text-sm mt-1 font-body">Welcome</p>
          </div>
        </div>
      )}
    </>
  );
}
