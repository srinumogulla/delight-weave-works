import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Occasion {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

interface StepSelectBlessingProps {
  services: Service[];
  selectedService: string;
  setSelectedService: (value: string) => void;
  occasions: Occasion[];
  occasion: string;
  setOccasion: (value: string) => void;
  selectedServiceData: Service | undefined;
}

export const StepSelectBlessing = ({
  services,
  selectedService,
  setSelectedService,
  occasions,
  occasion,
  setOccasion,
  selectedServiceData,
}: StepSelectBlessingProps) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Label htmlFor="service" className="text-base font-medium">Select Pooja *</Label>
      <Select value={selectedService} onValueChange={setSelectedService}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Choose a pooja for your loved one" />
        </SelectTrigger>
        <SelectContent className="bg-card">
          {services.map((service) => (
            <SelectItem key={service.id} value={service.id}>
              {service.name} - ₹{Number(service.price).toLocaleString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-3">
      <Label className="text-base font-medium">Select an Occasion *</Label>
      <div className="grid grid-cols-3 gap-3">
        {occasions.map((occ) => (
          <button
            key={occ.value}
            type="button"
            onClick={() => setOccasion(occ.value)}
            className={`p-4 rounded-xl border-2 transition-all text-center group ${
              occasion === occ.value
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${
              occasion === occ.value ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/20"
            }`}>
              <occ.icon className={`h-6 w-6 ${occasion === occ.value ? "" : "text-muted-foreground group-hover:text-primary"}`} />
            </div>
            <span className={`text-sm font-medium ${occasion === occ.value ? "text-primary" : "text-foreground"}`}>{occ.label}</span>
          </button>
        ))}
      </div>
    </div>

    {selectedServiceData && (
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Selected Pooja</p>
          <p className="font-medium">{selectedServiceData.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="font-heading text-xl font-bold text-primary">₹{Number(selectedServiceData.price).toLocaleString()}</p>
        </div>
      </div>
    )}
  </div>
);
