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

const ServiceBookingFilters = ({
  businesses,
  services,
  filters,
  onFilterChange,
}) => {
  const categories = useMemo(() => {
    const allCategories = services.map((s) => s.category).filter(Boolean);
    return [...new Set(allCategories)];
  }, [services]);

  const maxPrice = useMemo(() => {
    if (services.length === 0) return 50000;
    return Math.max(...services.map((s) => Number(s.price)));
  }, [services]);

  const handlePriceChange = (value) => {
    onFilterChange("priceRange", value);
  };

  const clearFilters = () => {
    onFilterChange("clearAll");
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Filtrar Servicios</CardTitle>
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

        {businesses && businesses.length > 0 && (
          <div className="space-y-2">
            <Label>Negocio</Label>
            <Select
              value={filters.businessId}
              onValueChange={(val) => onFilterChange("businessId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los negocios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los negocios</SelectItem>
                {businesses.map((business) => (
                  <SelectItem key={business.id} value={business.id.toString()}>
                    {business.name}
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
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
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
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={clearFilters}
          className="w-full text-violet-600 hover:text-violet-700"
        >
          Limpiar Filtros
        </Button>
      </CardContent>
    </Card>
  );
};

export { ServiceBookingFilters };
