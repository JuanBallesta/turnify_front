import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/ui/search-box";
import { FiFilter, FiRefreshCw } from "react-icons/fi";

export const ServiceBookingFilters = ({
  businesses,
  services,
  filters,
  onFilterChange,
}) => {
  const categories = useMemo(() => {
    if (!services) return [];
    const allCategories = services.map((s) => s.category).filter(Boolean);
    return [...new Set(allCategories)];
  }, [services]);

  const maxPrice = useMemo(() => {
    if (!services || services.length === 0) return 50000;
    const price = Math.max(...services.map((s) => Number(s.price)));
    return Math.ceil(price / 1000) * 1000; // Redondear al siguiente mil
  }, [services]);

  const maxDuration = useMemo(() => {
    if (!services || services.length === 0) return 240;
    const duration = Math.max(
      ...services.map((s) => Number(s.durationMinutes)),
    );
    return Math.ceil(duration / 15) * 15; // Redondear al siguiente múltiplo de 15
  }, [services]);

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FiFilter className="w-5 h-5" />
          <span>Filtros</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Búsqueda</Label>
          <SearchBox
            placeholder="Buscar por nombre..."
            value={filters.search}
            onValueChange={(val) => onFilterChange("search", val)}
          />
        </div>
        {businesses && businesses.length > 0 && (
          <div className="space-y-2">
            <Label>Negocio</Label>
            <Select
              value={filters.businessId}
              onValueChange={(val) => onFilterChange("businessId", val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select
            value={filters.category}
            onValueChange={(val) => onFilterChange("category", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          <Label>Rango de Precio</Label>
          <Slider
            min={0}
            max={maxPrice}
            step={1000}
            value={filters.priceRange}
            onValueChange={(val) => onFilterChange("priceRange", val)}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
        <div className="space-y-4">
          <Label>Duración (minutos)</Label>
          <Slider
            min={0}
            max={maxDuration}
            step={15}
            value={filters.durationRange}
            onValueChange={(val) => onFilterChange("durationRange", val)}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{filters.durationRange[0]} min</span>
            <span>{filters.durationRange[1]} min</span>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => onFilterChange("clearAll")}
          className="w-full text-violet-600 hover:text-violet-700 font-semibold"
        >
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Limpiar Filtros
        </Button>
      </CardContent>
    </Card>
  );
};
