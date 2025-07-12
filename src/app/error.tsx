
"use client"; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Логирование ошибки в сервис мониторинга
    console.error("Global Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg text-center shadow-2xl">
        <CardHeader>
           <div className="mx-auto bg-destructive/10 text-destructive p-3 rounded-full w-fit">
             <AlertTriangle className="h-10 w-10" />
           </div>
          <CardTitle className="text-2xl font-headline text-destructive mt-4">Что-то пошло не так</CardTitle>
          <CardDescription>
            В приложении произошла непредвиденная ошибка.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
             Вы можете попробовать перезагрузить страницу или вернуться на главную.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={
                // Попытка восстановить работу через повторный рендеринг сегмента
                () => reset()
              }
            >
              Перезагрузить страницу
            </Button>
            <Button variant="outline" asChild>
                <a href="/">На главную</a>
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
             <details className="mt-4 p-4 bg-muted/50 rounded-lg text-left text-xs">
                <summary className="cursor-pointer font-medium">Технические детали</summary>
                <p className="mt-2 font-mono">{error.message}</p>
                {error.digest && <p className="mt-2 font-mono">Digest: {error.digest}</p>}
                <pre className="mt-2 whitespace-pre-wrap font-mono break-all">{error.stack}</pre>
             </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
