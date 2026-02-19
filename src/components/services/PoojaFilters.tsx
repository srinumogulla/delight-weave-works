import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface PoojaFiltersProps {
  onSearch: (query: string) => void;
  onFilterType?: (type: string) => void;
  onFilterGuru?: (guru: string) => void;
  searchPlaceholder?: string;
  showGuruFilter?: boolean;
  gurus?: string[];
}

export function PoojaFilters({
  onSearch,
  onFilterType,
  onFilterGuru,
  searchPlaceholder = "Search by ritual name, type, guru, or date",
  showGuruFilter = true,
  gurus = [],
}: PoojaFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedGuru, setSelectedGuru] = useState("all");

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedGuru("all");
    onSearch("");
    onFilterType?.("all");
    onFilterGuru?.("all");
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={selectedType}
          onValueChange={(value) => {
            setSelectedType(value);
            onFilterType?.(value);
          }}
        >
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-card">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="dosha">Dosha</SelectItem>
            <SelectItem value="special">Special</SelectItem>
          </SelectContent>
        </Select>

        {/* Guru Filter */}
        {showGuruFilter && gurus.length > 0 && (
          <Select
            value={selectedGuru}
            onValueChange={(value) => {
              setSelectedGuru(value);
              onFilterGuru?.(value);
            }}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Any Guru" />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="all">Any Guru</SelectItem>
              {gurus.map((guru) => (
                <SelectItem key={guru} value={guru}>
                  {guru}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear Button */}
        {(searchQuery || selectedType !== "all" || selectedGuru !== "all") && (
          <Button variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}