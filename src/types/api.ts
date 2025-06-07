
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page number
  // other pagination fields
}

export interface AdvertisementResponseDto {
  id: number;
  title: string;
  price: number;
  cityId: number;
  cityName: string;
  createdAt: string; // ISO date string
  previewImageUrl?: string;
}

export interface ImageDto {
  id: number;
  imageUrl: string;
  isPreview: boolean;
}

export interface AdvertisementDetailDto extends AdvertisementResponseDto {
  description: string;
  updatedAt: string; // ISO date string
  status: "ACTIVE" | "INACTIVE" | "SOLD"; // Example statuses
  condition: "NEW" | "USED_LIKE_NEW" | "USED_GOOD" | "USED_FAIR"; // Example conditions
  categoryId: number;
  categoryName: string;
  sellerId: number;
  sellerName: string;
  images: ImageDto[];
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface JwtResponseDto {
  token: string;
  type: "Bearer";
  userId: number;
  email: string;
  roles: string[];
}

export interface UserRegistrationDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  cityId: number;
}

export interface UserResponseDto {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  registeredAt: string; // ISO date string
  avatarUrl?: string;
  cityId?: number;
  cityName?: string;
}

export interface AdvertisementCreateDto {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  cityId: number;
  condition: "NEW" | "USED_LIKE_NEW" | "USED_GOOD" | "USED_FAIR";
}

export type AdvertisementUpdateDto = Partial<AdvertisementCreateDto>;

export interface UserProfileDto extends UserResponseDto {
  totalActiveAdvertisements: number;
}

export interface UserUpdateProfileDto {
  fullName?: string;
  phoneNumber?: string;
  cityId?: number;
}

export interface CityDto {
  id: number;
  name: string;
}

export interface CategoryDto {
  id: number;
  name: string;
}
