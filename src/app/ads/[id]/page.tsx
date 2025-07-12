
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageGallery from '@/components/ads/ImageGallery';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import type { AdvertisementDetailDto } from '@/types/api';
import { getAdById } from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CalendarDays, Edit, Eye, MapPin, Tag, UserCircle, Info, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteAd as apiDeleteAd } from '@/lib/mockApi';

const conditionMap = {
  NEW: 'Новое',
  USED_PERFECT: 'Б/у, идеальное',
  USED_LIKE_NEW: 'Б/у, как новое',
  USED_GOOD: 'Б/у, хорошее',
  USED_FAIR: 'Б/у, удовлетворительное',
};

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = parseInt(params.id as string, 10);

  const [ad, setAd] = useState<AdvertisementDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isNaN(id)) {
      setError('Неверный ID объявления.');
      setIsLoading(false);
      return;
    }

    const fetchAd = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdById(id);
        if (data) {
          setAd(data);
        } else {
          setError('Объявление не найдено.');
        }
      } catch (err) {
        setError('Не удалось загрузить объявление.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAd();
  }, [id]);

  const handleDeleteAd = async () => {
    if (!ad || !user || !token) {
        toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Вы не авторизованы или сессия истекла.",
        });
        return;
    }
    try {
      await apiDeleteAd(ad.id, token);
      toast({
        title: "Успех!",
        description: "Объявление было успешно удалено.",
      });
      router.push('/');
    } catch (error) {
      console.error("Failed to delete ad:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить объявление. Попробуйте позже.",
      });
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (error) {
    return (
       <Alert variant="destructive" className="my-8">
         <Info className="h-4 w-4" />
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={() => router.back()} variant="link" className="mt-2 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
      </Alert>
    );
  }

  if (!ad) {
    return <div className="text-center py-10">Объявление не найдено.</div>;
  }

  const isOwner = isAuthenticated && user && user.id === ad.sellerId;

  return (
    <div className="max-w-4xl mx-auto">
      <Button onClick={() => router.back()} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к списку
      </Button>

      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="p-0">
          <ImageGallery images={ad.images} altText={ad.title} />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold font-headline text-primary">{ad.title}</h1>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <CalendarDays className="h-4 w-4 mr-2" />
                Опубликовано: {format(new Date(ad.createdAt), "d MMMM yyyy 'в' HH:mm", { locale: ru })}
              </div>
               {ad.createdAt !== ad.updatedAt && (
                   <div className="text-muted-foreground text-xs mt-1">
                     (обновлено: {format(new Date(ad.updatedAt), "d MMMM yyyy 'в' HH:mm", { locale: ru })})
                   </div>
                )}
            </div>
            {isOwner && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0 shrink-0">
                <Button variant="outline" onClick={() => router.push(`/ads/${ad.id}/edit`)} className="w-full sm:w-auto">
                  <Edit className="mr-2 h-4 w-4" /> Редактировать
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="mr-2 h-4 w-4" /> Удалить
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие не может быть отменено. Объявление будет удалено навсегда.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAd} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          <div className="text-4xl font-bold text-accent">
            {ad.price.toLocaleString('ru-RU', { style: 'currency', currency: 'BYN' })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium">Город:</span> {ad.cityName}
              </div>
            </div>
            <div className="flex items-start">
              <Tag className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium">Категория:</span> {ad.categoryName}
              </div>
            </div>
            <div className="flex items-start">
              <Eye className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium">Состояние:</span> {conditionMap[ad.condition as keyof typeof conditionMap] || ad.condition}
              </div>
            </div>
            <div className="flex items-start">
              <UserCircle className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium">Продавец:</span>{' '}
                 <Link href={`/profile/${ad.sellerId}`} className="text-primary hover:underline">
                    {ad.sellerName}
                 </Link>
              </div>
            </div>
             <div className="flex items-start md:col-span-2">
              <Info className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <span className="font-medium">Статус:</span> <span className={ad.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}>{ad.status}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Описание</h2>
            <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{ad.description}</p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
