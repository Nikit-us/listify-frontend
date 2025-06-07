
"use client";

import AdForm from '@/components/ads/AdForm';
import { useParams } from 'next/navigation';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function EditAdPage() {
  const params = useParams();
  const adId = params.id ? parseInt(params.id as string) : undefined;

  if (adId === undefined || isNaN(adId)) {
    // This case should ideally be handled by a not-found page or error boundary
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Неверный ID объявления.</p></div>;
  }
  
  return (
    <div className="py-8">
      <AdForm adId={adId} />
    </div>
  );
}
