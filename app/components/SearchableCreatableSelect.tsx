"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Add } from "@carbon/icons-react";

interface Option {
  id: string;
  name: string;
}

interface SearchableCreatableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onCreate?: (inputValue: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function SearchableCreatableSelect({
  options,
  value,
  onChange,
  onCreate,
  placeholder = "Select...",
  className = "",
  disabled = false,
}: SearchableCreatableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch(""); // Reset search when closing
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = options.some(opt => opt.name.toLowerCase() === search.trim().toLowerCase());

  const handleCreate = async () => {
    if (!search.trim() || !onCreate || isCreating) return;
    setIsCreating(true);
    try {
      await onCreate(search.trim());
      onChange(search.trim());
      setIsOpen(false);
      setSearch("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div 
        className={`w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus-within:ring-2 focus-within:ring-inset focus-within:border-primary focus-within:ring-primary transition-all text-foreground text-sm flex items-center justify-between cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'border-border'}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 10);
            }
          }
        }}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border shadow-lg rounded-md overflow-hidden max-h-60 flex flex-col">
          <div className="p-2 border-b border-border">
            <input 
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or type to add..."
              className="w-full px-3 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <ul className="overflow-y-auto flex-1 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li 
                  key={opt.id}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-muted ${value === opt.name ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}
                  onClick={() => {
                    onChange(opt.name);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  {opt.name}
                </li>
              ))
            ) : search.trim() && !exactMatch && !onCreate ? (
              <li className="px-4 py-2 text-sm text-muted-foreground text-center">No results found</li>
            ) : null}

            {search.trim() && !exactMatch && onCreate && (
              <li 
                className="px-4 py-2 text-sm cursor-pointer hover:bg-muted flex items-center gap-2 text-primary border-t border-border mt-1 pt-2"
                onClick={handleCreate}
              >
                <Add className="w-4 h-4" /> 
                {isCreating ? "Adding..." : `Add "${search.trim()}"`}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
