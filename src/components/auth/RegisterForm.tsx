
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/shared/ImageUpload';
import { register as apiRegister, getCities } from '@/lib/mockApi';
import type { CityDto, UserRegistrationDto } from '@/types/api';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: 'Имя должно содержать не менее 2 символов.' }).max(100),
  email: z.string().email({ message: 'Неверный формат email.' }).max(255),
  password: z.string().min(8, { message: 'Пароль должен быть не менее 8 символов.' }).max(255),
  confirmPassword: z.string().min(8, { message: 'Пароль должен быть не менее 8 символов.' }).max(255),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, { message: 'Неверный формат номера телефона (например, +375291234567).' }).max(50).optional().or(z.literal('')),
  cityId: z.string().min(1, { message: 'Выберите город.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File[]>([]);
  const [cities, setCities] = useState<CityDto[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCitiesData = async () => {
      try {
        const citiesData = await getCities();
        setCities(citiesData);
      } catch (err) {
        console.error("Failed to load cities:", err);
        toast({ variant: "destructive", title: "Ошибка", description: "Не удалось загрузить список городов." });
      }
    };
    fetchCitiesData();
  }, []); // Changed dependency array to empty

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      cityId: '',
    },
  });

  const handleAvatarChange = (files: File[]) => {
    setAvatarFile(files);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
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
      setError((err as Error).message || 'Произошла ошибка при регистрации.');
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
              name="cityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Город</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите ваш город" />
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
            
            <FormItem>
              <FormLabel>Аватар (необязательно)</FormLabel>
              <ImageUpload onFilesChange={handleAvatarChange} maxFiles={1} label="" aspectRatio="aspect-square"/>
            </FormItem>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <LoadingSpinner className="mr-2"/> : null}
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

    