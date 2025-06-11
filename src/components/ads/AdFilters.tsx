
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryTreeSelect from '@/components/shared/CategoryTreeSelect'; // Added
import type { RegionDto, DistrictDto, CityDto, CategoryTreeDto } from '@/types/api'; // Updated
import { 
  getRegions, 
  getDistrictsByRegion, 
  getCitiesByDistrict, 
  getCategoriesAsTree // Added
} from '@/lib/mockApi';
import { Filter, X } from 'lucide-react';

export interface Filters {
  keyword?: string;
  regionId?: number; // Added
  districtId?: number; // Added
  cityId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface AdFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Filters;
}

const ALL_ITEMS_SENTINEL_VALUE = "ALL_ITEMS_VALUE"; // Still used for locations if a level is not selected

export default function AdFilters({ onFilterChange, initialFilters = {} }: AdFiltersProps) {
  const [keyword, setKeyword] = useState(initialFilters.keyword || '');
  
  const [regionId, setRegionId] = useState<string | undefined>(initialFilters.regionId?.toString());
  const [districtId, setDistrictId] = useState<string | undefined>(initialFilters.districtId?.toString());
  const [cityId, setCityId] = useState<string | undefined>(initialFilters.cityId?.toString());
  
  const [categoryId, setCategoryId] = useState<number | undefined>(initialFilters.categoryId);
  
  const [minPrice, setMinPrice] = useState<string>(initialFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters.maxPrice?.toString() || '');

  const [categoriesTree, setCategoriesTree] = useState<CategoryTreeDto[]>([]);
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [cities, setCities] = useState<CityDto[]>([]);
  
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsDataLoading(true);
      try {
        const [categoriesData, regionsData] = await Promise.all([
          getCategoriesAsTree(),
          getRegions(),
        ]);
        setCategoriesTree(categoriesData);
        setRegions(regionsData);

        // Pre-load districts if regionId is present in initialFilters
        if (initialFilters.regionId) {
            const districtsData = await getDistrictsByRegion(initialFilters.regionId);
            setDistricts(districtsData);
            // Pre-load cities if districtId is also present
            if (initialFilters.districtId) {
                const citiesData = await getCitiesByDistrict(initialFilters.districtId);
                setCities(citiesData);
            }
        }

      } catch (error) {
        console.error("Failed to load filter options:", error);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchDropdownData();
  }, [initialFilters.regionId, initialFilters.districtId]); // Add dependencies for pre-loading

  const handleRegionChange = useCallback(async (newRegionId?: string) => {
    setRegionId(newRegionId);
    setDistrictId(undefined); // Reset district and city
    setCityId(undefined);
    setDistricts([]);
    setCities([]);
    if (newRegionId && newRegionId !== ALL_ITEMS_SENTINEL_VALUE) {
      try {
        setDistricts(await getDistrictsByRegion(parseInt(newRegionId)));
      } catch (error) { console.error("Failed to load districts:", error); }
    }
  }, []);

  const handleDistrictChange = useCallback(async (newDistrictId?: string) => {
    setDistrictId(newDistrictId);
    setCityId(undefined); // Reset city
    setCities([]);
    if (newDistrictId && newDistrictId !== ALL_ITEMS_SENTINEL_VALUE) {
      try {
        setCities(await getCitiesByDistrict(parseInt(newDistrictId)));
      } catch (error) { console.error("Failed to load cities:", error); }
    }
  }, []);


  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    onFilterChange({
      keyword: keyword || undefined,
      regionId: regionId && regionId !== ALL_ITEMS_SENTINEL_VALUE ? parseInt(regionId) : undefined,
      districtId: districtId && districtId !== ALL_ITEMS_SENTINEL_VALUE ? parseInt(districtId) : undefined,
      cityId: cityId && cityId !== ALL_ITEMS_SENTINEL_VALUE ? parseInt(cityId) : undefined,
      categoryId: categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setRegionId(undefined);
    setDistrictId(undefined);
    setCityId(undefined);
    setCategoryId(undefined);
    setMinPrice('');
    setMaxPrice('');
    setDistricts([]); // Clear dependent dropdowns
    setCities([]);
    onFilterChange({});
  };

  if (isDataLoading) {
    return (
      <Card className="mb-8 shadow-sm">
        <CardHeader className="pb-4 pt-4">
          <CardTitle className="text-xl flex items-center"><Filter className="mr-2 h-5 w-5" /> Фильтры</CardTitle>
        </CardHeader>
        <CardContent><LoadingSpinner /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 shadow-sm z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[70px]">
      <CardHeader className="pb-4 pt-4">
        <CardTitle className="text-xl flex items-center">
          <Filter className="mr-2 h-5 w-5" /> Фильтры
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 items-end">
          <div className="xl:col-span-2">
            <label htmlFor="keyword" className="block text-sm font-medium text-foreground mb-1">Ключевое слово</label>
            <Input
              id="keyword"
              placeholder="Например, iPhone 13 Pro"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="lg:col-span-1">
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Категория</label>
             <CategoryTreeSelect
                treeData={categoriesTree}
                value={categoryId}
                onChange={(id) => setCategoryId(id)}
                placeholder="Все категории"
              />
          </div>
          
          {/* Location selectors */}
          <div>
            <label htmlFor="region" className="block text-sm font-medium text-foreground mb-1">Область</label>
            <Select
              value={regionId === undefined ? ALL_ITEMS_SENTINEL_VALUE : regionId}
              onValueChange={handleRegionChange}
            >
              <SelectTrigger id="region"><SelectValue placeholder="Все области" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ITEMS_SENTINEL_VALUE}>Все области</SelectItem>
                {regions.map(reg => <SelectItem key={reg.id} value={reg.id.toString()}>{reg.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-foreground mb-1">Район</label>
            <Select
              value={districtId === undefined ? ALL_ITEMS_SENTINEL_VALUE : districtId}
              onValueChange={handleDistrictChange}
              disabled={!regionId || regionId === ALL_ITEMS_SENTINEL_VALUE || districts.length === 0}
            >
              <SelectTrigger id="district"><SelectValue placeholder="Все районы" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ITEMS_SENTINEL_VALUE}>Все районы</SelectItem>
                {districts.map(dist => <SelectItem key={dist.id} value={dist.id.toString()}>{dist.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">Город</label>
            <Select
              value={cityId === undefined ? ALL_ITEMS_SENTINEL_VALUE : cityId}
              onValueChange={(value) => setCityId(value === ALL_ITEMS_SENTINEL_VALUE ? undefined : value)}
              disabled={!districtId || districtId === ALL_ITEMS_SENTINEL_VALUE || cities.length === 0}
            >
              <SelectTrigger id="city"><SelectValue placeholder="Все города" /></SelectTrigger>
              <SelectContent>
                 <SelectItem value={ALL_ITEMS_SENTINEL_VALUE}>Все города</SelectItem>
                {cities.map(city => <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* End Location selectors */}

          <div className="grid grid-cols-2 gap-2 items-end">
            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-foreground mb-1">Цена от</label>
              <Input id="minPrice" type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} min="0"/>
            </div>
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-foreground mb-1">Цена до</label>
              <Input id="maxPrice" type="number" placeholder="10000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min="0"/>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row xl:flex-col gap-2 xl:col-start-7 mt-2 sm:mt-0 md:mt-5">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              Применить
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="w-full" aria-label="Сбросить фильтры">
              <X className="h-4 w-4 sm:mr-2" />
              <span className="">Сбросить</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

