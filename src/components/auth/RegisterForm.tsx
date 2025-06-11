
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/shared/ImageUpload';
import { register as apiRegister, getRegions, getDistrictsByRegion, getCitiesByDistrict } from '@/lib/mockApi';
import type { CityDto, UserRegistrationDto, RegionDto, DistrictDto } from '@/types/api';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: 'Имя должно содержать не менее 2 символов.' }).max(100),
  email: z.string().email({ message: 'Неверный формат email.' }).max(255),
  password: z.string().min(8, { message: 'Пароль должен быть не менее 8 символов.' }).max(255),
  confirmPassword: z.string().min(8, { message: 'Пароль должен быть не менее 8 символов.' }).max(255),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, { message: 'Неверный формат номера телефона (например, +375291234567).' }).max(50).optional().or(z.literal('')),
  regionId: z.string().min(1, { message: 'Выберите область.' }),
  districtId: z.string().min(1, { message: 'Выберите район.' }),
  cityId: z.string().min(1, { message: 'Выберите город.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File[]>([]);
  
  const [regions, setRegions] = useState<RegionDto[]>([]);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [cities, setCities] = useState<CityDto[]>([]);
  const [isLocationDataLoading, setIsLocationDataLoading] = useState(true);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      regionId: undefined,
      districtId: undefined,
      cityId: '',
    },
  });

  const watchedRegionId = form.watch('regionId');
  const watchedDistrictId = form.watch('districtId');

  useEffect(() => {
    const fetchInitialRegions = async () => {
      setIsLocationDataLoading(true);
      try {
        setRegions(await getRegions());
      } catch (err) {
        console.error("Failed to load regions:", err);
        toast({ variant: "destructive", title: "Ошибка", description: "Не удалось загрузить список областей." });
      } finally {
        setIsLocationDataLoading(false);
      }
    };
    fetchInitialRegions();
  }, [toast]);

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
      form.setValue('cityId', '');
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
      form.setValue('cityId', '');
    } else {
      setCities([]);
    }
  }, [watchedDistrictId, form]);

  const handleAvatarChange = (files: File[]) => {
    setAvatarFile(files);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setFormError(null);
    try {
      const registrationData: UserRegistrationDto = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }), 
        cityId: parseInt(data.cityId),
      };
      await apiRegister(registrationData, avatarFile[0]);
      toast({
        title: "Регистрация успешна!",
        description: "Теперь вы можете войти в свой аккаунт.",
      });
      router.push('/login');
    } catch (err) {
      setFormError((err as Error).message || 'Произошла ошибка при регистрации.');
      toast({
        variant: "destructive",
        title: "Ошибка регистрации",
        description: (err as Error).message || 'Пожалуйста, проверьте введенные данные.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Регистрация в Listify</CardTitle>
        <CardDescription>Создайте аккаунт, чтобы начать пользоваться платформой.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Повторите пароль</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
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
                  <FormLabel>Номер телефона (необязательно)</FormLabel>
                  <FormControl>
                    <Input placeholder="+375291234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
            
            <FormItem>
              <FormLabel>Аватар (необязательно)</FormLabel>
              <ImageUpload onFilesChange={handleAvatarChange} maxFiles={1} label="" aspectRatio="aspect-square"/>
            </FormItem>

            {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || isLocationDataLoading}>
              {(isLoading || isLocationDataLoading) ? <LoadingSpinner className="mr-2"/> : null}
              Зарегистрироваться
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/login">
              Войти
            </Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}
