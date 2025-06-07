
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // current page number
  // Spring Data Pageable also includes:
  // pageable: object;
  // last: boolean;
  // first: boolean;
  // numberOfElements: number;
  // sort: object;
  // empty: boolean;
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
  status: "ACTIVE" | "INACTIVE" | "SOLD";
  condition: "NEW" | "USED_LIKE_NEW" | "USED_GOOD" | "USED_FAIR";
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
  email:string;
  fullName: string;
  phoneNumber: string;
  registeredAt: string; // ISO date string
  avatarUrl?: string;
  cityId?: number; // Included as per UserProfileDto which UserResponseDto seems to be a base for
  cityName?: string; // Included as per UserProfileDto
}

export interface AdvertisementCreateDto {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  cityId: number;
  condition: "NEW" | "USED_LIKE_NEW" | "USED_GOOD" | "USED_FAIR";
}

export type AdvertisementUpdateDto = Partial<Omit<AdvertisementCreateDto, 'categoryId' | 'cityId'> & { status?: "ACTIVE" | "INACTIVE" | "SOLD", categoryId?: number, cityId?: number }>;


export interface UserProfileDto extends UserResponseDto {
  totalActiveAdvertisements: number;
  // roles might be here too depending on backend, but spec has it in JwtResponseDto
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
  parentCategoryId?: number;
}

export interface AdvertisementSearchCriteriaDto {
  keyword?: string;
  categoryId?: number;
  cityId?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: "NEW" | "USED_LIKE_NEW" | "USED_GOOD" | "USED_FAIR"; // Or other conditions from your spec
  sellerId?: number; // API spec shows long, using number here
  page?: number;
  size?: number;
  sort?: string; // e.g., "createdAt,desc"
}

export interface CategoryCreateDto {
  name: string;
  parentCategoryId?: number;
}

export interface CityCreateDto {
  name: string;
}
