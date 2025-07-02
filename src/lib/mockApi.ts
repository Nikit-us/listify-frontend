
import type {
  PageResponseDto,
  AdvertisementResponseDto,
  AdvertisementDetailDto,
  LoginRequestDto,
  JwtResponseDto,
  UserRegistrationDto,
  UserResponseDto,
  AdvertisementCreateDto,
  AdvertisementUpdateDto,
  UserProfileDto,
  UserUpdateProfileDto,
  CityDto,
  CategoryDto,
  CategoryTreeDto,
  RegionDto,
  DistrictDto,
  AdvertisementSearchCriteriaDto,
  ApiError,
} from '@/types/api';

// The base URL for client-side fetch requests.
// It's an empty string because we are using Next.js rewrites to proxy the requests.
// This avoids CORS issues during development.
const API_FETCH_BASE_URL = '';

// The real, external base URL of the API.
// Used for constructing absolute image URLs, as rewrites don't apply to image `src` attributes.
const EXTERNAL_API_HOST = 'http://listify-app.site';

console.log(`[mockApi] API fetch requests will be proxied via Next.js rewrites to ${EXTERNAL_API_HOST}.`);
console.log(`[mockApi] Absolute image URLs will be constructed with host: ${EXTERNAL_API_HOST}`);


const toAbsoluteImageUrl = (relativePath?: string): string | undefined => {
  if (!relativePath) return undefined;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
    return relativePath;
  }
  // Use the external host for images
  return `${EXTERNAL_API_HOST}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
};

const handleApiError = async (response: Response, url: string): Promise<Error> => {
  let errorMessage = `Ошибка API. Статус: ${response.status}. URL: ${url}`;
  try {
    const errorData: ApiError = await response.json();
    if (typeof errorData.message === 'string') {
      errorMessage = errorData.message;
    } else if (typeof errorData.message === 'object' && errorData.message !== null) {
      errorMessage = Object.values(errorData.message).join(', ');
    } else if (errorData.error) {
      errorMessage = `${errorData.error} (Статус: ${errorData.status})`;
    }
  } catch (e) {
    // If parsing JSON fails, use the original generic message.
    // This can happen for 5xx errors that return HTML pages instead of JSON.
     errorMessage = `Ошибка сервера (статус ${response.status}) или неверный формат ответа от ${url}.`;
  }
  console.error(`[mockApi] ${errorMessage}`);
  return new Error(errorMessage);
};


// --- Locations ---

export const getRegions = async (): Promise<RegionDto[]> => {
  const url = `${API_FETCH_BASE_URL}/api/locations/regions`;
  console.log(`[mockApi] Fetching regions from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка или неверный URL при получении регионов из ${url}:`, error);
    throw new Error(`Сетевая ошибка при получении регионов. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getDistrictsByRegion = async (regionId: number): Promise<DistrictDto[]> => {
  const url = `${API_FETCH_BASE_URL}/api/locations/districts?regionId=${regionId}`;
  console.log(`[mockApi] Fetching districts for region ${regionId} from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка или неверный URL при получении районов для региона ${regionId} из ${url}:`, error);
    throw new Error(`Сетевая ошибка при получении районов. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getCitiesByDistrict = async (districtId: number): Promise<CityDto[]> => {
  const url = `${API_FETCH_BASE_URL}/api/locations/cities?districtId=${districtId}`;
  console.log(`[mockApi] Fetching cities for district ${districtId} from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка или неверный URL при получении городов для района ${districtId} из ${url}:`, error);
    throw new Error(`Сетевая ошибка при получении городов. Исходная ошибка: ${(error as Error).message}`);
  }
};


// --- Categories ---

export const getCategoriesAsTree = async (): Promise<CategoryTreeDto[]> => {
  const url = `${API_FETCH_BASE_URL}/api/categories/tree`;
  console.log(`[mockApi] Fetching category tree from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка или неверный URL при получении дерева категорий из ${url}:`, error);
    throw new Error(`Сетевая ошибка при получении дерева категорий. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getCategories = async (): Promise<CategoryDto[]> => {
  const url = `${API_FETCH_BASE_URL}/api/categories`;
  console.log(`[mockApi] Fetching flat categories from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка или неверный URL при получении категорий из ${url}:`, error);
    throw new Error(`Сетевая ошибка при получении категорий. Исходная ошибка: ${(error as Error).message}`);
  }
};


// --- Advertisements ---

export const searchAds = async (
  criteria: AdvertisementSearchCriteriaDto,
  token?: string | null
): Promise<PageResponseDto<AdvertisementResponseDto>> => {
  const { page = 0, size = 12, sort = 'createdAt,desc', ...filters } = criteria;
  
  const queryParams = new URLSearchParams({ page: page.toString(), size: size.toString(), sort: sort });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') queryParams.append(key, String(value));
  });

  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
  const url = `${API_FETCH_BASE_URL}/api/ads/search?${queryParams.toString()}`;
  console.log(`[mockApi] Searching ads with URL: ${url} and token: ${token ? 'Present' : 'Absent'}`);

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw await handleApiError(response, url);
    const data: PageResponseDto<AdvertisementResponseDto> = await response.json();
    data.content = data.content.map(ad => ({ ...ad, previewImageUrl: toAbsoluteImageUrl(ad.previewImageUrl) }));
    return data;
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка при поиске объявлений из ${url}:`, error);
    throw new Error(`Сетевая ошибка при поиске объявлений. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getAdById = async (id: number): Promise<AdvertisementDetailDto | null> => {
  const url = `${API_FETCH_BASE_URL}/api/ads/${id}`;
  console.log(`[mockApi] Fetching ad by ID ${id} from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw await handleApiError(response, url);
    }
    const ad: AdvertisementDetailDto = await response.json();
    ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
    return ad;
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка при получении объявления ${id} из ${url}:`, error);
    throw new Error(`Сетевая ошибка при получении объявления ${id}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const createAd = async (data: AdvertisementCreateDto, images: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
  const formData = new FormData();
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (images && images.length > 0) {
    images.forEach(file => formData.append('images', file, file.name));
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_FETCH_BASE_URL}/api/ads`;
  console.log(`[mockApi] Attempting to create ad at: ${url} with token: ${token ? 'Present' : 'Absent'}`);
  try {
    const response = await fetch(url, { method: 'POST', body: formData, headers });
    if (!response.ok) throw await handleApiError(response, url);
    const ad: AdvertisementDetailDto = await response.json();
    ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
    return ad;
  } catch (error) {
     console.error(`[mockApi] Сетевая ошибка при создании объявления на ${url}:`, error);
    throw new Error(`Сетевая ошибка при создании объявления. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const updateAd = async (id: number, data: AdvertisementUpdateDto, newImages: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
  const formData = new FormData();
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" }));

  if (newImages && newImages.length > 0) {
    newImages.forEach(file => formData.append('images', file, file.name));
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_FETCH_BASE_URL}/api/ads/${id}`;
  console.log(`[mockApi] Attempting to update ad ${id} at: ${url} with token: ${token ? 'Present' : 'Absent'}`);
  try {
    const response = await fetch(url, { method: 'PUT', body: formData, headers });
    if (!response.ok) throw await handleApiError(response, url);
    const ad: AdvertisementDetailDto = await response.json();
    ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
    return ad;
  } catch (error) {
     console.error(`[mockApi] Сетевая ошибка при обновлении объявления ${id} на ${url}:`, error);
    throw new Error(`Сетевая ошибка при обновлении объявления ${id}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const deleteAd = async (adId: number, token: string): Promise<void> => {
  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_FETCH_BASE_URL}/api/ads/${adId}`;
  console.log(`[mockApi] Attempting to delete ad ${adId} at: ${url} with token: ${token ? 'Present' : 'Absent'}`);
  try {
    const response = await fetch(url, { method: 'DELETE', headers });
    if (!response.ok) throw await handleApiError(response, url);
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка при удалении объявления ${adId} на ${url}:`, error);
    throw new Error(`Сетевая ошибка при удалении объявления ${adId}. Исходная ошибка: ${(error as Error).message}`);
  }
};


// --- Auth & Users ---

export const login = async (credentials: LoginRequestDto): Promise<JwtResponseDto> => {
  const url = `${API_FETCH_BASE_URL}/api/auth/login`;
  console.log(`[mockApi] Attempting login for ${credentials.email} at: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка во время входа на ${url}:`, error);
    throw new Error(`Сетевая ошибка во время входа. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const register = async (data: UserRegistrationDto, avatar?: File): Promise<UserResponseDto> => {
  const formData = new FormData();
  formData.append('user', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (avatar) {
    formData.append('avatar', avatar, avatar.name);
  }

  const url = `${API_FETCH_BASE_URL}/api/auth/register`;
  console.log(`[mockApi] Attempting registration for ${data.email} at: ${url}`);
  try {
    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) throw await handleApiError(response, url);
    const userResponse: UserResponseDto = await response.json();
    userResponse.avatarUrl = toAbsoluteImageUrl(userResponse.avatarUrl);
    return userResponse;
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка во время регистрации на ${url}:`, error);
    throw new Error(`Сетевая ошибка во время регистрации. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getCurrentUserProfile = async (token: string): Promise<UserProfileDto | null> => {
  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_FETCH_BASE_URL}/api/users/me`;
  console.log(`[mockApi] Fetching current user profile from: ${url} with token: ${token ? 'Present' : 'Absent'}`);
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
        if (response.status === 401 || response.status === 404) return null;
        throw await handleApiError(response, url);
    }
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl)!;
    return profile;
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка при получении текущего профиля пользователя из ${url}:`, error);
    throw new Error(`Сетевая ошибка при получении текущего профиля пользователя. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const updateUserProfile = async (data: UserUpdateProfileDto, avatar: File | undefined, token: string): Promise<UserProfileDto> => {
  const formData = new FormData();
  formData.append('profile', new Blob([JSON.stringify(data)], { type: "application/json" }) );
  if (avatar) {
    formData.append('avatar', avatar, avatar.name);
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_FETCH_BASE_URL}/api/users/me`;
  console.log(`[mockApi] Attempting to update user profile at: ${url} with token: ${token ? 'Present' : 'Absent'}`);
  try {
    const response = await fetch(url, { method: 'PUT', body: formData, headers });
    if (!response.ok) throw await handleApiError(response, url);
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl)!;
    return profile;
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка при обновлении профиля на ${url}:`, error);
    throw new Error(`Сетевая ошибка при обновлении профиля. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getUserProfile = async (userId: number, token?: string | null): Promise<UserProfileDto | null> => {
  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
  const url = `${API_FETCH_BASE_URL}/api/users/${userId}`;
  console.log(`[mockApi] Fetching user profile for ${userId} from: ${url}`);
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
        if (response.status === 404) return null;
        throw await handleApiError(response, url);
    }
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl)!;
    return profile;
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка при получении профиля пользователя ${userId} из ${url}:`, error);
    throw new Error(`Сетевая ошибка при получении профиля пользователя ${userId}. Исходная ошибка: ${(error as Error).message}`);
  }
};


// This function is kept for backwards compatibility with forms that haven't
// been updated to use the full hierarchical location selection yet.
// It assumes `/api/locations/cities` without a districtId returns all cities.
// This might need adjustment if the API doesn't support it.
export const getAllCitiesFlat = async (): Promise<CityDto[]> => {
  const url = `${API_FETCH_BASE_URL}/api/locations/cities`; 
  console.log(`[mockApi] Fetching all cities (flat) from: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    console.error(`[mockApi] Сетевая ошибка при получении всех городов из ${url}:`, error);
    throw new Error(`Сетевая ошибка при получении всех городов. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getCities = async (): Promise<CityDto[]> => {
   console.warn("[mockApi] getCities is called, typically for forms. Consider updating forms to use hierarchical location selection if needed.");
   return getAllCitiesFlat();
};
