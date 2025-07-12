
import React from 'react';
import PublicProfilePageClient from './PublicProfilePageClient';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

function PublicProfilePageSkeletonFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)]">
      <LoadingSpinner size={48} />
      <p className="mt-4 text-muted-foreground">Загрузка профиля пользователя...</p>
    </div>
  );
}

export default function PublicProfilePage({ params }: { params: { id: string } }) {
  const userId = parseInt(params.id, 10);

  if (isNaN(userId)) {
    return <div className="text-center py-10">Неверный ID пользователя.</div>;
  }
  
  return (
    <React.Suspense fallback={<PublicProfilePageSkeletonFallback />}>
      <PublicProfilePageClient userId={userId} />
    </React.Suspense>
  );
}
