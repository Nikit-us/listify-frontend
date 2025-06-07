
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import AdCard from '@/components/ads/AdCard';
import AdFilters, { type Filters as AdFiltersType } from '@/components/ads/AdFilters';
import PaginationControls from '@/components/shared/PaginationControls';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import type { AdvertisementResponseDto, Page, AdvertisementSearchCriteriaDto } from '@/types/api';
import { searchAds } from '@/lib/mockApi'; // Changed from getAds to searchAds
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Info } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

const ADS_PER_PAGE = 12;

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const [adsPage, setAdsPage] = useState<Page<AdvertisementResponseDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentFilters, setCurrentFilters] = useState<AdFiltersType>(() => {
    const params = new URLSearchParams(searchParams.toString());
    return {
      keyword: params.get('keyword') || undefined,
      cityId: params.get('cityId') ? parseInt(params.get('cityId')!) : undefined,
      categoryId: params.get('categoryId') ? parseInt(params.get('categoryId')!) : undefined,
      minPrice: params.get('minPrice') ? parseFloat(params.get('minPrice')!) : undefined,
      maxPrice: params.get('maxPrice') ? parseFloat(params.get('maxPrice')!) : undefined,
      // condition and sellerId are not in AdFiltersType yet, but API supports them
    };
  });

  const currentPage = parseInt(searchParams.get('page') || '0', 10);

  const fetchAdvertisements = useCallback(async (page: number, filters: AdFiltersType, authToken?: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const searchCriteria: AdvertisementSearchCriteriaDto = {
        ...filters,
        page,
        size: ADS_PER_PAGE,
        sort: 'createdAt,desc', // Default sort or make it configurable
      };
      const data = await searchAds(searchCriteria, authToken); // Use searchAds
      setAdsPage(data);
    } catch (err) {
      setError((err as Error).message || 'Не удалось загрузить объявления. Попробуйте позже.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]); // Added token to dependency array as it's used in searchAds

  useEffect(() => {
    fetchAdvertisements(currentPage, currentFilters, token);
  }, [currentPage, currentFilters, fetchAdvertisements, token]);

  const handleFilterChange = (newFilters: AdFiltersType) => {
    setCurrentFilters(newFilters);
    updateURL(0, newFilters); 
  };

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, currentFilters);
  };

  const updateURL = (page: number, filters: AdFiltersType) => {
    const params = new URLSearchParams();
    if (page > 0) params.set('page', page.toString());
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.cityId) params.set('cityId', filters.cityId.toString());
    if (filters.categoryId) params.set('categoryId', filters.categoryId.toString());
    if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  
  return (
    <div>
      <AdFilters onFilterChange={handleFilterChange} initialFilters={currentFilters} />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {Array.from({ length: ADS_PER_PAGE }).map((_, index) => (
            <Card key={index} className="h-[350px] flex flex-col">
              <div className="aspect-video bg-muted animate-pulse rounded-t-lg"></div>
              <CardHeader className="p-4">
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-grow">
                <div className="h-5 w-1/2 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-4 w-full bg-muted animate-pulse rounded mb-1"></div>
                <div className="h-4 w-2/3 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
         <Alert variant="destructive" className="my-8">
          <Info className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && adsPage && adsPage.content.length === 0 && (
        <Alert className="my-8">
          <Info className="h-4 w-4" />
          <AlertTitle>Объявления не найдены</AlertTitle>
          <AlertDescription>По вашему запросу ничего не найдено. Попробуйте изменить фильтры.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && adsPage && adsPage.content.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {adsPage.content.map(ad => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
          {adsPage.totalPages > 1 && (
            <PaginationControls
              currentPage={adsPage.number}
              totalPages={adsPage.totalPages}
              onPageChange={handlePageChange}
              hasNextPage={adsPage.number < adsPage.totalPages - 1}
              hasPrevPage={adsPage.number > 0}
            />
          )}
        </>
      )}
    </div>
  );
}
