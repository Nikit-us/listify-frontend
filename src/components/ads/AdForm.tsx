
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/shared/ImageUpload';
import { createAd, updateAd, getCategories, getCities, getAdById } from '@/lib/mockApi';
import type { AdvertisementCreateDto, AdvertisementUpdateDto, CategoryDto, CityDto, AdvertisementDetailDto, ImageDto } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

const adSchema = z.object({
  title: z.string().min(5, { message: 'Заголовок должен быть не менее 5 символов.' }).max(50, { message: 'Заголовок не должен превышать 50 символов.' }),
  description: z.string().min(20, { message: 'Описание должно быть не менее 20 символов.' }).max(5000, { message: 'Описание не должно превышать 5000 символов.' }),
  price: z.coerce.number().min(0, { message: 'Цена не может быть отрицательной.' }),
  categoryId: z.string().min(1, { message: 'Выберите категорию.' }),
  cityId: z.string().min(1, { message: 'Выберите город.' }),
  condition: z.enum(['NEW', 'USED_PERFECT', 'USED_GOOD', 'USED_FAIR'], { required_error: 'Укажите состояние товара.' }),
});

type AdFormValues = z.infer<typeof adSchema>;

interface AdFormProps {
  adId?: number; // For edit mode
}

const conditionOptions = [
  { value: 'NEW', label: 'Новое' },
  { value: 'USED_PERFECT', label: 'Б/у, идеальное' },
  { value: 'USED_GOOD', label: 'Б/у, хорошее' },
  { value: 'USED_FAIR', label: 'Б/у, удовлетворительное' },
];

export default function AdForm({ adId }: AdFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [newlySelectedImages, setNewlySelectedImages] = useState<File[]>([]); // Files for new uploads
  const [existingImages, setExistingImages] = useState<{ id: string | number; url: string }[]>([]); // For UI display of current images
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState<number[]>([]); // IDs of existing images marked for removal

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [cities, setCities] = useState<CityDto[]>([]);
  
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const { toast } = useToast();

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      categoryId: '',
      cityId: '',
      condition: undefined,
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(adId ? `/login?redirect=/ads/${adId}/edit` : '/login?redirect=/ads/new');
    }
  }, [authLoading, isAuthenticated, router, adId]);


  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [categoriesData, citiesData] = await Promise.all([
          getCategories(),
          getCities(),
        ]);
        setCategories(categoriesData);
        setCities(citiesData);
      } catch (err) {
        console.error("Failed to load form options:", err);
        toast({ variant: "destructive", title: "Ошибка", description: "Не удалось загрузить опции для формы." });
      }
    };
    fetchDropdownData();

    if (adId) {
      setIsLoading(true);
      getAdById(adId).then(adData => {
        if (adData) {
          if(user && adData.sellerId !== user.id) { 
             toast({ variant: "destructive", title: "Ошибка доступа", description: "Вы не можете редактировать это объявление." });
             router.push(`/ads/${adId}`);
             return;
          }
          form.reset({
            title: adData.title,
            description: adData.description,
            price: adData.price,
            categoryId: adData.categoryId.toString(),
            cityId: adData.cityId.toString(),
            condition: adData.condition,
          });
          setExistingImages(adData.images.map(img => ({ id: img.id, url: img.imageUrl })));
          setNewlySelectedImages([]); // Clear any new images if re-loading
          setRemovedExistingImageIds([]); // Clear removed IDs if re-loading
        } else {
          toast({ variant: "destructive", title: "Ошибка", description: "Объявление не найдено." });
          router.push('/');
        }
      }).catch(err => {
        console.error("Failed to load ad for editing:", err);
        toast({ variant: "destructive", title: "Ошибка", description: "Не удалось загрузить объявление для редактирования." });
      }).finally(() => setIsLoading(false));
    }
  }, [adId, form, router, toast, user]);

  const handleNewImagesChange = (files: File[]) => {
    setNewlySelectedImages(files);
  };
  
  const handleRemoveExistingImage = (id: string | number) => {
    setExistingImages(current => current.filter(img => img.id !== id));
    // Only add to removedExistingImageIds if it's not already there
    // (though ImageUpload usually calls this once per removal)
    setRemovedExistingImageIds(prevIds => {
      const numericId = Number(id);
      if (!prevIds.includes(numericId)) {
        return [...prevIds, numericId];
      }
      return prevIds;
    });
  };

  const onSubmit = async (data: AdFormValues) => {
    if (!user || !token) {
      toast({ variant: "destructive", title: "Ошибка", description: "Пожалуйста, войдите в систему." });
      return;
    }
    setIsLoading(true);
    setFormError(null);
    
    try {
      let savedAd: AdvertisementDetailDto;
      if (adId) {
        const updatePayload: AdvertisementUpdateDto = {
            title: data.title,
            description: data.description,
            price: Number(data.price),
            categoryId: parseInt(data.categoryId),
            cityId: parseInt(data.cityId),
            condition: data.condition,
        };
        if (removedExistingImageIds.length > 0) {
          updatePayload.removedImageIds = [...removedExistingImageIds];
        }
        
        // Pass only newly selected images for upload
        savedAd = await updateAd(adId, updatePayload, newlySelectedImages.length > 0 ? newlySelectedImages : undefined, token);
        toast({ title: "Успех!", description: "Объявление успешно обновлено." });
      } else {
        const createPayload: AdvertisementCreateDto = {
          title: data.title,
          description: data.description,
          price: Number(data.price),
          categoryId: parseInt(data.categoryId),
          cityId: parseInt(data.cityId),
          condition: data.condition,
        };
        savedAd = await createAd(createPayload, newlySelectedImages.length > 0 ? newlySelectedImages : undefined, token);
        toast({ title: "Успех!", description: "Объявление успешно создано." });
      }
      router.push(`/ads/${savedAd.id}`);
    } catch (err) {
      setFormError((err as Error).message || 'Произошла ошибка.');
      toast({ variant: "destructive", title: "Ошибка", description: (err as Error).message || 'Не удалось сохранить объявление.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading || (isLoading && !adId)) { 
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><LoadingSpinner size={48} /></div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <Button onClick={() => router.back()} variant="outline" size="sm" className="absolute left-4 top-4 md:left-6 md:top-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        <CardTitle className="text-2xl font-headline text-center pt-8 md:pt-0">{adId ? 'Редактировать объявление' : 'Создать новое объявление'}</CardTitle>
        <CardDescription className="text-center">{adId ? 'Обновите детали вашего объявления.' : 'Заполните форму для размещения вашего объявления.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заголовок</FormLabel>
                  <FormControl>
                    <Input placeholder="Например, Продам ноутбук Macbook Pro 16" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Подробное описание товара..." {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цена (BYN)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} min="0" step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Город</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите город" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map(city => (
                            <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Состояние</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите состояние товара" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {conditionOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Изображения (до 5)</FormLabel>
               <ImageUpload 
                  onFilesChange={handleNewImagesChange} 
                  maxFiles={5} 
                  label="" 
                  existingImageUrls={existingImages} // Pass current existing images for display
                  onRemoveExistingImage={handleRemoveExistingImage} // Callback to manage removal
                  aspectRatio="aspect-square"
                />
            </FormItem>

            {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
              {(isLoading || authLoading) ? <LoadingSpinner className="mr-2" /> : null}
              {adId ? 'Сохранить изменения' : 'Опубликовать объявление'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
