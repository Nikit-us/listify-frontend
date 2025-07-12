
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Edit, Mail, Phone, MapPin, CalendarCheck2, PackageSearch, Settings, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { AdvertisementResponseDto, PageResponseDto, AdvertisementSearchCriteriaDto } from '@/types/api';
import { searchAds } from '@/lib/mockApi';
import AdCard from '@/components/ads/AdCard';
import PaginationControls from '@/components/shared/PaginationControls';

const ADS_PER_PAGE = 8;

function UserAdsSection({ userId }: { userId: number }) {
  const [adsPage, setAdsPage] = useState<PageResponseDto<AdvertisementResponseDto> | null>(null);
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  const [adsError, setAdsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { token } = useAuth();

  const fetchUserAdvertisements = useCallback(async (page: number) => {
    setIsLoadingAds(true);
    setAdsError(null);
    if (!userId || !token) {
      setAdsError('Не удалось определить пользователя или отсутствует токен для запроса.');
      setIsLoadingAds(false);
      return;
    }
    try {
      const searchCriteria: AdvertisementSearchCriteriaDto = {
        sellerId: userId,
        page,
        size: ADS_PER_PAGE,
        sort: 'createdAt,desc',
      };
      const data = await searchAds(searchCriteria, token);
      setAdsPage(data);
    } catch (err) {
      setAdsError('Не удалось загрузить объявления.');
      console.error(err);
    } finally {
      setIsLoadingAds(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchUserAdvertisements(currentPage);
  }, [userId, currentPage, fetchUserAdvertisements]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoadingAds) return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  if (adsError) return <p className="text-destructive py-8">{adsError}</p>;
  if (!adsPage || adsPage.content.length === 0) return <p className="text-muted-foreground py-8">У вас пока нет активных объявлений.</p>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
        {adsPage.content.map(ad => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
      {adsPage.totalPages > 1 && (
        <PaginationControls
            currentPage={adsPage.number}
            totalPages={adsPage.totalPages}
            onPageChange={handlePageChange}
            hasNextPage={!adsPage.last}
            hasPrevPage={adsPage.number > 0}
        />
      )}
    </div>
  );
}


export default function ProfilePageClient() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'info';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login?redirect=/profile/me');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader className="bg-muted/30 p-6 border-b">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Image
              src={user.avatarUrl || "https://placehold.co/150x150.png"}
              alt={user.fullName}
              width={150}
              height={150}
              className="rounded-full object-cover aspect-square border-4 border-card shadow-md"
              data-ai-hint="user portrait"
            />
            <div className="flex-grow text-center sm:text-left">
              <CardTitle className="text-3xl font-headline">{user.fullName}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">{user.email}</CardDescription>
              <p className="text-sm text-muted-foreground mt-1">
                Зарегистрирован: {format(new Date(user.registeredAt), "d MMMM yyyy", { locale: ru })}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/profile/edit">
                  <Edit className="mr-2 h-4 w-4" /> Редактировать профиль
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue={initialTab} className="w-full" onValueChange={(value) => router.push(`/profile/me?tab=${value}`, { scroll: false })}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 rounded-none border-b">
              <TabsTrigger value="info" className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                <PackageSearch className="mr-2 h-4 w-4 hidden sm:inline-block"/> Информация
              </TabsTrigger>
              <TabsTrigger value="my-ads" className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                <ListChecks className="mr-2 h-4 w-4 hidden sm:inline-block"/> Мои объявления 
              </TabsTrigger>
               <TabsTrigger value="settings" className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">
                <Settings className="mr-2 h-4 w-4 hidden sm:inline-block"/> Настройки
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="p-6">
              <h3 className="text-xl font-semibold mb-4">Контактная информация</h3>
              <div className="space-y-3 text-foreground/80">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-primary" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  <span>{user.phoneNumber || 'Не указан'}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <span>{user.cityName || 'Город не указан'}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mt-8 mb-4">Статистика</h3>
              <div className="flex items-center text-foreground/80">
                <CalendarCheck2 className="h-5 w-5 mr-3 text-primary" />
                <span>Активных объявлений: {user.totalActiveAdvertisements}</span>
              </div>
            </TabsContent>

            <TabsContent value="my-ads" className="p-6">
               <h3 className="text-xl font-semibold mb-4">Мои объявления</h3>
               <UserAdsSection userId={user.id} />
            </TabsContent>
            
            <TabsContent value="settings" className="p-6">
              <h3 className="text-xl font-semibold mb-4">Настройки аккаунта</h3>
              <p className="text-muted-foreground mb-4">Здесь могут быть настройки уведомлений, смена пароля и т.д.</p>
              <Button variant="destructive" onClick={logout}>Выйти из аккаунта</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
