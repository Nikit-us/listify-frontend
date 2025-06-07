
"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CityDto, CategoryDto } from '@/types/api';
import { getCities, getCategories } from '@/lib/mockApi';
import { Filter, X } from 'lucide-react';

export interface Filters {
  keyword?: string;
  cityId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface AdFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Filters;
}

export default function AdFilters({ onFilterChange, initialFilters = {} }: AdFiltersProps) {
  const [keyword, setKeyword] = useState(initialFilters.keyword || '');
  const [cityId, setCityId] = useState<string | undefined>(initialFilters.cityId?.toString());
  const [categoryId, setCategoryId] = useState<string | undefined>(initialFilters.categoryId?.toString());
  const [minPrice, setMinPrice] = useState<string>(initialFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters.maxPrice?.toString() || '');

  const [cities, setCities] = useState<CityDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [citiesData, categoriesData] = await Promise.all([
          getCities(),
          getCategories(),
        ]);
        setCities(citiesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load filter options:", error);
      }
    };
    fetchDropdownData();
  }, []);

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    onFilterChange({
      keyword: keyword || undefined,
      cityId: cityId ? parseInt(cityId) : undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setCityId(undefined);
    setCategoryId(undefined);
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({});
  };

  return (
    <Card className="mb-8 shadow-sm sticky top-[calc(3.5rem+1px)] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="pb-4 pt-4">
        <CardTitle className="text-xl flex items-center">
          <Filter className="mr-2 h-5 w-5" /> Фильтры
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
          <div className="xl:col-span-2">
            <label htmlFor="keyword" className="block text-sm font-medium text-foreground mb-1">Ключевое слово</label>
            <Input
              id="keyword"
              placeholder="Например, iPhone 13 Pro"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Категория</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все категории</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">Город</label>
            <Select value={cityId} onValueChange={setCityId}>
              <SelectTrigger id="city">
                <SelectValue placeholder="Все города" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="">Все города</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-foreground mb-1">Цена от</label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-foreground mb-1">Цена до</label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Применить</Button>
            <Button type="button" variant="outline" onClick={handleReset} className="w-auto" aria-label="Сбросить фильтры">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
