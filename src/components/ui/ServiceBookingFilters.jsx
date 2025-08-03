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
  services, // Recibimos la lista de servicios ya filtrada por el padre si es necesario
  filters,
  onFilterChange,
  isLocked, // La única prop necesaria para saber si se debe bloquear
}) => {
  // --- CORRECCIÓN ---
  // Se eliminó el estado `visibleServices` y el `useEffect`.
  // El componente ahora confía en la lista de `services` que recibe,
  // que ya ha sido procesada por el componente padre (BookAppointment).
  // Esto simplifica enormemente la lógica y evita errores de sincronización.

  const categories = useMemo(() => {
    // Usamos `services` directamente, no el estado local.
    const allCategories = services.map((s) => s.category).filter(Boolean);
    return [...new Set(allCategories)];
  }, [services]);

  const maxPrice = useMemo(() => {
    if (services.length === 0) return 50000;
    const price = Math.max(...services.map((s) => Number(s.price)));
    return Math.ceil(price / 1000) * 1000;
  }, [services]);

  const maxDuration = useMemo(() => {
    if (services.length === 0) return 240;
    const duration = Math.max(
      ...services.map((s) => Number(s.durationMinutes)),
    );
    return Math.ceil(duration / 15) * 15;
  }, [services]);

  const handlePriceChange = (value) => {
    onFilterChange("priceRange", value);
  };

  const handleDurationChange = (value) => {
    onFilterChange("durationRange", value);
  };

  const clearFilters = () => {
    onFilterChange("clearAll");
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FiFilter className="w-5 h-5 text-muted-foreground" />
          <span>Filtros</span>
        </CardTitle>
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
              // Esta prop es la que hace toda la magia. Deshabilita el selector.
              disabled={isLocked}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar negocio" />
              </SelectTrigger>
              <SelectContent>
                {/* --- CORRECCIÓN LÓGICA --- */}
                {/* Solo mostramos "Todos los negocios" si el filtro NO está bloqueado */}
                {!isLocked && (
                  <SelectItem value="all">Todos los negocios</SelectItem>
                )}
                {businesses.map((business) => (
                  <SelectItem key={business.id} value={business.id.toString()}>
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* --- CORRECCIÓN DE TEXTO --- */}
            {/* El mensaje debe reflejar que es para un empleado, no un admin */}
            {isLocked && (
              <p className="text-xs text-muted-foreground mt-1">
                Como empleado, solo puedes agendar en tu negocio asignado.
              </p>
            )}
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

        <div className="space-y-4 pt-2">
          <Label>Rango de Precio</Label>
          <Slider
            min={0}
            max={maxPrice}
            step={1000}
            value={filters.priceRange}
            onValueChange={handlePriceChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Label>Duración (minutos)</Label>
          <Slider
            min={0}
            max={maxDuration}
            step={15}
            value={filters.durationRange}
            onValueChange={handleDurationChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{filters.durationRange[0]} min</span>
            <span>{filters.durationRange[1]} min</span>
          </div>
        </div>

        <Button variant="ghost" onClick={clearFilters} className="w-full">
          <FiRefreshCw className="mr-2 h-4 w-4" />
          Limpiar Filtros
        </Button>
      </CardContent>
    </Card>
  );
};
