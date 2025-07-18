
"use client";

import React, { useState, useEffect } from 'react';
import type { CategoryTreeDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Helper Functions to find category and its path in the tree ---

const findCategoryInTree = (
  categories: CategoryTreeDto[],
  categoryId?: number
): CategoryTreeDto | null => {
  if (categoryId === undefined || categoryId === null) return null;
  for (const category of categories) {
    if (category.id === categoryId) {
      return category;
    }
    if (category.children && category.children.length > 0) {
      const found = findCategoryInTree(category.children, categoryId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

const findCategoryPath = (
  categories: CategoryTreeDto[],
  categoryId?: number
): number[] => {
  if (categoryId === undefined || categoryId === null) return [];
  for (const category of categories) {
    if (category.id === categoryId) {
      return [category.id];
    }
    if (category.children && category.children.length > 0) {
      const path = findCategoryPath(category.children, categoryId);
      if (path.length > 0) {
        return [category.id, ...path];
      }
    }
  }
  return [];
};


// --- Recursive Category Node Component for Accordion ---

const CategoryNode: React.FC<{
  category: CategoryTreeDto;
  onSelect: (category: CategoryTreeDto) => void;
  selectedValue?: number;
}> = ({ category, onSelect, selectedValue }) => {
  const isSelected = category.id === selectedValue;
  const hasChildren = category.children && category.children.length > 0;

  if (hasChildren) {
    return (
      <AccordionItem value={category.id.toString()} className="border-b-0">
        <AccordionTrigger className="py-2 px-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm">
          {category.name}
        </AccordionTrigger>
        <AccordionContent className="pl-4 pb-0">
           <div className="flex flex-col space-y-1">
            {category.children.map(child => (
              <CategoryNode key={child.id} category={child} onSelect={onSelect} selectedValue={selectedValue} />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start font-normal h-auto py-2 px-2 text-sm",
        isSelected && "bg-accent text-accent-foreground"
      )}
      onClick={() => onSelect(category)}
    >
      <span className="truncate">{category.name}</span>
       {isSelected && <Check className="h-4 w-4 ml-auto shrink-0" />}
    </Button>
  );
};


// --- Main CategoryTreeSelect Component ---

export default function CategoryTreeSelect({
  treeData,
  value,
  onChange,
  placeholder = "Выберите категорию",
  className,
}: {
  treeData: CategoryTreeDto[];
  value?: number;
  onChange: (categoryId?: number, categoryName?: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | undefined>(undefined);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  
  useEffect(() => {
    const selectedCat = findCategoryInTree(treeData, value);
    setSelectedCategoryName(selectedCat?.name);
    if (selectedCat) {
      const path = findCategoryPath(treeData, value);
      setOpenAccordionItems(path.map(id => id.toString()));
    } else {
      setOpenAccordionItems([]);
    }
  }, [value, treeData]);

  const handleSelect = (category: CategoryTreeDto) => {
    onChange(category.id, category.name);
    setIsOpen(false);
  };
  
  const handleClear = () => {
    onChange(undefined, undefined);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild className={className}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{selectedCategoryName || placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-2 overflow-y-auto max-h-72" // This ensures scrolling
        side="bottom"
        align="start"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        onWheel={(e) => e.stopPropagation()} // Stop page scroll when scrolling the list
      >
          <Button
              variant="ghost"
              onClick={handleClear}
              className={cn(
                "w-full justify-start font-normal h-auto py-2 px-2 text-sm mb-1",
                (value === undefined || value === null) && "bg-accent text-accent-foreground"
              )}
          >
              {placeholder}
              {(value === undefined || value === null) && <Check className="h-4 w-4 ml-auto" />}
          </Button>
          <Accordion
              type="multiple"
              value={openAccordionItems}
              onValueChange={setOpenAccordionItems}
              className="w-full"
          >
          {treeData.map(category => (
              <CategoryNode key={category.id} category={category} onSelect={handleSelect} selectedValue={value} />
          ))}
          </Accordion>
      </PopoverContent>
    </Popover>
  );
}
