
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { AdvertisementResponseDto } from '@/types/api';
import { MapPin, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface AdCardProps {
  ad: AdvertisementResponseDto;
}

export default function AdCard({ ad }: AdCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg group">
      <Link href={`/ads/${ad.id}`} className="block aspect-video relative overflow-hidden">
        <Image
          src={ad.previewImageUrl || "https://placehold.co/300x200.png"}
          alt={ad.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="product image"
        />
      </Link>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg leading-tight">
          <Link href={`/ads/${ad.id}`} className="hover:text-primary transition-colors line-clamp-2">
            {ad.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow flex flex-col">
        <div className="flex-grow text-sm text-muted-foreground space-y-1.5 mb-2">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">{ad.cityName}</span>
          </div>
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 shrink-0" />
            <span>{format(new Date(ad.createdAt), "d MMMM yyyy", { locale: ru })}</span>
          </div>
        </div>
         <p className="text-xl font-bold text-accent">
            {ad.price.toLocaleString('ru-RU', { style: 'currency', currency: 'BYN', minimumFractionDigits: 0 })}
        </p>
      </CardContent>
    </Card>
  );
}
