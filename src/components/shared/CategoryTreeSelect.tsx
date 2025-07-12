
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { CategoryTreeDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogOverlay,
  DialogClose
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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

const ChildCategoryList: React.FC<{
  categories: CategoryTreeDto[];
  onSelect: (category: CategoryTreeDto) => void;
  selectedValue?: number;
  level?: number;
}> = ({ categories, onSelect, selectedValue, level = 0 }) => {
  return (
    <>
      {categories.map((category) => {
        const isSelected = category.id === selectedValue;
        const indentationStyle = { paddingLeft: `${level * 1.5}rem` };

        return (
          <DialogClose asChild key={category.id}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(category);
                }}
                className={cn(
                  "flex items-center justify-between w-full text-sm px-3 py-2 cursor-pointer hover:bg-muted/50 rounded-md truncate",
                  isSelected && "bg-accent text-accent-foreground font-semibold"
                )}
                style={indentationStyle}
              >
                <span className="truncate">{category.name}</span>
                {isSelected && <Check className="h-4 w-4 ml-auto shrink-0" />}
              </div>
          </DialogClose>
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const selectedCat = findCategoryInTree(treeData, value);
    setSelectedCategoryName(selectedCat?.name);
  }, [value, treeData]);

  const handleSelect = (category: CategoryTreeDto) => {
    onChange(category.id, category.name);
    setIsOpen(false);
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined, undefined);
    setIsOpen(false);
  };
  
  const updateDialogPosition = () => {
    if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setDialogPosition({
            top: rect.bottom + window.scrollY + 8, // 8px offset
            left: rect.left + window.scrollX,
            width: rect.width,
        });
    }
  };

  const handleOpenChange = (open: boolean) => {
      if(open) {
          updateDialogPosition();
      }
      setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className={className} ref={triggerRef}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{selectedCategoryName || placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
       <DialogOverlay className="bg-transparent" />
      <DialogContent
        style={{
            top: `${dialogPosition.top}px`,
            left: `${dialogPosition.left}px`,
            width: `${dialogPosition.width}px`,
            transform: 'none', // Override default centering
        }}
        className="p-0 rounded-md border shadow-md w-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ScrollArea className="max-h-[60vh]">
          <div className="p-1">
            <DialogClose asChild>
                <div
                onClick={handleClear}
                className={cn(
                    "flex items-center justify-between w-full text-sm px-3 py-2 cursor-pointer hover:bg-muted/50 rounded-md text-muted-foreground",
                    (value === undefined || value === null) && "bg-accent text-accent-foreground font-semibold"
                )}
                >
                <span>{placeholder}</span>
                {(value === undefined || value === null) && <Check className="h-4 w-4 ml-auto shrink-0" />}
                </div>
            </DialogClose>

            <Accordion type="single" collapsible className="w-full">
              {treeData.map((category) => {
                 const isSelected = category.id === value;
                 const hasChildren = category.children && category.children.length > 0;

                 return (
                  <AccordionItem value={`item-${category.id}`} key={category.id} className="border-b-0">
                     <AccordionTrigger
                       onClick={(e) => {
                         if (!hasChildren) {
                           e.preventDefault();
                           handleSelect(category);
                           setIsOpen(false);
                         }
                       }}
                       className={cn(
                        "flex items-center justify-between w-full text-sm px-3 py-2 cursor-pointer hover:bg-muted/50 rounded-md truncate font-normal",
                        !hasChildren && "hover:bg-muted/50 [&>svg.accordion-chevron]:hidden",
                        isSelected && "bg-accent text-accent-foreground font-semibold"
                       )}
                     >
                        <span className="truncate">{category.name}</span>
                        {isSelected && !hasChildren && (
                            <DialogClose asChild>
                                <Check className="h-4 w-4 ml-auto shrink-0" />
                            </DialogClose>
                        )}
                     </AccordionTrigger>
                     {hasChildren && (
                       <AccordionContent className="pt-0 pb-1">
                          <ChildCategoryList
                            categories={category.children}
                            onSelect={handleSelect}
                            selectedValue={value}
                            level={1}
                          />
                       </AccordionContent>
                     )}
                  </AccordionItem>
                 )
              })}
            </Accordion>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
