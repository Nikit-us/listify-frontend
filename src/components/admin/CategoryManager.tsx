
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { createCategories, getCategoriesAsTree } from '@/lib/mockApi';
import type { CategoryCreateDto, CategoryTreeDto } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CategoryTreeSelect from '@/components/shared/CategoryTreeSelect';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const categorySchema = z.object({
  name: z.string().min(2, { message: 'Название должно быть не менее 2 символов.' }).max(100),
  parentCategoryId: z.number().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoryManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesTree, setCategoriesTree] = useState<CategoryTreeDto[]>([]);
  const { token } = useAuth();
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      parentCategoryId: undefined,
    },
  });

  const fetchCategories = async () => {
    try {
      const tree = await getCategoriesAsTree();
      setCategoriesTree(tree);
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось загрузить дерево категорий." });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data: CategoryFormValues) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const payload: CategoryCreateDto[] = [{
        name: data.name,
        ...(data.parentCategoryId && { parentCategoryId: data.parentCategoryId }),
      }];
      
      await createCategories(token, payload);
      toast({ title: "Успех!", description: `Категория "${data.name}" успешно создана.` });
      form.reset();
      // Refetch categories to show the new one in the selector
      await fetchCategories();
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка создания", description: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление категориями</CardTitle>
        <CardDescription>Создание новых корневых категорий или подкатегорий.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название новой категории</FormLabel>
                  <FormControl>
                    <Input placeholder="Например, 'Книги' или 'Коллекционирование'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Родительская категория (опционально)</FormLabel>
                  <FormControl>
                     <CategoryTreeSelect
                        treeData={categoriesTree}
                        value={field.value}
                        onChange={(id) => field.onChange(id)}
                        placeholder="Выбрать родителя (для корневой)"
                      />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner className="mr-2"/>}
              Создать категорию
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
