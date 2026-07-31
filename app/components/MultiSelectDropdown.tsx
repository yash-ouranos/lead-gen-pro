"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Checkmark } from "@carbon/icons-react";

interface MultiSelectDropdownProps {
  options: { id: string; name: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectDropdown({ options, selectedIds, onChange, placeholder = "Select options" }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(item => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
    inputRef.current?.focus();
  };

  const selectedNames = options.filter(o => selectedIds.includes(o.id)).map(o => o.name);

  const filteredOptions = useMemo(() => {
    return options.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  return (
    <div className="relative" ref={ref}>
      <div 
        className="w-full px-4 py-2.5 bg-muted border-0 border-b border-border outline-none focus-within:border-primary focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary transition-all text-foreground text-sm shadow-sm flex justify-between items-center cursor-text"
        onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
      >
        <div className="flex-1 overflow-hidden flex items-center relative">
          <input
            ref={inputRef}
            type="text"
            className={`w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 ${!isOpen && selectedNames.length > 0 ? 'opacity-0 absolute inset-0' : 'opacity-100'}`}
            placeholder={selectedNames.length > 0 && !isOpen ? "" : placeholder}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
          />
          {(!isOpen && selectedNames.length > 0) && (
            <span className="truncate w-full block pointer-events-none">{selectedNames.join(", ")}</span>
          )}
        </div>
        <div 
          className="pl-2 cursor-pointer flex items-center justify-center" 
          onClick={(e) => { 
            e.stopPropagation(); 
            setIsOpen(!isOpen); 
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 0);
            } else {
              setSearchTerm("");
            }
          }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-popover border border-border shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No options found</div>
          ) : (
            filteredOptions.map(option => {
              const isSelected = selectedIds.includes(option.id);
              return (
                <div 
                  key={option.id}
                  className="px-3 py-2 text-sm flex items-center cursor-pointer hover:bg-muted text-popover-foreground transition-colors"
                  onClick={(e) => { e.stopPropagation(); toggleOption(option.id); }}
                >
                  <div className={`w-4 h-4 mr-2 border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}`}>
                    {isSelected && <Checkmark className="w-3 h-3" />}
                  </div>
                  {option.name}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
