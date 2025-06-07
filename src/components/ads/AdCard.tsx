
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdvertisementResponseDto } from '@/types/api';
import { MapPin, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AdCardProps {
  ad: AdvertisementResponseDto;
}

export default function AdCard({ ad }: AdCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <Link href={`/ads/${ad.id}`} className="block aspect-video relative overflow-hidden">
        <Image
          src={ad.previewImageUrl || "https://placehold.co/300x200.png?text=No+Image"}
          alt={ad.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="product image"
        />
      </Link>
      <CardHeader className="p-4">
        <CardTitle className="text-lg leading-tight">
          <Link href={`/ads/${ad.id}`} className="hover:text-primary transition-colors">
            {ad.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-xl font-semibold text-accent mb-2">
          {ad.price.toLocaleString('ru-RU', { style: 'currency', currency: 'BYN', minimumFractionDigits: 0 })}
        </p>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 shrink-0" />
            <span>{ad.cityName}</span>
          </div>
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2 shrink-0" />
            <span>{format(new Date(ad.createdAt), "d MMMM yyyy", { locale: ru })}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/ads/${ad.id}`} className="w-full">
           {/* Intentionally empty, link is on whole card basically or specific parts */}
        </Link>
      </CardFooter>
    </Card>
  );
}
