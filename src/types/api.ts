
export interface PageableObject {
  offset: number;
  sort: SortObject;
  pageSize: number;
  pageNumber: number;
  paged: boolean;
  unpaged: boolean;
}

export interface SortObject {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page number
  pageable: PageableObject;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  sort: SortObject;
  empty: boolean;
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

export interface AdvertisementImageDto {
  id: number;
  imageUrl: string;
  isPreview: boolean;
}

export interface AdvertisementDetailDto extends AdvertisementResponseDto {
  description: string;
  updatedAt: string; // ISO date string
  status: "ACTIVE" | "INACTIVE" | "SOLD";
  condition: "NEW" | "USED_PERFECT" | "USED_GOOD" | "USED_FAIR";
  categoryId: number;
  categoryName: string;
  sellerId: number;
  sellerName: string;
  images: AdvertisementImageDto[];
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
  phoneNumber?: string;
  cityId: number;
}

export interface UserResponseDto {
  id: number;
  email:string;
  fullName: string;
  phoneNumber?: string;
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
  condition: "NEW" | "USED_PERFECT" | "USED_GOOD" | "USED_FAIR";
}

export type AdvertisementUpdateDto = Partial<Omit<AdvertisementCreateDto, 'categoryId' | 'cityId'>> & {
  status?: "ACTIVE" | "INACTIVE" | "SOLD";
  categoryId?: number;
  cityId?: number;
  imageIdsToDelete?: number[];
};

export interface UserProfileDto extends UserResponseDto {
  totalActiveAdvertisements: number;
}

export interface UserUpdateProfileDto {
  fullName?: string;
  phoneNumber?: string;
  cityId?: number;
}

export interface RegionDto {
  id: number;
  name: string;
}

export interface DistrictDto {
  id: number;
  name: string;
  // regionId?: number; // Might be useful if API provides it directly
}

export interface CityDto {
  id: number;
  name: string;
  // districtId?: number; // Might be useful if API provides it directly
}

export interface CategoryDto { // Flat category structure
  id: number;
  name: string;
}

export interface CategoryTreeDto { // Hierarchical category structure
  id: number;
  name: string;
  children: CategoryTreeDto[];
}

export interface CategoryCreateDto {
  name: string;
  parentCategoryId?: number;
}

export interface AdvertisementSearchCriteriaDto {
  keyword?: string;
  categoryId?: number;
  cityId?: number; 
  regionId?: number;
  districtId?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: "NEW" | "USED_PERFECT" | "USED_GOOD" | "USED_FAIR";
  sellerId?: number;
  page?: number;
  size?: number;
  sort?: string;
}
