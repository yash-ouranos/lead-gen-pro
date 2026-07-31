import { useState, useMemo } from 'react';

export type FilterRule = {
    id: string;
    column: string;
    operator: string;
    value: string;
};

export type ColumnDef = {
    value: string;
    label: string;
    options?: { label: string; value: string }[];
};

export function useAdvancedFilter<T extends Record<string, any>>(data: T[]) {
    const [filters, setFilters] = useState<FilterRule[]>([
        { id: Math.random().toString(36).substring(7), column: "", operator: "", value: "" }
    ]);

    const filteredData = useMemo(() => {
        if (!data) return [];
        const activeFilters = filters.filter(f => f.column && f.operator && f.value);
        if (activeFilters.length === 0) return data;

        return data.filter(item => {
            return activeFilters.every(f => {
                let val = item[f.column];
                if (Array.isArray(val)) {
                    val = val.map(v => typeof v === 'object' && v !== null && v.name ? v.name : v).join(", ");
                }
                if (val === null || val === undefined) val = "";
                val = String(val).toLowerCase();
                const search = f.value.toLowerCase();
                
                switch (f.operator) {
                    case "equals": return val === search;
                    case "not_equals": return val !== search;
                    case "contains": return val.includes(search);
                    case "starts_with": return val.startsWith(search);
                    default: return true;
                }
            });
        });
    }, [data, filters]);

    const appliedFilters = filters.filter(f => f.column && f.operator && f.value);

    return { 
        filteredData, 
        filters, 
        setFilters,
        appliedFilterCount: appliedFilters.length
    };
}
