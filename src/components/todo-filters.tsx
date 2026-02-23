import { TodoFilter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TodoFiltersProps = {
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
};

const filters: Array<{ label: string; value: TodoFilter }> = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export function TodoFilters({ filter, onFilterChange }: TodoFiltersProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {filters.map((item) => (
        <Button
          key={item.value}
          type="button"
          size="sm"
          variant="ghost"
          className={cn(
            "h-8 rounded-md px-3 text-xs sm:text-sm",
            filter === item.value && "bg-background shadow-sm",
          )}
          onClick={() => onFilterChange(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}
