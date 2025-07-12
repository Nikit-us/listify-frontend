
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/shared/ImageUpload';
import { updateUserProfile, getRegions, getDistrictsByRegion, getCitiesByDistrict } from '@/lib/mockApi';
import type { UserUpdateProfileDto, UserProfileDto, CityDto, JwtResponseDto, RegionDto, DistrictDto } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Image from 'next/image';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: 'Имя должно содержать не менее 2 символов.' }).optional(),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, { message: 'Неверный формат номера телефона.' }).optional().or(z.literal('')),
  regionId: z.string().optional(),
  districtId: z.string().optional(),
  cityId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: UserProfileDto;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File[]>([]);
  
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [cities, setCities] = useState<CityDto[]>([]);
  const [isLocationDataLoading, setIsLocationDataLoading] = useState(true);
  
  const { login: updateAuthContextUser, user, token } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
      regionId: undefined, // Will be set in useEffect if possible
      districtId: undefined,
      cityId: profile.cityId?.toString() || undefined,
    },
  });

  const watchedRegionId = form.watch('regionId');
  const watchedDistrictId = form.watch('districtId');

  // Initial data loading (regions and potentially pre-fill based on existing cityId)
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLocationDataLoading(true);
      try {
        const fetchedRegions = await getRegions();
        setRegions(fetchedRegions);
        // Attempt to pre-fill region/district if cityId is known. This is complex.
        // For simplicity, we might not fully pre-fill the hierarchy here.
        // User will re-select if they want to change.
        if (profile.cityId) {
            // This is a simplified pre-fill attempt. A robust solution
            // would require fetching city details to get its district/region or having all locations client-side.
        }
      } catch (err) {
        console.error("Failed to load location data:", err);
        toast({ variant: "destructive", title: "Ошибка", description: "Не удалось загрузить данные о местоположении." });
      } finally {
        setIsLocationDataLoading(false);
      }
    };
    loadInitialData();
  }, [profile.cityId, toast]);


  useEffect(() => {
    if (watchedRegionId) {
      const regionNumId = parseInt(watchedRegionId);
       if (!isNaN(regionNumId)) {
        setIsLocationDataLoading(true);
        getDistrictsByRegion(regionNumId)
          .then(setDistricts)
          .catch(console.error)
          .finally(() => setIsLocationDataLoading(false));
      } else {
        setDistricts([]);
      }
      form.setValue('districtId', undefined);
      form.setValue('cityId', undefined);
      setCities([]);
    } else {
      setDistricts([]);
      setCities([]);
    }
  }, [watchedRegionId, form]);

  useEffect(() => {
    if (watchedDistrictId) {
      const districtNumId = parseInt(watchedDistrictId);
      if (!isNaN(districtNumId)) {
        setIsLocationDataLoading(true);
        getCitiesByDistrict(districtNumId)
          .then(setCities)
          .catch(console.error)
          .finally(() => setIsLocationDataLoading(false));
      } else {
        setCities([]);
      }
      form.setValue('cityId', undefined);
    } else {
      setCities([]);
    }
  }, [watchedDistrictId, form]);

  const handleAvatarChange = (files: File[]) => {
    setAvatarFile(files);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !token) {
        toast({ variant: "destructive", title: "Ошибка", description: "Вы не авторизованы." });
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setFormError(null);

    const updateData: UserUpdateProfileDto = {};
    if (data.fullName !== undefined && data.fullName !== profile.fullName) updateData.fullName = data.fullName;
    
    if (data.phoneNumber !== undefined && data.phoneNumber !== profile.phoneNumber) {
        updateData.phoneNumber = data.phoneNumber || ''; 
    }
    
    const currentCityIdString = profile.cityId?.toString();
    if (data.cityId !== undefined && data.cityId !== currentCityIdString) { 
        updateData.cityId = data.cityId ? parseInt(data.cityId) : undefined;
    }
    
    if (Object.keys(updateData).length === 0 && avatarFile.length === 0) {
        toast({ title: "Нет изменений", description: "Вы не внесли никаких изменений." });
        setIsLoading(false);
        return;
    }

    try {
      const updatedProfile = await updateUserProfile(updateData, avatarFile[0], token);
      
      const mockJwtResponse: JwtResponseDto = {
        token: token,
        type: 'Bearer',
        userId: updatedProfile.id, 
        email: updatedProfile.email, 
        roles: user.roles || ['ROLE_USER'], 
      };
      await updateAuthContextUser(mockJwtResponse); // This will trigger a profile refresh in AuthContext

      toast({
        title: "Профиль обновлен!",
        description: "Ваши данные были успешно сохранены.",
      });
    } catch (err) {
      setFormError((err as Error).message || 'Произошла ошибка при обновлении профиля.');
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: (err as Error).message || 'Не удалось сохранить изменения.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Редактировать профиль</CardTitle>
        <CardDescription>Обновите вашу личную информацию.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Image
                  src={avatarFile[0] ? URL.createObjectURL(avatarFile[0]) : profile.avatarUrl || "https://placehold.co/128x128.png"}
                  alt="Аватар"
                  width={128}
                  height={128}
                  className="rounded-full object-cover aspect-square"
                  data-ai-hint="user avatar"
                />
              </div>
               <ImageUpload
                  onFilesChange={handleAvatarChange}
                  maxFiles={1}
                  label="Сменить аватар"
                  className="w-full max-w-xs"
                  aspectRatio="aspect-square"
                />
            </div>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Полное имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Иван Петров" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Номер телефона</FormLabel>
                  <FormControl>
                    <Input placeholder="+375291234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="regionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Область</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLocationDataLoading}>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLocationDataLoading || !watchedRegionId || districts.length === 0}>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLocationDataLoading || !watchedDistrictId || cities.length === 0}>
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

            {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || isLocationDataLoading}>
              {(isLoading || isLocationDataLoading) ? <LoadingSpinner className="mr-2" /> : null}
              Сохранить изменения
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
