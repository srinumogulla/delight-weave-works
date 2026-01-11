import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  temples: string[];
}

interface ServiceFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
  temples: string[];
  maxPrice: number;
}

export function ServiceFilters({
  filters,
  onFiltersChange,
  categories,
  temples,
  maxPrice,
}: ServiceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleTemple = (temple: string) => {
    const newTemples = filters.temples.includes(temple)
      ? filters.temples.filter((t) => t !== temple)
      : [...filters.temples, temple];
    onFiltersChange({ ...filters, temples: newTemples });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      priceRange: [0, maxPrice],
      temples: [],
    });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.temples.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-heading font-semibold text-foreground mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-heading font-semibold text-foreground mb-3">Price Range</h4>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, priceRange: value as [number, number] })
            }
            max={maxPrice}
            step={100}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{filters.priceRange[0].toLocaleString()}</span>
            <span>₹{filters.priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Temples */}
      <div>
        <h4 className="font-heading font-semibold text-foreground mb-3">Temples</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {temples.map((temple) => (
            <div key={temple} className="flex items-center gap-2">
              <Checkbox
                id={`temple-${temple}`}
                checked={filters.temples.includes(temple)}
                onCheckedChange={() => toggleTemple(temple)}
              />
              <Label
                htmlFor={`temple-${temple}`}
                className="text-sm font-normal cursor-pointer"
              >
                {temple}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
              {filters.categories.length + filters.temples.length}
            </span>
          )}
        </Button>

        {isOpen && (
          <div className="mt-4 p-4 bg-card rounded-lg border border-border">
            <FilterContent />
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block sticky top-24 bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold text-foreground">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <FilterContent />
      </div>
    </>
  );
}
