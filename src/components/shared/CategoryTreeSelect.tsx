
"use client";

import React, { useState, useEffect } from 'react';
import type { CategoryTreeDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CategoryTreeSelectProps {
  treeData: CategoryTreeDto[];
  value?: number;
  onChange: (categoryId?: number, categoryName?: string) => void;
  placeholder?: string;
  className?: string;
}

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

// Recursive component to render the category list
const RenderCategoryList: React.FC<{
  categories: CategoryTreeDto[];
  onSelect: (category: CategoryTreeDto) => void;
  selectedValue?: number;
  level?: number;
}> = ({ categories, onSelect, selectedValue, level = 0 }) => {
  return (
    <>
      {categories.map((category) => {
        const isSelected = category.id === selectedValue;
        const hasChildren = category.children && category.children.length > 0;
        
        // Calculate indentation style
        const indentationStyle = { paddingLeft: `${level * 1.25}rem` };

        return (
          <React.Fragment key={category.id}>
            <div
              onClick={() => onSelect(category)}
              className={cn(
                "flex items-center justify-between w-full text-sm px-3 py-2 cursor-pointer hover:bg-accent/50 rounded-md truncate",
                isSelected && "bg-accent text-accent-foreground font-semibold"
              )}
              style={indentationStyle}
            >
              <span>{category.name}</span>
              {isSelected && <Check className="h-4 w-4 ml-auto shrink-0" />}
            </div>
            {hasChildren && (
              <RenderCategoryList
                categories={category.children}
                onSelect={onSelect}
                selectedValue={selectedValue}
                level={level + 1}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};


export default function CategoryTreeSelect({
  treeData,
  value,
  onChange,
  placeholder = "Выберите категорию",
  className,
}: CategoryTreeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (value !== undefined && value !== null && treeData.length > 0) {
      const selectedCat = findCategoryInTree(treeData, value);
      setSelectedCategoryName(selectedCat?.name);
    } else {
      setSelectedCategoryName(undefined);
    }
  }, [value, treeData]);

  const handleSelect = (category: CategoryTreeDto) => {
    onChange(category.id, category.name);
    setSelectedCategoryName(category.name);
    setIsOpen(false);
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined, undefined);
    setSelectedCategoryName(undefined);
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
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <ScrollArea className="max-h-72">
           <div className="p-1">
             <div
                onClick={handleClear}
                className={cn(
                  "flex items-center justify-between w-full text-sm px-3 py-2 cursor-pointer hover:bg-accent/50 rounded-md text-muted-foreground",
                  (value === undefined || value === null) && "bg-accent text-accent-foreground font-semibold"
                )}
              >
                <span>{placeholder}</span>
                 {(value === undefined || value === null) && <Check className="h-4 w-4 ml-auto shrink-0" />}
              </div>
            <RenderCategoryList
              categories={treeData}
              onSelect={handleSelect}
              selectedValue={value}
            />
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
