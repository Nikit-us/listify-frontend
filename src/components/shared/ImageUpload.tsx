"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import Image from 'next/image';
import { UploadCloud, XCircle, FileImage, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // Max size in bytes
  label?: string;
  existingImageUrls?: { id: string | number; url: string }[]; // For edit mode
  onRemoveExistingImage?: (id: string | number) => void; // For edit mode
  className?: string;
  aspectRatio?: string; // e.g., 'aspect-video', 'aspect-square'
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


export default function ImageUpload({
  onFilesChange,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10 MB
  label = "Загрузите изображения",
  existingImageUrls = [],
  onRemoveExistingImage,
  className,
  aspectRatio = 'aspect-video',
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [currentExistingImages, setCurrentExistingImages] = useState(existingImageUrls);
  
  useEffect(() => {
    setCurrentExistingImages(existingImageUrls);
  }, [existingImageUrls]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setRejectionError(null);

    if (fileRejections.length > 0) {
      const firstRejection = fileRejections[0];
      const errorMessage = firstRejection.errors.map(e => {
          if (e.code === 'file-too-large') return `Файл слишком большой. Максимальный размер: ${formatBytes(maxSize)}.`;
          if (e.code === 'file-invalid-type') return 'Неверный тип файла.';
          if (e.code === 'too-many-files') return `Слишком много файлов. Максимум: ${maxFiles}.`;
          return e.message;
      }).join('\n');
      setRejectionError(errorMessage);
    }
    
    const newFiles = maxFiles === 1 ? acceptedFiles.slice(0, 1) : [...files, ...acceptedFiles].slice(0, maxFiles - currentExistingImages.length);
    setFiles(newFiles);
    onFilesChange(newFiles);

    // Clean up old previews before creating new ones
    previews.forEach(URL.revokeObjectURL);
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

  }, [files, maxFiles, onFilesChange, maxSize, currentExistingImages.length, previews]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxFiles: maxFiles,
    maxSize: maxSize,
    multiple: maxFiles > 1,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange(newFiles);
    URL.revokeObjectURL(previews[index]);
  };
  
  const removeExistingImage = (id: string | number) => {
    setCurrentExistingImages(current => current.filter(img => img.id !== id));
    if (onRemoveExistingImage) {
      onRemoveExistingImage(id);
    }
  };

  const totalImages = currentExistingImages.length + previews.length;
  const canUploadMore = totalImages < maxFiles;

  return (
    <div className={cn("space-y-4", className)}>
      {label && <p className="text-sm font-medium text-foreground">{label} (макс. {maxFiles}, до {formatBytes(maxSize)} каждый)</p>}
      
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors",
            isDragActive ? 'border-primary bg-primary/10' : '',
            rejectionError ? 'border-destructive' : '',
            aspectRatio
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full">
            <UploadCloud className="w-12 h-12 text-muted-foreground/70 mb-2" />
            {isDragActive ? (
              <p className="text-primary">Отпустите файлы для загрузки</p>
            ) : (
              <p className="text-muted-foreground">Перетащите файлы сюда или кликните для выбора</p>
            )}
            <p className="text-xs text-muted-foreground/50 mt-1">Поддерживаются JPG, PNG, GIF, WEBP</p>
          </div>
        </div>
      )}

      {rejectionError && (
          <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка загрузки</AlertTitle>
              <AlertDescription>
                  {rejectionError}
              </AlertDescription>
          </Alert>
      )}
      
      {(currentExistingImages.length > 0 || previews.length > 0) && (
        <div className={cn("grid gap-4", maxFiles === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5")}>
          {currentExistingImages.map((image) => (
            <div key={image.id} className="relative group aspect-square">
              <Image src={image.url} alt="Existing image" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="uploaded image" />
              {onRemoveExistingImage && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeExistingImage(image.id)}
                  aria-label="Remove existing image"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {previews.map((preview, index) => (
            <div key={index} className="relative group aspect-square">
              <Image src={preview} alt={`Preview ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="image preview"/>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
                aria-label="Remove image"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!canUploadMore && totalImages >= maxFiles && (
         <div className="flex items-center p-3 text-sm text-primary bg-primary/10 rounded-md border border-primary/20">
            <FileImage className="h-5 w-5 mr-2 shrink-0" />
            <span>Достигнут лимит изображений ({maxFiles}).</span>
          </div>
      )}
    </div>
  );
}
