import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Slider } from "./slider";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { SearchBox } from "./search-box";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiStar,
  FiRefreshCw,
} from "react-icons/fi";

const ServiceBookingFilters = ({
  businesses = [],
  onFiltersChange,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState({
    search: "",
    businessId: "all",
    category: "all",
    priceRange: [0, 200],
    durationRange: [15, 180],
    minRating: 4.0,
    tags: [],
    ...initialFilters,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Categorías disponibles
  const categories = ["Cabello", "Uñas", "Facial", "Bienestar", "Depilación"];

  // Tags populares
  const popularTags = [
    "corte",
    "color",
    "manicura",
    "relajante",
    "natural",
    "hidratante",
    "terapéutico",
    "hipoalergénica",
  ];

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      businessId: "all",
      category: "all",
      priceRange: [0, 200],
      durationRange: [15, 180],
      minRating: 4.0,
      tags: [],
    };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  };

  const toggleTag = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.businessId !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 200) count++;
    if (filters.durationRange[0] > 15 || filters.durationRange[1] < 180)
      count++;
    if (filters.minRating > 4.0) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <FiFilter className="w-5 h-5" />
            <span>Filtros de Búsqueda</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              disabled={getActiveFiltersCount() === 0}
            >
              <FiRefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Menos" : "Más"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Búsqueda por texto */}
        <div>
          <SearchBox
            placeholder="Buscar servicios..."
            value={filters.search}
            onValueChange={(value) => updateFilters({ search: value })}
          />
        </div>

        {/* Filtro por negocio */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <FiMapPin className="w-4 h-4" />
            <span>Negocio</span>
          </Label>
          <Select
            value={filters.businessId}
            onValueChange={(value) => updateFilters({ businessId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar negocio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los negocios</SelectItem>
              {businesses.map((business) => (
                <SelectItem key={business.id} value={business.id}>
                  <div className="flex items-center space-x-2">
                    <span>{business.name}</span>
                    <Badge variant="outline" className="text-xs">
                      ★ {business.rating}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por categoría */}
        <div className="space-y-2">
          <Label>Tipo de Servicio</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => updateFilters({ category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isExpanded && (
          <>
            <Separator />

            {/* Filtro por precio */}
            <div className="space-y-3">
              <Label className="flex items-center space-x-2">
                <FiDollarSign className="w-4 h-4" />
                <span>Rango de Precio</span>
              </Label>
              <div className="px-3">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) =>
                    updateFilters({ priceRange: value })
                  }
                  max={200}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </div>

            {/* Filtro por duración */}
            <div className="space-y-3">
              <Label className="flex items-center space-x-2">
                <FiClock className="w-4 h-4" />
                <span>Duración del Servicio</span>
              </Label>
              <div className="px-3">
                <Slider
                  value={filters.durationRange}
                  onValueChange={(value) =>
                    updateFilters({ durationRange: value })
                  }
                  max={180}
                  min={15}
                  step={15}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{filters.durationRange[0]} min</span>
                <span>{filters.durationRange[1]} min</span>
              </div>
            </div>

            {/* Filtro por calificación mínima */}
            <div className="space-y-3">
              <Label className="flex items-center space-x-2">
                <FiStar className="w-4 h-4" />
                <span>Calificación Mínima: {filters.minRating.toFixed(1)}</span>
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {[4.0, 4.2, 4.5, 4.7, 4.9].map((rating) => (
                  <Button
                    key={rating}
                    variant={
                      filters.minRating === rating ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => updateFilters({ minRating: rating })}
                    className="text-xs"
                  >
                    {rating}+
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtro por tags */}
            <div className="space-y-3">
              <Label>Características</Label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-violet-100"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {filters.tags.includes(tag) && (
                      <FiX className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Resumen de filtros activos */}
        {getActiveFiltersCount() > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {getActiveFiltersCount()} filtro(s) activo(s)
              </span>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Limpiar todo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { ServiceBookingFilters };
