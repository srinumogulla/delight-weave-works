import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimePickerAMPMProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TimePickerAMPM({ value, onChange, disabled }: TimePickerAMPMProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  // Parse incoming 24-hour value to 12-hour display
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      if (h && m) {
        let hour24 = parseInt(h, 10);
        const mins = m;

        if (hour24 === 0) {
          setHours("12");
          setPeriod("AM");
        } else if (hour24 === 12) {
          setHours("12");
          setPeriod("PM");
        } else if (hour24 > 12) {
          setHours(String(hour24 - 12));
          setPeriod("PM");
        } else {
          setHours(String(hour24));
          setPeriod("AM");
        }
        setMinutes(mins);
      }
    }
  }, []);

  // Convert 12-hour to 24-hour and notify parent
  const updateTime = (newHours: string, newMinutes: string, newPeriod: "AM" | "PM") => {
    if (newHours && newMinutes) {
      let hour24 = parseInt(newHours, 10);
      
      if (newPeriod === "AM") {
        if (hour24 === 12) hour24 = 0;
      } else {
        if (hour24 !== 12) hour24 += 12;
      }

      const formatted = `${String(hour24).padStart(2, "0")}:${newMinutes}`;
      onChange(formatted);
    }
  };

  const handleHoursChange = (h: string) => {
    setHours(h);
    updateTime(h, minutes, period);
  };

  const handleMinutesChange = (m: string) => {
    setMinutes(m);
    updateTime(hours, m, period);
  };

  const handlePeriodChange = (p: "AM" | "PM") => {
    setPeriod(p);
    updateTime(hours, minutes, p);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={hours} onValueChange={handleHoursChange} disabled={disabled}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent className="max-h-48 bg-background">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <SelectItem key={h} value={String(h)}>
              {String(h).padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground font-medium">:</span>

      <Select value={minutes} onValueChange={handleMinutesChange} disabled={disabled}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent className="max-h-48 bg-background">
          {Array.from({ length: 60 }, (_, i) => i).map((m) => (
            <SelectItem key={m} value={String(m).padStart(2, "0")}>
              {String(m).padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={period} onValueChange={(v) => handlePeriodChange(v as "AM" | "PM")} disabled={disabled}>
        <SelectTrigger className="w-[75px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
