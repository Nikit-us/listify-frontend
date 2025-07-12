
"use client";

import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { useAuth } from '@/context/AuthContext';
import {
  generateLogReport,
  getLogTaskStatus,
  downloadGeneratedLog,
  downloadArchivedLog,
} from '@/lib/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import type { LogTaskStatusDto } from '@/types/api';

export default function LogManager() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const [generateDate, setGenerateDate] = useState('');
  const [downloadDate, setDownloadDate] = useState('');
  
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<LogTaskStatusDto | null>(null);

  const { token } = useAuth();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!token) return;
    setIsGenerating(true);
    setTaskId(null);
    setTaskStatus(null);
    try {
      const result = await generateLogReport(token, generateDate || undefined);
      setTaskId(result.taskId);
      toast({
        title: "Задача создана",
        description: `Задача на генерацию отчета ${result.taskId} принята.`,
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка", description: (err as Error).message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!token || !taskId) return;
    setIsCheckingStatus(true);
    try {
      const result = await getLogTaskStatus(token, taskId);
      setTaskStatus(result);
      toast({
        title: "Статус задачи",
        description: `Статус для ${result.taskId}: ${result.status}`,
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка", description: (err as Error).message });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleDownloadGenerated = async () => {
    if (!token || !taskId) return;
    setIsDownloading(true);
    try {
      const blob = await downloadGeneratedLog(token, taskId);
      saveAs(blob, `generated-log-${taskId}.txt`);
      toast({ title: "Успех!", description: "Скачивание файла началось." });
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка", description: (err as Error).message });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleDownloadArchived = async () => {
    if (!token || !downloadDate) {
        toast({ variant: "destructive", title: "Ошибка", description: "Пожалуйста, выберите дату." });
        return;
    };
    setIsDownloading(true);
    try {
      const blob = await downloadArchivedLog(token, downloadDate);
      saveAs(blob, `archived-log-${downloadDate}.log.gz`);
      toast({ title: "Успех!", description: "Скачивание архива началось." });
    } catch (err) {
      toast({ variant: "destructive", title: "Ошибка", description: (err as Error).message });
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Асинхронная генерация отчета</CardTitle>
          <CardDescription>
            Запустить задачу по генерации общего лог-файла. Можно отслеживать статус и скачать результат.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="date"
              value={generateDate}
              onChange={(e) => setGenerateDate(e.target.value)}
              placeholder="YYYY-MM-DD (опционально)"
              className="w-full sm:w-auto"
            />
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full sm:w-auto">
              {isGenerating && <LoadingSpinner className="mr-2"/>}
              Запустить генерацию
            </Button>
          </div>
          {taskId && (
            <div className="p-4 bg-muted rounded-md space-y-3">
              <p className="text-sm break-all">
                ID Задачи: <code className="font-mono bg-background p-1 rounded">{taskId}</code>
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleCheckStatus} disabled={isCheckingStatus}>
                  {isCheckingStatus && <LoadingSpinner className="mr-2"/>}
                  Проверить статус
                </Button>
                <Button onClick={handleDownloadGenerated} disabled={isDownloading || taskStatus?.status !== 'SUCCESS'}>
                  {isDownloading && <LoadingSpinner className="mr-2"/>}
                  Скачать отчет
                </Button>
              </div>
              {taskStatus && (
                 <p className="text-sm">
                    Последний известный статус: <span className="font-semibold">{taskStatus.status}</span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Скачивание архивных логов</CardTitle>
          <CardDescription>
            Скачать архивный лог-файл за определенную дату.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                type="date"
                value={downloadDate}
                onChange={(e) => setDownloadDate(e.target.value)}
                className="w-full sm:w-auto"
                />
                <Button onClick={handleDownloadArchived} disabled={isDownloading || !downloadDate} className="w-full sm:w-auto">
                    {isDownloading && <LoadingSpinner className="mr-2" />}
                    Скачать архив
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
