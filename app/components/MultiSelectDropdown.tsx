"use client";

import { useState, useRef, useEffect } from"react";
import { ChevronDown, Checkmark } from"@carbon/icons-react";

interface MultiSelectDropdownProps {
 options: { id: string; name: string }[];
 selectedIds: string[];
 onChange: (ids: string[]) => void;
 placeholder?: string;
}

export default function MultiSelectDropdown({ options, selectedIds, onChange, placeholder ="Select options"}: MultiSelectDropdownProps) {
 const [isOpen, setIsOpen] = useState(false);
 const ref = useRef<HTMLDivElement>(null);

 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (ref.current && !ref.current.contains(event.target as Node)) {
 setIsOpen(false);
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
 };

 const selectedNames = options.filter(o => selectedIds.includes(o.id)).map(o => o.name);

 return (
 <div className="relative"ref={ref}>
 <div 
 className="w-full px-4 py-2.5 bg-muted border-0 border-b border-border outline-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-all text-foreground text-sm shadow-sm flex justify-between items-center cursor-pointer"
 onClick={() => setIsOpen(!isOpen)}
 tabIndex={0}
 >
 <span className="truncate">
 {selectedNames.length > 0 ? selectedNames.join(",") : <span className="text-muted-foreground/60">{placeholder}</span>}
 </span>
 <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0"/>
 </div>

 {isOpen && (
 <div className="absolute z-10 w-full mt-1 bg-popover border border-border shadow-lg max-h-60 overflow-auto">
 {options.length === 0 ? (
 <div className="px-3 py-2 text-sm text-muted-foreground">No options available</div>
 ) : (
 options.map(option => {
 const isSelected = selectedIds.includes(option.id);
 return (
 <div 
 key={option.id}
 className="px-3 py-2 text-sm flex items-center cursor-pointer hover:bg-muted text-popover-foreground transition-colors"
 onClick={() => toggleOption(option.id)}
 >
 <div className={`w-4 h-4 mr-2 border flex items-center justify-center transition-colors ${isSelected ?'bg-primary border-primary text-primary-foreground':'border-input bg-background'}`}>
 {isSelected && <Checkmark className="w-3 h-3"/>}
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
