
import React from 'react';
import AdminPageClient from './AdminPageClient';

// This is a wrapper for the admin page to enable Suspense,
// though the main logic is in the client component.

function AdminPageSkeletonFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)]">
      <p className="mt-4 text-muted-foreground">Загрузка панели администратора...</p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <React.Suspense fallback={<AdminPageSkeletonFallback />}>
      <AdminPageClient />
    </React.Suspense>
  );
}
