import { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CitySuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CityAutocomplete({
  value,
  onChange,
  placeholder = "City, State, Country",
  disabled,
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const justSelected = useRef(false);

  // Debounced API call to Nominatim
  useEffect(() => {
    // Skip if we just selected a city
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      if (value.length >= 3) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&addressdetails=1`
          );
          const data = await response.json();
          setSuggestions(data);
          setShowDropdown(true);
        } catch {
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectCity = (city: CitySuggestion) => {
    justSelected.current = true;
    const displayName = city.display_name.split(",").slice(0, 2).join(",").trim();
    onChange(displayName, parseFloat(city.lat), parseFloat(city.lon));
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-8"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
          {suggestions.map((city, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-2 border-b last:border-b-0 transition-colors"
              onClick={() => selectCity(city)}
            >
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate text-sm">{city.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
