
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, FileText, LayoutList } from 'lucide-react';
import HitStatistics from '@/components/admin/HitStatistics';
import LogManager from '@/components/admin/LogManager';
import CategoryManager from '@/components/admin/CategoryManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminPageClient() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.replace('/login?redirect=/admin');
      } else if (!isAdmin) {
        // Redirect non-admin users to the home page
        router.replace('/');
      }
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  if (authLoading || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size={48} />
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Панель администратора</CardTitle>
          <CardDescription>Управление системными ресурсами и просмотр статистики.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="hits" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
              <TabsTrigger value="hits">
                <BarChart className="mr-2 h-4 w-4" /> Статистика
              </TabsTrigger>
              <TabsTrigger value="logs">
                <FileText className="mr-2 h-4 w-4" /> Логи
              </TabsTrigger>
              <TabsTrigger value="categories">
                <LayoutList className="mr-2 h-4 w-4" /> Категории
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hits" className="mt-6">
              <HitStatistics />
            </TabsContent>
            
            <TabsContent value="logs" className="mt-6">
              <LogManager />
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
              <CategoryManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
