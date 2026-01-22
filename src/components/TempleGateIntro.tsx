import { useState, useEffect, useRef, ReactNode } from "react";
import vedicPattern from "@/assets/vedic-pattern.svg";

interface TempleGateIntroProps {
  children: ReactNode;
}

export function TempleGateIntro({ children }: TempleGateIntroProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const skipIntro = () => {
    setIsAnimating(false);
    setIsComplete(true);
    sessionStorage.setItem("templeIntroShown", "true");
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    // Check if animation has been shown this session
    const hasSeenIntro = sessionStorage.getItem("templeIntroShown");
    
    if (hasSeenIntro) {
      setIsAnimating(false);
      setIsComplete(true);
      return;
    }

    // Show skip button after 0.5s
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 500);

    // Play temple bell sound
    const playSound = () => {
      // Using the uploaded temple bell sound
      audioRef.current = new Audio("/sounds/temple-bell.mp4");
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {
        // Autoplay blocked, will play on interaction
      });
    };
    
    playSound();

    // Start opening animation after brief pause (slower timing)
    const openTimer = setTimeout(() => {
      setIsAnimating(false);
      // Fade out audio
      if (audioRef.current) {
        const fadeOut = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0.05) {
            audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05);
          } else {
            clearInterval(fadeOut);
            if (audioRef.current) {
              audioRef.current.pause();
            }
          }
        }, 100);
      }
    }, 2000);

    // Complete and hide overlay after animation finishes (slower - 5s total)
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      sessionStorage.setItem("templeIntroShown", "true");
    }, 5000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(openTimer);
      clearTimeout(completeTimer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <>
      {children}
      
      {!isComplete && (
        <div 
          className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${
            !isAnimating ? "opacity-0 pointer-events-none" : ""
          }`}
          style={{ 
            transitionDelay: "2s",
            perspective: "1500px"
          }}
        >
          {/* Background overlay - stone temple floor */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-800 via-stone-700 to-stone-900" />
          
          {/* Temple arch frame */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110%] h-20 bg-gradient-to-b from-stone-600 to-stone-700 shadow-2xl" style={{
              clipPath: "ellipse(55% 100% at 50% 0%)"
            }} />
          </div>
          
          {/* Left Door */}
          <div
            className={`temple-door temple-door-left ${!isAnimating ? "door-open-left" : ""}`}
          >
            <div className="door-inner door-wood-texture">
              {/* Wood grain lines */}
              <div className="absolute inset-0 opacity-30">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-full h-px bg-gradient-to-r from-transparent via-amber-900/60 to-transparent"
                    style={{ top: `${8 + i * 8}%` }}
                  />
                ))}
              </div>
              
              {/* Vertical wood planks */}
              <div className="absolute inset-0 flex">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="flex-1 border-r border-amber-900/20 last:border-r-0"
                  />
                ))}
              </div>
              
              {/* Ornate Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url(${vedicPattern})`,
                  backgroundSize: "80px 80px",
                  backgroundRepeat: "repeat"
                }}
              />
              
              {/* Stone/concrete weathered edges */}
              <div className="absolute inset-0 border-8 border-stone-600/50 rounded-sm shadow-inner" />
              
              {/* Decorative carved frame */}
              <div className="absolute inset-4 border-4 border-amber-700/60 rounded-sm" />
              <div className="absolute inset-6 border-2 border-amber-600/40 rounded-sm" />
              
              {/* Brass studs grid */}
              <div className="absolute inset-8 grid grid-cols-3 grid-rows-6 gap-4 pointer-events-none">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 shadow-lg" />
                  </div>
                ))}
              </div>
              
              {/* Door Ring/Handle */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
                <div className="w-14 h-14 rounded-full border-4 border-amber-600 bg-gradient-to-br from-amber-500 to-amber-800 flex items-center justify-center shadow-xl">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-400/70 bg-stone-700/50" />
                </div>
                {/* Ring holder */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-sm -mt-8" />
              </div>
              
              {/* Om Symbol carved */}
              <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2">
                <span className="text-5xl md:text-7xl font-heading text-amber-600/50 drop-shadow-lg" style={{
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(255,200,100,0.3)"
                }}>ॐ</span>
              </div>
              
              {/* Iron hinges */}
              <div className="absolute left-0 top-[15%] w-8 h-12 bg-gradient-to-r from-stone-500 to-stone-600 rounded-r-lg shadow-lg" />
              <div className="absolute left-0 top-[50%] w-8 h-12 bg-gradient-to-r from-stone-500 to-stone-600 rounded-r-lg shadow-lg" />
              <div className="absolute left-0 top-[85%] w-8 h-12 bg-gradient-to-r from-stone-500 to-stone-600 rounded-r-lg shadow-lg" />
              
              {/* Weathering/aging effects */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-stone-800/40 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-stone-700/30 to-transparent" />
            </div>
          </div>
          
          {/* Right Door */}
          <div
            className={`temple-door temple-door-right ${!isAnimating ? "door-open-right" : ""}`}
          >
            <div className="door-inner door-wood-texture">
              {/* Wood grain lines */}
              <div className="absolute inset-0 opacity-30">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-full h-px bg-gradient-to-r from-transparent via-amber-900/60 to-transparent"
                    style={{ top: `${8 + i * 8}%` }}
                  />
                ))}
              </div>
              
              {/* Vertical wood planks */}
              <div className="absolute inset-0 flex">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className="flex-1 border-r border-amber-900/20 last:border-r-0"
                  />
                ))}
              </div>
              
              {/* Ornate Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url(${vedicPattern})`,
                  backgroundSize: "80px 80px",
                  backgroundRepeat: "repeat"
                }}
              />
              
              {/* Stone/concrete weathered edges */}
              <div className="absolute inset-0 border-8 border-stone-600/50 rounded-sm shadow-inner" />
              
              {/* Decorative carved frame */}
              <div className="absolute inset-4 border-4 border-amber-700/60 rounded-sm" />
              <div className="absolute inset-6 border-2 border-amber-600/40 rounded-sm" />
              
              {/* Brass studs grid */}
              <div className="absolute inset-8 grid grid-cols-3 grid-rows-6 gap-4 pointer-events-none">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 shadow-lg" />
                  </div>
                ))}
              </div>
              
              {/* Door Ring/Handle */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
                <div className="w-14 h-14 rounded-full border-4 border-amber-600 bg-gradient-to-br from-amber-500 to-amber-800 flex items-center justify-center shadow-xl">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-400/70 bg-stone-700/50" />
                </div>
                {/* Ring holder */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-sm -mt-8" />
              </div>
              
              {/* Om Symbol carved */}
              <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2">
                <span className="text-5xl md:text-7xl font-heading text-amber-600/50 drop-shadow-lg" style={{
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(255,200,100,0.3)"
                }}>ॐ</span>
              </div>
              
              {/* Iron hinges */}
              <div className="absolute right-0 top-[15%] w-8 h-12 bg-gradient-to-l from-stone-500 to-stone-600 rounded-l-lg shadow-lg" />
              <div className="absolute right-0 top-[50%] w-8 h-12 bg-gradient-to-l from-stone-500 to-stone-600 rounded-l-lg shadow-lg" />
              <div className="absolute right-0 top-[85%] w-8 h-12 bg-gradient-to-l from-stone-500 to-stone-600 rounded-l-lg shadow-lg" />
              
              {/* Weathering/aging effects */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-stone-800/40 to-transparent" />
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-stone-700/30 to-transparent" />
            </div>
          </div>
          
          {/* Center divider line - brass strip */}
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-amber-500 via-amber-700 to-amber-600 -translate-x-1/2 z-10 shadow-lg" />
          
          {/* Temple threshold at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-stone-600 to-stone-700 shadow-inner" />
          
          {/* Welcome text */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center z-20">
            <p className="text-amber-400 text-xl md:text-2xl font-heading tracking-widest animate-pulse drop-shadow-lg">
              स्वागतम्
            </p>
            <p className="text-amber-300/70 text-sm mt-2 font-body">Welcome to the Temple</p>
          </div>
          
          {/* Skip button */}
          {showSkip && (
            <button
              onClick={skipIntro}
              className="absolute bottom-6 right-6 z-30 px-4 py-2 bg-stone-800/80 hover:bg-stone-700/90 text-amber-300/80 hover:text-amber-200 text-sm font-medium rounded-lg border border-amber-600/30 transition-all duration-300 backdrop-blur-sm animate-fade-in"
            >
              Skip Intro →
            </button>
          )}
        </div>
      )}
    </>
  );
}
