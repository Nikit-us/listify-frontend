import React from 'react';
import HomePageClient from '@/app/HomePageClient';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// This is the main page component for the "/" route.
// It wraps the client-side content in a Suspense boundary.

const ADS_PER_PAGE = 12; // Match the one in HomePageClient if skeleton is more complex

function HomePageSkeletonFallback() {
  // A simpler fallback, as ClientHomePage will render its own detailed skeleton
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)]">
      <LoadingSpinner size={48} />
      <p className="mt-4 text-muted-foreground">Загрузка контента страницы...</p>
       {/* Optionally, show a very basic skeleton of AdFilters and AdGrid */}
      <div className="w-full max-w-6xl mt-8">
        <Card className="mb-8 h-32 bg-muted/50 animate-pulse"></Card> {/* Skeleton for Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => ( // Fewer skeletons for root fallback
            <Card key={index} className="h-[300px] flex flex-col bg-muted/50 animate-pulse">
              <div className="aspect-video bg-muted animate-pulse rounded-t-lg"></div>
              <CardHeader className="p-4">
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-grow">
                <div className="h-5 w-1/2 bg-muted animate-pulse rounded mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <React.Suspense fallback={<HomePageSkeletonFallback />}>
      <HomePageClient />
    </React.Suspense>
  );
}
