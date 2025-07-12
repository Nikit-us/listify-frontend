
"use client";

import React, { useState, useEffect } from 'react';
import type { CategoryTreeDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronDown, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CategoryTreeSelectProps {
  treeData: CategoryTreeDto[];
  value?: number; // selected category ID
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

const RenderCategoryNode: React.FC<{
  category: CategoryTreeDto;
  onSelect: (category: CategoryTreeDto) => void;
  level: number;
  selectedValue?: number;
}> = ({ category, onSelect, level, selectedValue }) => {
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = category.id === selectedValue;

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onSelect(category);
  };

  const basePaddingClass = 'px-2'; 
  const indentationClass = level === 0 ? '' : `pl-${(level * 2) + 2}`; 

  if (hasChildren) {
    return (
      <AccordionItem value={category.id.toString()} className="border-none">
        <div className="flex items-center w-full">
          <AccordionTrigger
            className={cn(
              "flex-1 py-2 text-sm hover:bg-accent rounded-md data-[state=open]:bg-accent/50 text-left",
              basePaddingClass,
              indentationClass,
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{category.name}</span>
            </div>
          </AccordionTrigger>
        </div>
        <AccordionContent className="pb-0">
          <div className={cn("space-y-0.5")}>
             <div
                onClick={handleCategoryClick}
                className={cn(
                  "flex items-center justify-between py-2 text-sm cursor-pointer hover:bg-accent rounded-md",
                  basePaddingClass, 
                  `pl-${((level +1) * 2)}`,
                  isSelected && "bg-accent font-semibold"
                )}
              >
                <span className="truncate font-medium">{category.name} (выбрать)</span>
                {isSelected && <Check className="h-4 w-4 ml-2 text-primary shrink-0" />}
              </div>
            {category.children?.map((child) => (
              <RenderCategoryNode
                key={child.id}
                category={child}
                onSelect={onSelect}
                level={level + 1}
                selectedValue={selectedValue}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <div
      onClick={handleCategoryClick}
      className={cn(
        "flex items-center justify-between py-2 text-sm cursor-pointer hover:bg-accent rounded-md",
        basePaddingClass,
        indentationClass,
        isSelected && "bg-accent font-semibold"
      )}
    >
      <span className="truncate">{category.name}</span>
      {isSelected && <Check className="h-4 w-4 ml-2 text-primary shrink-0" />}
    </div>
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
  };


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild className={className}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between text-sm"
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
                  "flex items-center justify-between py-2 px-2 text-sm cursor-pointer hover:bg-accent rounded-md text-muted-foreground",
                  (value === undefined || value === null) && "bg-accent font-semibold text-accent-foreground"
                )}
              >
                <span>{placeholder}</span>
                 {(value === undefined || value === null) && <Check className="h-4 w-4 ml-2 text-primary shrink-0" />}
              </div>
            <Accordion type="multiple" className="w-full">
              {treeData.map((category) => (
                <RenderCategoryNode
                  key={category.id}
                  category={category}
                  onSelect={handleSelect}
                  level={0}
                  selectedValue={value}
                />
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
