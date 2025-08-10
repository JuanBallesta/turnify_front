import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FiSearch,
  FiFilter,
  FiX,
  FiStar,
  FiClock,
  FiDollarSign,
  FiTag,
} from "react-icons/fi";

const ServiceFiltersComponent = ({
  services,
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Obtener categorías únicas
  const categories = Array.from(
    new Set(services.map((s) => s.category)),
  ).sort();

  // Obtener tags únicos
  const allTags = Array.from(new Set(services.flatMap((s) => s.tags))).sort();

  // Obtener rangos de precios y duración
  const maxPrice = Math.max(...services.map((s) => s.price));
  const maxDuration = Math.max(...services.map((s) => s.duration));

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleTag = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    handleFilterChange("tags", newTags);
  };

  const hasActiveFilters =
    filters.searchTerm !== "" ||
    (filters.category !== "" && filters.category !== "all") ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice ||
    filters.durationRange[0] > 0 ||
    filters.durationRange[1] < maxDuration ||
    filters.rating > 0 ||
    filters.tags.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FiFilter className="h-5 w-5" />
            <span>Filtros de Búsqueda</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {filters.tags.length +
                  (filters.searchTerm ? 1 : 0) +
                  (filters.category && filters.category !== "all" ? 1 : 0) +
                  (filters.rating > 0 ? 1 : 0)}{" "}
                activos
              </Badge>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <FiX className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Menos filtros" : "Más filtros"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Búsqueda por texto */}
        <div className="space-y-2">
          <Label>Buscar Servicios</Label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o descripción..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Categoría */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
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

          {/* Ordenar por */}
          <div className="space-y-2">
            <Label>Ordenar por</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="price">Precio</SelectItem>
                <SelectItem value="duration">Duración</SelectItem>
                <SelectItem value="rating">Calificación</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Orden</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => handleFilterChange("sortOrder", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascendente</SelectItem>
                <SelectItem value="desc">Descendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calificación mínima */}
          <div className="space-y-2">
            <Label>Calificación mínima</Label>
            <Select
              value={filters.rating === 0 ? "any" : filters.rating.toString()}
              onValueChange={(value) =>
                handleFilterChange(
                  "rating",
                  value === "any" ? 0 : parseFloat(value),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquiera</SelectItem>
                <SelectItem value="4">4+ estrellas</SelectItem>
                <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                <SelectItem value="4.8">4.8+ estrellas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator />

            {/* Rango de precios */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiDollarSign className="h-4 w-4 text-gray-500" />
                <Label>
                  Rango de Precios: ${filters.priceRange[0]} - $
                  {filters.priceRange[1]}
                </Label>
              </div>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) =>
                  handleFilterChange("priceRange", value)
                }
                max={maxPrice}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* Rango de duración */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiClock className="h-4 w-4 text-gray-500" />
                <Label>
                  Duración: {filters.durationRange[0]} -{" "}
                  {filters.durationRange[1]} minutos
                </Label>
              </div>
              <Slider
                value={filters.durationRange}
                onValueChange={(value) =>
                  handleFilterChange("durationRange", value)
                }
                max={maxDuration}
                min={0}
                step={15}
                className="w-full"
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FiTag className="h-4 w-4 text-gray-500" />
                <Label>Características</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      filters.tags.includes(tag)
                        ? "bg-violet-600 text-white hover:bg-violet-700"
                        : "hover:bg-violet-50 hover:border-violet-300"
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    {filters.tags.includes(tag) && (
                      <FiX className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceFiltersComponent;
