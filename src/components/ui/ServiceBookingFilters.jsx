import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SearchBox } from "@/components/ui/search-box";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  FiFilter,
  FiRefreshCw,
  FiMapPin,
  FiTag,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";

export const ServiceBookingFilters = ({
  businesses,
  services,
  filters,
  onFilterChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = useMemo(() => {
    if (!services) return [];
    const allCategories = services.map((s) => s.category).filter(Boolean);
    return [...new Set(allCategories)];
  }, [services]);

  const maxPrice = useMemo(() => {
    if (!services || services.length === 0) return 50000;
    return (
      Math.ceil(Math.max(...services.map((s) => Number(s.price))) / 1000) * 1000
    );
  }, [services]);

  const maxDuration = useMemo(() => {
    if (!services || services.length === 0) return 240;
    return (
      Math.ceil(
        Math.max(...services.map((s) => Number(s.durationMinutes))) / 15,
      ) * 15
    );
  }, [services]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.businessId !== "all") count++;
    if (filters.category !== "all") count++;
    if (isExpanded) {
      // Solo contamos los filtros avanzados si están visibles
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice)
        count++;
      if (
        filters.durationRange[0] > 0 ||
        filters.durationRange[1] < maxDuration
      )
        count++;
    }
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <FiFilter className="w-5 h-5 text-gray-400" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Menos" : "Más filtros"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Búsqueda por nombre</Label>
          <SearchBox
            placeholder="Ej: Corte, Manicura..."
            value={filters.search}
            onValueChange={(val) => onFilterChange("search", val)}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center">
            <FiMapPin className="mr-2 h-4 w-4 text-gray-400" />
            Negocio
          </Label>
          <Select
            value={filters.businessId}
            onValueChange={(val) => onFilterChange("businessId", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los negocios</SelectItem>
              {businesses.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center">
            <FiTag className="mr-2 h-4 w-4 text-gray-400" />
            Categoría
          </Label>
          <Select
            value={filters.category}
            onValueChange={(val) => onFilterChange("category", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isExpanded && (
          <>
            <Separator />
            <div className="space-y-4">
              <Label className="flex items-center">
                <FiDollarSign className="mr-2 h-4 w-4 text-gray-400" />
                Rango de Precio
              </Label>
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
              <Label className="flex items-center">
                <FiClock className="mr-2 h-4 w-4 text-gray-400" />
                Duración (minutos)
              </Label>
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
          </>
        )}

        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => onFilterChange("clearAll")}
              className="w-full text-violet-600 hover:text-violet-700 font-semibold"
            >
              <FiRefreshCw className="mr-2 h-4 w-4" /> Limpiar{" "}
              {activeFiltersCount} Filtro(s)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
