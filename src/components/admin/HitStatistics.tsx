
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getHitStatistics } from '@/lib/mockApi';
import type { HitStatisticsDto } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function HitStatistics() {
  const [stats, setStats] = useState<HitStatisticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setError("Аутентификация не пройдена.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await getHitStatistics(token);
        setStats(data);
      } catch (err) {
        setError((err as Error).message || "Не удалось загрузить статистику.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (isLoading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Ошибка</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats || Object.keys(stats).length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Нет данных</AlertTitle>
        <AlertDescription>Статистика посещений пока отсутствует.</AlertDescription>
      </Alert>
    );
  }

  // Sort stats by hit count descending
  const sortedStats = Object.entries(stats).sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика посещений URL</CardTitle>
        <CardDescription>
          Отображает количество обращений к различным эндпоинтам API.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Количество посещений</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStats.map(([url, count]) => (
                <TableRow key={url}>
                  <TableCell className="font-mono text-sm">{url}</TableCell>
                  <TableCell className="text-right font-medium">{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
