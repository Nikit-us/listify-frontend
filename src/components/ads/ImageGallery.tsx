
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import type { ImageDto } from '@/types/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: ImageDto[];
  altText: string;
}

export default function ImageGallery({ images, altText }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    images.findIndex(img => img.isPreview) !== -1 ? images.findIndex(img => img.isPreview) : 0
  );

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        Нет изображений
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  const handlePrev = () => {
    setSelectedIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg bg-muted">
        {selectedImage && (
          <Image
            src={selectedImage.imageUrl}
            alt={`${altText} - изображение ${selectedIndex + 1}`}
            layout="fill"
            objectFit="contain"
            priority={selectedIndex === 0} // Prioritize first image or preview
            data-ai-hint="product detail"
          />
        )}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "aspect-square relative overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all",
                index === selectedIndex ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'
              )}
              aria-label={`Показать изображение ${index + 1}`}
            >
              <Image
                src={image.imageUrl}
                alt={`${altText} - миниатюра ${index + 1}`}
                layout="fill"
                objectFit="cover"
                data-ai-hint="thumbnail product"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
