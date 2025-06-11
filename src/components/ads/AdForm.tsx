
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/shared/ImageUpload';
import CategoryTreeSelect from '@/components/shared/CategoryTreeSelect'; // Updated import
import {
  createAd,
  updateAd,
  getCategoriesAsTree, // Updated to use tree
  getRegions,
  getDistrictsByRegion,
  getCitiesByDistrict,
  getAdById
} from '@/lib/mockApi';
import type {
  AdvertisementCreateDto,
  AdvertisementUpdateDto,
  CategoryTreeDto, // Updated type
  RegionDto,
  DistrictDto,
  CityDto,
  AdvertisementDetailDto,
} from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

const adSchema = z.object({
  title: z.string().min(5, { message: 'Заголовок должен быть не менее 5 символов.' }).max(50, { message: 'Заголовок не должен превышать 50 символов.' }),
  description: z.string().min(20, { message: 'Описание должно быть не менее 20 символов.' }).max(5000, { message: 'Описание не должно превышать 5000 символов.' }),
  price: z.coerce.number().min(0, { message: 'Цена не может быть отрицательной.' }),
  categoryId: z.coerce.number({invalid_type_error: 'Выберите категорию.'}).min(1, { message: 'Выберите категорию.' }),
  regionId: z.string().optional(), // Keep as string for Select value
  districtId: z.string().optional(), // Keep as string for Select value
  cityId: z.coerce.number({invalid_type_error: 'Выберите город.'}).min(1, { message: 'Выберите город.' }),
  condition: z.enum(['NEW', 'USED_PERFECT', 'USED_GOOD', 'USED_FAIR'], { required_error: 'Укажите состояние товара.' }),
});

type AdFormValues = z.infer<typeof adSchema>;

interface AdFormProps {
  adId?: number;
}

const conditionOptions = [
  { value: 'NEW', label: 'Новое' },
  { value: 'USED_PERFECT', label: 'Б/у, идеальное' },
  { value: 'USED_GOOD', label: 'Б/у, хорошее' },
  { value: 'USED_FAIR', label: 'Б/у, удовлетворительное' },
];

export default function AdForm({ adId }: AdFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const [newlySelectedImages, setNewlySelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: string | number; url: string }[]>([]);
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState<number[]>([]);

  const [categoriesTree, setCategoriesTree] = useState<CategoryTreeDto[]>([]);
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [cities, setCities] = useState<CityDto[]>([]);

  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const { toast } = useToast();

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      categoryId: undefined,
      regionId: undefined,
      districtId: undefined,
      cityId: undefined,
      condition: undefined,
    },
  });

  const watchedRegionId = form.watch('regionId');
  const watchedDistrictId = form.watch('districtId');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(adId ? `/login?redirect=/ads/${adId}/edit` : '/login?redirect=/ads/new');
    }
  }, [authLoading, isAuthenticated, router, adId]);

  const fetchFormData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [categoriesData, regionsData] = await Promise.all([
        getCategoriesAsTree(),
        getRegions(),
      ]);
      setCategoriesTree(categoriesData);
      setRegions(regionsData);

      if (adId) {
        const adData = await getAdById(adId);
        if (adData) {
          if (user && adData.sellerId !== user.id) {
            toast({ variant: "destructive", title: "Ошибка доступа", description: "Вы не можете редактировать это объявление." });
            router.push(`/ads/${adId}`);
            return;
          }
          form.reset({
            title: adData.title,
            description: adData.description,
            price: adData.price,
            categoryId: adData.categoryId,
            cityId: adData.cityId,
            condition: adData.condition,
            // regionId and districtId are not directly available from adData.cityId.
            // They will not be pre-filled to avoid complexity without a dedicated API endpoint.
            // User needs to re-select if changing city.
          });
          setExistingImages(adData.images.map(img => ({ id: img.id, url: img.imageUrl })));
          setNewlySelectedImages([]);
          setRemovedExistingImageIds([]);
        } else {
          toast({ variant: "destructive", title: "Ошибка", description: "Объявление не найдено." });
          router.push('/');
        }
      }
    } catch (err) {
      console.error("Failed to load form options or ad data:", err);
      toast({ variant: "destructive", title: "Ошибка загрузки", description: "Не удалось загрузить данные для формы." });
    } finally {
      setIsDataLoading(false);
    }
  }, [adId, form, router, toast, user]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);


  useEffect(() => {
    const currentRegionId = form.getValues('regionId');
    if (currentRegionId) {
      setIsLocationLoading(true);
      getDistrictsByRegion(parseInt(currentRegionId))
        .then(setDistricts)
        .catch(console.error)
        .finally(() => setIsLocationLoading(false));
      form.setValue('districtId', undefined);
      form.setValue('cityId', undefined);
      setCities([]);
    } else {
      setDistricts([]);
      setCities([]);
    }
  }, [watchedRegionId, form]);

  useEffect(() => {
    const currentDistrictId = form.getValues('districtId');
    if (currentDistrictId) {
      setIsLocationLoading(true);
      getCitiesByDistrict(parseInt(currentDistrictId))
        .then(setCities)
        .catch(console.error)
        .finally(() => setIsLocationLoading(false));
      form.setValue('cityId', undefined);
    } else {
      setCities([]);
    }
  }, [watchedDistrictId, form]);


  const handleNewImagesChange = (files: File[]) => {
    setNewlySelectedImages(files);
  };

  const handleRemoveExistingImage = (id: string | number) => {
    setExistingImages(current => current.filter(img => img.id !== id));
    const numericId = Number(id);
    if (!isNaN(numericId)) {
        setRemovedExistingImageIds(prevIds =>
            prevIds.includes(numericId) ? prevIds : [...prevIds, numericId]
        );
    }
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
      const basePayload = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        categoryId: Number(data.categoryId),
        cityId: Number(data.cityId),
        condition: data.condition,
      };

      if (adId) {
        const updatePayload: AdvertisementUpdateDto = {
            ...basePayload,
            imageIdsToDelete: removedExistingImageIds.length > 0 ? removedExistingImageIds : undefined,
        };
        savedAd = await updateAd(adId, updatePayload, newlySelectedImages.length > 0 ? newlySelectedImages : undefined, token);
        toast({ title: "Успех!", description: "Объявление успешно обновлено." });
      } else {
        const createPayload: AdvertisementCreateDto = basePayload;
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

  if (authLoading || isDataLoading) {
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
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <FormControl>
                     <CategoryTreeSelect
                        treeData={categoriesTree}
                        value={field.value}
                        onChange={(id) => field.onChange(id)} // Pass only id to RHF
                        placeholder="Выберите категорию"
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="regionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Область</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // form.setValue('districtId', undefined); // Handled by useEffect
                        // form.setValue('cityId', undefined);     // Handled by useEffect
                      }}
                      value={field.value}
                      disabled={isLocationLoading && !field.value}
                    >
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Выберите область" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regions.map(region => (
                          <SelectItem key={region.id} value={region.id.toString()}>{region.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="districtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Район</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // form.setValue('cityId', undefined); // Handled by useEffect
                      }}
                      value={field.value}
                      disabled={isLocationLoading || !watchedRegionId || districts.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Выберите район" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts.map(district => (
                          <SelectItem key={district.id} value={district.id.toString()}>{district.name}</SelectItem>
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
                    <Select
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      value={field.value?.toString()}
                      disabled={isLocationLoading || !watchedDistrictId || cities.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Выберите город" /></SelectTrigger>
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
                      <SelectTrigger><SelectValue placeholder="Выберите состояние товара" /></SelectTrigger>
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
                  existingImageUrls={existingImages}
                  onRemoveExistingImage={handleRemoveExistingImage}
                  aspectRatio="aspect-square"
                  className="w-full sm:max-w-md" 
                />
            </FormItem>

            {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || authLoading || isDataLoading || isLocationLoading}>
              {(isLoading || authLoading || isDataLoading || isLocationLoading) ? <LoadingSpinner className="mr-2" /> : null}
              {adId ? 'Сохранить изменения' : 'Опубликовать объявление'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

    