import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Users, Info } from "lucide-react";

interface StepArchanaDetailsProps {
  recipientName: string;
  setRecipientName: (value: string) => void;
  gotra: string;
  setGotra: (value: string) => void;
}

export const StepArchanaDetails = ({
  recipientName,
  setRecipientName,
  gotra,
  setGotra,
}: StepArchanaDetailsProps) => {
  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-sm text-foreground mb-1">
              These details will be used during the Archana
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The priest will recite the recipient's name and gotra while performing the sacred Archana ritual at the temple.
            </p>
          </div>
        </div>
      </div>

      {/* Recipient Name */}
      <div className="space-y-2">
        <Label htmlFor="recipientName" className="text-base font-medium flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Recipient's Full Name *
        </Label>
        <Input
          id="recipientName"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Enter the full name for the Archana"
          className="h-14 text-lg"
        />
        <p className="text-xs text-muted-foreground">
          This name will be recited during the ritual
        </p>
      </div>

      {/* Gotra */}
      <div className="space-y-2">
        <Label htmlFor="gotra" className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Gotra (Family Lineage) *
        </Label>
        <Input
          id="gotra"
          value={gotra}
          onChange={(e) => setGotra(e.target.value)}
          placeholder="e.g., Bharadwaja, Kashyapa, Vasishta..."
          className="h-14 text-lg"
        />
        <p className="text-xs text-muted-foreground">
          The ancestral lineage (Gotra) is traditionally recited during Archana
        </p>
      </div>

      {/* Common Gotras Helper */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Common Gotras:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Bharadwaja",
            "Kashyapa",
            "Vasishta",
            "Vishwamitra",
            "Gautama",
            "Jamadagni",
            "Atri",
            "Agastya",
          ].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGotra(g)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                gotra === g
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Card */}
      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800/30">
        <p className="text-sm text-center italic text-amber-900 dark:text-amber-200">
          🙏 <span className="font-medium">{recipientName || "[Name]"}</span>, 
          <span className="font-medium"> {gotra || "[Gotra]"}</span> Gotrasya/Gotrasyah
        </p>
        <p className="text-xs text-center text-amber-700 dark:text-amber-400 mt-1">
          This is how the priest will recite during the Archana
        </p>
      </div>
    </div>
  );
};
