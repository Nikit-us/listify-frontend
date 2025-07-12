
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryTreeSelect from '@/components/shared/CategoryTreeSelect';
import type { RegionDto, DistrictDto, CityDto, CategoryTreeDto } from '@/types/api';
import {
  getRegions,
  getDistrictsByRegion,
  getCitiesByDistrict,
  getCategoriesAsTree
} from '@/lib/mockApi';
import { Filter, X } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export interface Filters {
  keyword?: string;
  regionId?: number;
  districtId?: number;
  cityId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface AdFiltersProps {
  onFilterChange: (filters: Filters) => void;
  initialFilters?: Filters;
}

const ALL_ITEMS_SENTINEL_VALUE = "ALL_ITEMS_VALUE";

export default function AdFilters({ onFilterChange, initialFilters = {} }: AdFiltersProps) {
  const [keyword, setKeyword] = useState(initialFilters.keyword || '');

  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>(initialFilters.regionId?.toString());
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | undefined>(initialFilters.districtId?.toString());
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(initialFilters.cityId?.toString());

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(initialFilters.categoryId);

  const [minPrice, setMinPrice] = useState<string>(initialFilters.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters.maxPrice?.toString() || '');

  const [categoriesTree, setCategoriesTree] = useState<CategoryTreeDto[]>([]);
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [cities, setCities] = useState<CityDto[]>([]);

  const [isLocationDataLoading, setIsLocationDataLoading] = useState(false);
  const [isCategoryDataLoading, setIsCategoryDataLoading] = useState(true);
  const [isBaseDataLoading, setIsBaseDataLoading] = useState(true);


  useEffect(() => {
    setKeyword(initialFilters.keyword || '');
    setSelectedRegionId(initialFilters.regionId?.toString());
    setSelectedDistrictId(initialFilters.districtId?.toString());
    setSelectedCityId(initialFilters.cityId?.toString());
    setSelectedCategoryId(initialFilters.categoryId);
    setMinPrice(initialFilters.minPrice?.toString() || '');
    setMaxPrice(initialFilters.maxPrice?.toString() || '');
  }, [initialFilters]);


  useEffect(() => {
    const fetchInitialData = async () => {
      setIsBaseDataLoading(true);
      setIsCategoryDataLoading(true);
      setIsLocationDataLoading(true);

      try {
        const [categoriesData, regionsData] = await Promise.all([
          getCategoriesAsTree().finally(() => setIsCategoryDataLoading(false)),
          getRegions()
        ]);
        setCategoriesTree(categoriesData);
        setRegions(regionsData);

        if (initialFilters.regionId) {
          const regionIdStr = initialFilters.regionId.toString();
          const districtsData = await getDistrictsByRegion(parseInt(regionIdStr));
          setDistricts(districtsData);

          if (initialFilters.districtId) {
            const districtIdStr = initialFilters.districtId.toString();
            const districtExistsInFetched = districtsData.some(d => d.id.toString() === districtIdStr);
            if (districtExistsInFetched) {
              const citiesData = await getCitiesByDistrict(parseInt(districtIdStr));
              setCities(citiesData);
            } else {
              setSelectedDistrictId(undefined);
              setSelectedCityId(undefined);
              setCities([]);
            }
          } else {
            setSelectedCityId(undefined);
            setCities([]);
          }
        } else {
          setSelectedDistrictId(undefined);
          setSelectedCityId(undefined);
          setDistricts([]);
          setCities([]);
        }
      } catch (error) {
        console.error("Failed to load filter options:", error);
        setCategoriesTree([]);
        setRegions([]);
        setDistricts([]);
        setCities([]);
      } finally {
        setIsLocationDataLoading(false);
        setIsBaseDataLoading(false);
      }
    };
    fetchInitialData();
  }, [initialFilters]);


  const handleRegionChange = useCallback(async (newRegionIdValue?: string) => {
    const newRegionId = newRegionIdValue === ALL_ITEMS_SENTINEL_VALUE ? undefined : newRegionIdValue;
    setSelectedRegionId(newRegionId);
    setSelectedDistrictId(undefined);
    setSelectedCityId(undefined);
    setDistricts([]);
    setCities([]);
    if (newRegionId) {
      setIsLocationDataLoading(true);
      try {
        setDistricts(await getDistrictsByRegion(parseInt(newRegionId)));
      } catch (error) {
        console.error("Failed to load districts:", error);
        setDistricts([]);
      } finally {
        setIsLocationDataLoading(false);
      }
    }
  }, []);

  const handleDistrictChange = useCallback(async (newDistrictIdValue?: string) => {
    const newDistrictId = newDistrictIdValue === ALL_ITEMS_SENTINEL_VALUE ? undefined : newDistrictIdValue;
    setSelectedDistrictId(newDistrictId);
    setSelectedCityId(undefined);
    setCities([]);
    if (newDistrictId) {
      setIsLocationDataLoading(true);
      try {
        setCities(await getCitiesByDistrict(parseInt(newDistrictId)));
      } catch (error) {
        console.error("Failed to load cities:", error);
        setCities([]);
      } finally {
        setIsLocationDataLoading(false);
      }
    }
  }, []);

  const handleCityChange = (newCityIdValue?: string) => {
    const newCityId = newCityIdValue === ALL_ITEMS_SENTINEL_VALUE ? undefined : newCityIdValue;
    setSelectedCityId(newCityId);
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    onFilterChange({
      keyword: keyword || undefined,
      regionId: selectedRegionId ? parseInt(selectedRegionId) : undefined,
      districtId: selectedDistrictId ? parseInt(selectedDistrictId) : undefined,
      cityId: selectedCityId ? parseInt(selectedCityId) : undefined,
      categoryId: selectedCategoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  };

  const handleReset = () => {
    onFilterChange({});
  };

  if (isBaseDataLoading) {
    return (
      <Card className="mb-8 shadow-sm">
        <CardHeader className="pb-4 pt-4">
          <CardTitle className="text-xl flex items-center"><Filter className="mr-2 h-5 w-5" /> Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10"><LoadingSpinner size={32} /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm z-10 bg-background/90 mb-8">
      <CardHeader className="pb-4 pt-4">
        <CardTitle className="text-xl flex items-center">
          <Filter className="mr-2 h-5 w-5" /> Фильтры
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
            <label htmlFor="keyword" className="block text-sm font-medium text-foreground mb-1">Ключевое слово</label>
            <Input
              id="keyword"
              placeholder="Например, iPhone 13 Pro"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          
          <div className="lg:col-span-1 xl:col-span-2">
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Категория</label>
            {isCategoryDataLoading ? <LoadingSpinner size={20}/> : (
              <CategoryTreeSelect
                treeData={categoriesTree}
                value={selectedCategoryId}
                onChange={(id) => setSelectedCategoryId(id)}
                placeholder="Все категории"
              />
            )}
          </div>

          <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-foreground mb-1">Область</label>
              <Select
                value={selectedRegionId === undefined ? ALL_ITEMS_SENTINEL_VALUE : selectedRegionId}
                onValueChange={handleRegionChange}
                disabled={isLocationDataLoading && !selectedRegionId}
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
                value={selectedDistrictId === undefined ? ALL_ITEMS_SENTINEL_VALUE : selectedDistrictId}
                onValueChange={handleDistrictChange}
                disabled={isLocationDataLoading || !selectedRegionId || (districts.length === 0 && !!selectedRegionId) }
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
                value={selectedCityId === undefined ? ALL_ITEMS_SENTINEL_VALUE : selectedCityId}
                onValueChange={handleCityChange}
                disabled={isLocationDataLoading || !selectedDistrictId || (cities.length === 0 && !!selectedDistrictId)}
              >
                <SelectTrigger id="city"><SelectValue placeholder="Все города" /></SelectTrigger>
                <SelectContent>
                   <SelectItem value={ALL_ITEMS_SENTINEL_VALUE}>Все города</SelectItem>
                  {cities.map(city => <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

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

          <div className="flex flex-col sm:flex-row xl:flex-col gap-2 md:col-span-2 lg:col-span-1">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              Применить
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="w-full" aria-label="Сбросить фильтры">
              <X className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Сбросить</span>
              <span className="sm:hidden">Сброс</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
