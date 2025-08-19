
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

const FilterSection = ({ title, children }) => (
  <div className="py-6 border-b border-[var(--border)]">
    <h3 className="text-xl text-[var(--foreground)] mb-6">{title}</h3>
    {children}
  </div>
);

export default function FilterSidebar({
  filters,
  onFilterChange,
  categories,
  maxPrice,
  sortOption,
  onSortChange,
}) {
  const [categorySearch, setCategorySearch] = useState('');

  const handlePriceChange = (value) => {
    onFilterChange({ ...filters, priceRange: value });
  };

  const handleCategoryToggle = (categoryName, checked) => {
    const newCategories = checked
      ? [...filters.categories, categoryName]
      : filters.categories.filter(c => c !== categoryName);
    onFilterChange({ ...filters, categories: newCategories });
  };
  
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="divide-y divide-[var(--border)]">
      <FilterSection title="Ordenar por">
        <Select value={sortOption} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_date">Novidades</SelectItem>
            <SelectItem value="price_asc">Preço: Menor para Maior</SelectItem>
            <SelectItem value="price_desc">Preço: Maior para Menor</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Categorias">
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] w-4 h-4" />
            <Input 
                placeholder="Buscar categoria..." 
                className="pl-9 h-10 bg-transparent border-[var(--border)]"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
            />
        </div>
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {filteredCategories.map((category) => (
            <div key={category.id} className="flex items-center gap-3">
              <Checkbox
                id={`cat-${category.id}`}
                checked={filters.categories.includes(category.name)}
                onCheckedChange={(checked) => handleCategoryToggle(category.name, checked)}
                className="w-5 h-5 rounded-none border-[var(--border)]"
              />
              <Label htmlFor={`cat-${category.id}`} className="font-normal text-base text-[var(--foreground)] cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Preço">
        <Slider
          value={filters.priceRange}
          onValueChange={handlePriceChange}
          max={maxPrice}
          step={10}
          className="mb-3"
          thumbClassName="bg-[var(--primary)]"
          trackClassName="bg-[var(--border)]"
          rangeClassName="bg-[var(--primary)]"
        />
        <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
          <span>R$ {filters.priceRange[0]}</span>
          <span>{maxPrice > 0 ? `R$ ${filters.priceRange[1]}`: ''}</span>
        </div>
      </FilterSection>
      
      <div className="pt-6">
        <div className="flex items-center justify-between mb-4">
            <Label htmlFor="on-sale-filter" className="text-xl text-[var(--foreground)]">Promoção</Label>
            <Switch 
                id="on-sale-filter"
                checked={filters.showOnSale}
                onCheckedChange={(checked) => onFilterChange({...filters, showOnSale: checked})}
            />
        </div>
        <div className="flex items-center justify-between">
            <Label htmlFor="featured-filter" className="text-xl text-[var(--foreground)]">Novidades</Label>
            <Switch 
                id="featured-filter"
                checked={filters.showFeatured}
                onCheckedChange={(checked) => onFilterChange({...filters, showFeatured: checked})}
            />
        </div>
      </div>
    </div>
  );
}
