import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { FiSearch, FiX } from "react-icons/fi";

const SearchBox = React.forwardRef(
  (
    {
      className,
      placeholder = "Buscar...",
      value,
      onValueChange,
      onSearch,
      onClear,
      showClearButton = true,
      size = "default",
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(value || "");

    const handleValueChange = (e) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    const handleClear = () => {
      setInternalValue("");
      onValueChange?.("");
      onClear?.();
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        onSearch?.(internalValue);
      }
    };

    const sizes = {
      sm: "h-8 text-sm",
      default: "h-10",
      lg: "h-12 text-lg",
    };

    return (
      <div
        ref={ref}
        className={cn("relative flex items-center", className)}
        {...props}
      >
        <div className="absolute left-3 z-10">
          <FiSearch className="w-4 h-4 text-gray-400" />
        </div>

        <Input
          value={internalValue}
          onChange={handleValueChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn("pl-10 pr-10", sizes[size])}
        />

        {showClearButton && internalValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <FiX className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  },
);

SearchBox.displayName = "SearchBox";

export { SearchBox };
