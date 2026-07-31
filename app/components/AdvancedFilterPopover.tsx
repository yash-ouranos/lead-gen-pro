"use client";

import { useState, useEffect } from "react";
import { Filter, TrashCan } from "@carbon/icons-react";
import { cn } from "@/lib/utils";
import { FilterRule, ColumnDef } from "@/app/hooks/useAdvancedFilter";

const OPERATORS = [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "contains", label: "Contains" },
    { value: "starts_with", label: "Starts With" }
];

export default function AdvancedFilterPopover({
    columns,
    filters,
    setFilters,
    appliedFilterCount
}: {
    columns: ColumnDef[];
    filters: FilterRule[];
    setFilters: (filters: FilterRule[]) => void;
    appliedFilterCount: number;
}) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<FilterRule[]>(filters);

    useEffect(() => {
        if (isFilterOpen) {
            setLocalFilters(filters);
        }
    }, [isFilterOpen, filters]);

    const updateFilter = (id: string, field: keyof FilterRule, value: string) => {
        setLocalFilters(localFilters.map(f => {
            if (f.id === id) {
                const updated = { ...f, [field]: value };
                if (field === "column") {
                    updated.value = "";
                    updated.operator = "";
                    if (["status", "activeStatus", "temperature", "methodOfContact", "promotions"].includes(value)) {
                        updated.operator = "equals";
                    }
                }
                return updated;
            }
            return f;
        }));
    };

    const addFilter = () => {
        setLocalFilters([...localFilters, { id: Math.random().toString(36).substring(7), column: "", operator: "", value: "" }]);
    };

    const removeFilter = (id: string) => {
        setLocalFilters(localFilters.filter(f => f.id !== id));
    };

    const clearAll = () => {
        const resetState = [{ id: Math.random().toString(36).substring(7), column: "", operator: "", value: "" }];
        setLocalFilters(resetState);
        setFilters(resetState);
        setIsFilterOpen(false);
    };

    const applyFilters = () => {
        setFilters(localFilters);
        setIsFilterOpen(false);
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn("bg-muted text-foreground border border-border px-4 py-2 flex items-center gap-2 font-medium transition rounded-md cursor-pointer", isFilterOpen ? "bg-muted/80 shadow-inner" : "hover:bg-muted/80")}
            >
                <Filter className="w-4 h-4"/> Filter {appliedFilterCount > 0 && <span className="bg-primary text-white text-xs px-1.5 rounded-full">{appliedFilterCount}</span>}
            </button>
            
            {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 bg-card border border-border shadow-lg rounded-md p-4 w-[500px] z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {localFilters.map(f => {
                            const selectedColumn = columns.find(c => c.value === f.column);
                            return (
                            <div key={f.id} className="flex items-center gap-2">
                                <select 
                                    value={f.column} 
                                    onChange={e => updateFilter(f.id, "column", e.target.value)}
                                    className="w-1/3 text-sm bg-background border border-border rounded px-2 py-1.5 focus:outline-none focus:border-primary"
                                >
                                    <option value="" disabled>Select</option>
                                    {columns.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                {["status", "activeStatus", "temperature", "methodOfContact", "promotions"].includes(f.column) ? null : (
                                    <select 
                                        value={f.operator} 
                                        onChange={e => updateFilter(f.id, "operator", e.target.value)}
                                        className="w-1/3 text-sm bg-background border border-border rounded px-2 py-1.5 focus:outline-none focus:border-primary"
                                    >
                                        <option value="" disabled>Select</option>
                                        {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                )}
                                
                                {selectedColumn?.options ? (
                                    <select 
                                        value={f.value}
                                        onChange={e => updateFilter(f.id, "value", e.target.value)}
                                        className="flex-1 min-w-0 text-sm bg-background border border-border rounded px-2 py-1.5 focus:outline-none focus:border-primary"
                                    >
                                        <option value="" disabled>Select option</option>
                                        {selectedColumn.options.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input 
                                        type="text" 
                                        value={f.value}
                                        onChange={e => updateFilter(f.id, "value", e.target.value)}
                                        placeholder="write here..."
                                        className="flex-1 min-w-0 text-sm bg-background border border-border rounded px-2 py-1.5 focus:outline-none focus:border-primary"
                                    />
                                )}
                                
                                {localFilters.length > 1 ? (
                                    <button onClick={() => removeFilter(f.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900 shrink-0">
                                        <TrashCan size={16} />
                                    </button>
                                ) : (
                                    <div className="w-[30px] shrink-0" />
                                )}
                            </div>
                        )})}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <button onClick={addFilter} className="cursor-pointer text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-500 border border-green-600 dark:border-green-500 rounded px-3 py-1.5 transition-colors">
                            Add Filter
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <button onClick={clearAll} className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors">
                                Reset
                            </button>
                            <button onClick={applyFilters} className="cursor-pointer text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded px-4 py-1.5 transition-colors">
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
