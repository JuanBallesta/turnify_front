import React from "react";
import { Input } from "@/components/ui/input";
import { FiSearch } from "react-icons/fi";

// --- CORRECCIÓN ---
// Aceptamos 'onValueChange' (o el nombre que uses) y lo separamos del resto de los props.
export const SearchBox = ({
  value,
  onValueChange,
  placeholder,
  className,
  ...props
}) => {
  return (
    <div className="relative">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        // El evento 'onChange' del input llama a la función 'onValuechainge'
        onChange={(e) => onValueChange(e.target.value)}
        className={`pl-10 ${className}`}
        // El '...props' ya no contiene 'onValueChange', por lo que no se pasa al DOM.
        {...props}
      />
    </div>
  );
};
