
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
import ImageUpload from '@/components/shared/ImageUpload';
import { updateUserProfile, getCities } from '@/lib/mockApi';
import type { UserUpdateProfileDto, UserProfileDto, CityDto } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Image from 'next/image';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: 'Имя должно содержать не менее 2 символов.' }).optional(),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, { message: 'Неверный формат номера телефона.' }).optional(),
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
  const [cities, setCities] = useState<CityDto[]>([]);
  const { login: updateAuthContextUser, user, token } = useAuth(); // login also updates user in context, get token
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
      cityId: profile.cityId?.toString() || '',
    },
  });

  useEffect(()_ => {
    getCities().then(setCities).catch(console.error);
  }, []);

  const handleAvatarChange = (files: File[]) => {
    setAvatarFile(files);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !token) { // Check for token
        toast({ variant: "destructive", title: "Ошибка", description: "Вы не авторизованы." });
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setFormError(null);

    const updateData: UserUpdateProfileDto = {};
    if (data.fullName && data.fullName !== profile.fullName) updateData.fullName = data.fullName;
    if (data.phoneNumber && data.phoneNumber !== profile.phoneNumber) updateData.phoneNumber = data.phoneNumber;
    if (data.cityId && parseInt(data.cityId) !== profile.cityId) updateData.cityId = parseInt(data.cityId);
    
    if (Object.keys(updateData).length === 0 && avatarFile.length === 0) {
        toast({ title: "Нет изменений", description: "Вы не внесли никаких изменений." });
        setIsLoading(false);
        return;
    }

    try {
      // Pass token to updateUserProfile
      const updatedProfile = await updateUserProfile(user.id, updateData, avatarFile[0], token);
      
      // Update AuthContext with the new profile data.
      // The JWT token itself doesn't change, but user details within it might be stale.
      // The login function in AuthContext fetches the profile again, ensuring context is fresh.
      // We need the original JWT response structure, so we reconstruct it.
      if (user.token) { 
         await updateAuthContextUser({ 
            token: user.token, // Use existing token from context if available (can be named differently in user object)
            type: 'Bearer', 
            userId: updatedProfile.id, 
            email: updatedProfile.email, 
            roles: user.roles || ['ROLE_USER'] // Assuming roles exist on user object in context
        });
      } else { // Fallback if user.token is not directly on user object
        await updateAuthContextUser({
            token: token, // Use token from useAuth()
            type: 'Bearer',
            userId: updatedProfile.id,
            email: updatedProfile.email,
            roles: profile.roles || ['ROLE_USER'] // Use roles from original profile or default
        });
      }

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
                  src={avatarFile[0] ? URL.createObjectURL(avatarFile[0]) : profile.avatarUrl || "https://placehold.co/128x128.png?text=Avatar"}
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
            <FormField
              control={form.control}
              name="cityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Город</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
            {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <LoadingSpinner className="mr-2" /> : null}
              Сохранить изменения
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
