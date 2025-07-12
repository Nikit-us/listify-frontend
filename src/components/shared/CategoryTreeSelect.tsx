
"use client";

import React, { useState, useEffect } from 'react';
import type { CategoryTreeDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Check } from 'lucide-react';
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

const CategorySubMenu: React.FC<{
  categories: CategoryTreeDto[];
  onSelect: (category: CategoryTreeDto) => void;
  selectedValue?: number;
}> = ({ categories, onSelect, selectedValue }) => {
  return (
    <>
      {categories.map((category) => {
        const isSelected = category.id === selectedValue;
        const hasChildren = category.children && category.children.length > 0;

        if (hasChildren) {
          return (
            <DropdownMenuSub key={category.id}>
              <DropdownMenuSubTrigger>
                <span className="truncate">{category.name}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <ScrollArea className="max-h-72">
                    <CategorySubMenu
                      categories={category.children}
                      onSelect={onSelect}
                      selectedValue={selectedValue}
                    />
                  </ScrollArea>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
        }

        return (
          <DropdownMenuItem
            key={category.id}
            onClick={() => onSelect(category)}
            className={cn(isSelected && "bg-accent text-accent-foreground")}
          >
            <span className="truncate">{category.name}</span>
             {isSelected && <Check className="h-4 w-4 ml-auto shrink-0" />}
          </DropdownMenuItem>
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
    const selectedCat = findCategoryInTree(treeData, value);
    setSelectedCategoryName(selectedCat?.name);
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild className={className}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{selectedCategoryName || placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] p-0" align="start">
        <ScrollArea className="max-h-72">
            <DropdownMenuItem
              onClick={handleClear}
              className={cn((value === undefined || value === null) && "bg-accent text-accent-foreground")}
            >
              <span className="truncate">{placeholder}</span>
              {(value === undefined || value === null) && <Check className="h-4 w-4 ml-auto shrink-0" />}
            </DropdownMenuItem>
            <CategorySubMenu
              categories={treeData}
              onSelect={handleSelect}
              selectedValue={value}
            />
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
