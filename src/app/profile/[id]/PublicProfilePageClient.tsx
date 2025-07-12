
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Mail, Phone, MapPin, CalendarCheck2, PackageSearch, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { UserProfileDto, AdvertisementResponseDto, PageResponseDto, AdvertisementSearchCriteriaDto } from '@/types/api';
import { getUserProfile, searchAds } from '@/lib/mockApi';
import AdCard from '@/components/ads/AdCard';
import PaginationControls from '@/components/shared/PaginationControls';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ADS_PER_PAGE = 8;

function SellerAdsSection({ userId, token }: { userId: number, token: string | null }) {
  const [adsPage, setAdsPage] = useState<PageResponseDto<AdvertisementResponseDto> | null>(null);
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  const [adsError, setAdsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchUserAdvertisements = useCallback(async (page: number) => {
    setIsLoadingAds(true);
    setAdsError(null);
    try {
      const searchCriteria: AdvertisementSearchCriteriaDto = {
        sellerId: userId,
        status: 'ACTIVE',
        page,
        size: ADS_PER_PAGE,
        sort: 'createdAt,desc',
      };
      // We can use the logged-in user's token if available, but it's not strictly necessary for public ads
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
  }, [currentPage, fetchUserAdvertisements]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoadingAds) return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  if (adsError) return <Alert variant="destructive"><AlertTitle>Ошибка</AlertTitle><AlertDescription>{adsError}</AlertDescription></Alert>;
  if (!adsPage || adsPage.content.length === 0) return <p className="text-muted-foreground py-8">У этого пользователя нет активных объявлений.</p>;

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


export default function PublicProfilePageClient({ userId }: { userId: number }) {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user: loggedInUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the user is viewing their own profile, redirect to the editable /profile/me page
    if (loggedInUser && loggedInUser.id === userId) {
      router.replace('/profile/me');
      return;
    }

    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getUserProfile(userId, token);
        if (data) {
          setProfile(data);
        } else {
          setError('Профиль не найден.');
        }
      } catch (err) {
        setError('Не удалось загрузить профиль.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, token, loggedInUser, router]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size={48} />
      </div>
    );
  }
  
  if (error) {
     return <Alert variant="destructive"><AlertTitle>Ошибка</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  }

  if (!profile) {
    return <p className="text-center py-10">Пользователь не найден.</p>;
  }


  return (
    <div className="max-w-5xl mx-auto py-8">
       <Button onClick={() => router.back()} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
      </Button>
      <Card className="shadow-xl">
        <CardHeader className="bg-muted/30 p-6 border-b">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Image
              src={profile.avatarUrl || "https://placehold.co/150x150.png"}
              alt={profile.fullName}
              width={150}
              height={150}
              className="rounded-full object-cover aspect-square border-4 border-card shadow-md"
              data-ai-hint="user portrait"
            />
            <div className="flex-grow text-center sm:text-left">
              <CardTitle className="text-3xl font-headline">{profile.fullName}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">Продавец на Listify</CardDescription>
              <p className="text-sm text-muted-foreground mt-1">
                Зарегистрирован: {format(new Date(profile.registeredAt), "d MMMM yyyy", { locale: ru })}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4">Контактная информация</h3>
                    <div className="space-y-3 text-foreground/80">
                        <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-3 text-primary" />
                        <a href={`mailto:${profile.email}`} className="hover:underline truncate">{profile.email}</a>
                        </div>
                        <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-3 text-primary" />
                        {profile.phoneNumber ? <a href={`tel:${profile.phoneNumber}`} className="hover:underline">{profile.phoneNumber}</a> : 'Не указан'}
                        </div>
                        <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-primary" />
                        <span>{profile.cityName || 'Город не указан'}</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold mt-8 mb-4">Статистика</h3>
                    <div className="flex items-center text-foreground/80">
                        <CalendarCheck2 className="h-5 w-5 mr-3 text-primary" />
                        <span>Активных объявлений: {profile.totalActiveAdvertisements}</span>
                    </div>
                </div>
                 <div>
                    <h3 className="text-xl font-semibold mb-4">Объявления пользователя</h3>
                    <SellerAdsSection userId={profile.id} token={token} />
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
