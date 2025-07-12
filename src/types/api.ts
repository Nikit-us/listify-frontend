
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: Record<string, unknown> | string | string[]; // Can be a string or an array of strings
  path: string;
}

export interface PageResponseDto<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserUpdateProfileDto {
  fullName?: string;
  phoneNumber?: string;
  cityId?: number;
}

export interface UserProfileDto {
  id: number;
  fullName: string;
  email: string;
  cityId: number;
  cityName: string;
  phoneNumber: string;
  registeredAt: string; // ISO date-time string
  totalActiveAdvertisements: number;
  avatarUrl: string;
  roles?: string[]; // Added roles based on JWT response
}

export interface AdvertisementUpdateDto {
  title?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  cityId?: number;
  condition?: "NEW" | "USED_PERFECT" | "USED_GOOD" | "USED_FAIR";
  status?: "ACTIVE" | "INACTIVE" | "SOLD";
  imageIdsToDelete?: number[];
}

export interface AdvertisementImageDto {
  id: number;
  imageUrl: string;
  isPreview: boolean;
}

export interface AdvertisementDetailDto {
  id: number;
  title: string;
  description: string;
  price: number;
  createdAt: string; // ISO date-time string
  updatedAt: string; // ISO date-time string
  status: "ACTIVE" | "INACTIVE" | "SOLD";
  condition: "NEW" | "USED_PERFECT" | "USED_GOOD" | "USED_FAIR";
  categoryId: number;
  categoryName: string;
  cityId: number;
  cityName: string;
  sellerId: number;
  sellerName: string;
  images: AdvertisementImageDto[];
}

// This is the DTO for list views, like search results
export interface AdvertisementResponseDto {
    id: number;
    title: string;
    price: number;
    cityId: number;
    cityName: string;
    createdAt: string; // ISO date string
    previewImageUrl?: string;
}


export interface CategoryCreateDto {
  name: string;
  parentCategoryId?: number;
}

export interface CategoryDto {
  id: number;
  name: string;
}

export interface UserRegistrationDto {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  cityId: number;
}

export interface UserResponseDto {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  registeredAt: string; // ISO date-time string
  avatarUrl?: string;
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

export interface AdvertisementCreateDto {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  cityId: number;
  condition: "NEW" | "USED_PERFECT" | "USED_GOOD" | "USED_FAIR";
}

export interface RegionDto {
  id: number;
  name: string;
}

export interface DistrictDto {
  id: number;
  name: string;
  regionId: number;
}

export interface CityDto {
  id: number;
  name: string;
  districtId: number;
}

export interface CategoryTreeDto {
  id: number;
  name: string;
  children: CategoryTreeDto[];
}

export interface AdvertisementSearchCriteriaDto {
  keyword?: string;
  categoryId?: number;
  cityId?: number;
  regionId?: number; // Added for filter consistency
  districtId?: number; // Added for filter consistency
  minPrice?: number;
  maxPrice?: number;
  condition?: "NEW" | "USED_PERFECT" | "USED_GOOD" | "USED_FAIR";
  sellerId?: number;
  status?: "ACTIVE" | "INACTIVE" | "SOLD";
  page?: number;
  size?: number;
  sort?: string;
}

// --- Admin Panel Specific Types ---
export type HitStatisticsDto = Record<string, number>;

export interface LogTaskRequestDto {
  taskId: string;
  message: string;
  statusUrl: string;
}

export interface LogTaskStatusDto {
  taskId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'NOT_FOUND';
}
