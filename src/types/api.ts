
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
  phoneNumber?: string; // Optional as per OpenAPI example for UserUpdateProfileDto which is similar
  cityId: number; // Required as per OpenAPI
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

export type AdvertisementUpdateDto = Partial<Omit<AdvertisementCreateDto, 'categoryId' | 'cityId'> & { status?: "ACTIVE" | "INACTIVE" | "SOLD", categoryId?: number, cityId?: number }>;


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
  // parentCategoryId removed to match GET /api/categories response in OpenAPI spec
}

export interface AdvertisementSearchCriteriaDto {
  keyword?: string;
  categoryId?: number;
  cityId?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: "NEW" | "USED_PERFECT" | "USED_GOOD" | "USED_FAIR";
  sellerId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CategoryCreateDto {
  name: string;
  parentCategoryId?: number;
}

export interface CityCreateDto {
  name: string;
}
