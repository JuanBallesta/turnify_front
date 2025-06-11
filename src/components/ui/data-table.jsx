import React from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { LoadingSpinner } from "./loading-spinner";
import { FiDatabase } from "react-icons/fi";

const DataTable = React.forwardRef(
  (
    {
      className,
      columns = [],
      data = [],
      isLoading = false,
      emptyMessage = "No hay datos disponibles",
      emptyDescription = "No se encontraron elementos para mostrar.",
      onRowClick,
      ...props
    },
    ref,
  ) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <EmptyState
          icon={FiDatabase}
          title={emptyMessage}
          description={emptyDescription}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn("w-full overflow-auto", className)}
        {...props}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={cn(
                    "px-4 py-3 text-left text-sm font-medium text-gray-900",
                    column.className,
                  )}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={cn(
                  "hover:bg-gray-50 transition-colors",
                  onRowClick && "cursor-pointer",
                  row.className,
                )}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {columns.map((column, columnIndex) => {
                  const cellValue = column.render
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key];

                  return (
                    <td
                      key={`${rowIndex}-${column.key || columnIndex}`}
                      className={cn(
                        "px-4 py-3 text-sm text-gray-900",
                        column.cellClassName,
                      )}
                    >
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

DataTable.displayName = "DataTable";

export { DataTable };
