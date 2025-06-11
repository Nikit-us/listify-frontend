import React from 'react';
import ProfilePageClient from '@/app/profile/me/ProfilePageClient';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// This is the main page component for the "/profile/me" route.
// It wraps the client-side content in a Suspense boundary.

function ProfilePageSkeletonFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)]">
      <LoadingSpinner size={48} />
      <p className="mt-4 text-muted-foreground">Загрузка профиля...</p>
    </div>
  );
}

export default function Page() {
  return (
    <React.Suspense fallback={<ProfilePageSkeletonFallback />}>
      <ProfilePageClient />
    </React.Suspense>
  );
}
