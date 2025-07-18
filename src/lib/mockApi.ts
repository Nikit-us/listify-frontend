
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
  HitStatisticsDto,
  LogTaskRequestDto,
  LogTaskStatusDto,
  CategoryCreateDto
} from '@/types/api';


// --- API Configuration ---
// URL вашего API. Теперь он берется из переменной окружения.
// Вы можете изменить его в файле .env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://listify-app.site';

// Выводим предупреждение в консоль, если переменная не установлена,
// чтобы помочь при отладке.
if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.warn(
    `[mockApi] ВНИМАНИЕ: переменная окружения NEXT_PUBLIC_API_BASE_URL не установлена. Используется значение по умолчанию: ${API_BASE_URL}`
  );
}

console.log(`[mockApi] Все API запросы настроены для отправки на: ${API_BASE_URL}`);


const toAbsoluteImageUrl = (relativePath?: string): string | undefined => {
  if (!relativePath) return undefined;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
    return relativePath;
  }
  // Используем URL из переменных окружения для построения абсолютного пути
  const publicApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || API_BASE_URL;
  return `${publicApiUrl}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
};

const handleApiError = async (response: Response, url: string): Promise<Error> => {
  if (response.status === 401 && url.includes('/api/auth/login')) {
    const specificLoginError = new Error('Неверный email или пароль.');
    console.error(`[mockApi] Login failed (401): ${specificLoginError.message}`);
    return specificLoginError;
  }
  
  let errorMessage = `Ошибка API. Статус: ${response.status}. URL: ${url}`;
  try {
    const errorData: ApiError = await response.json();
    if (typeof errorData.message === 'string') {
      errorMessage = errorData.message;
    } else if (Array.isArray(errorData.message)) { // Handle array of error messages
      errorMessage = errorData.message.join('; ');
    } else if (typeof errorData.message === 'object' && errorData.message !== null) {
      errorMessage = Object.values(errorData.message).join(', ');
    } else if (errorData.error) {
      errorMessage = `${errorData.error} (Статус: ${errorData.status})`;
    }
  } catch (e) {
     errorMessage = `Ошибка сервера (статус ${response.status}) или неверный формат ответа от ${url}.`;
  }
  console.error(`[mockApi] API Error: ${errorMessage}`);
  return new Error(errorMessage);
};

const handleFetchError = (error: unknown, url: string, context: string): Error => {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const helpfulError = new Error(
            `Сетевая ошибка "Failed to fetch" при запросе "${context}" на URL: ${url}. ` +
            'Это может быть связано с проблемой CORS, отключением сети или недоступностью сервера. ' +
            'Проверьте сетевое подключение и конфигурацию CORS на сервере.'
        );
        console.error(`[mockApi] ${helpfulError.message}`);
        return helpfulError;
    }
    console.error(`[mockApi] Неизвестная сетевая ошибка или неверный URL при получении ${context} из ${url}:`, error);
    return new Error(`Сетевая ошибка при получении "${context}". Исходная ошибка: ${(error as Error).message}`);
};


// --- Locations ---

export const getRegions = async (): Promise<RegionDto[]> => {
  const url = `${API_BASE_URL}/api/locations/regions`;
  console.log(`[mockApi] Fetching regions from: ${url}`);
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    throw handleFetchError(error, url, "регионов");
  }
};

export const getDistrictsByRegion = async (regionId: number): Promise<DistrictDto[]> => {
  const url = `${API_BASE_URL}/api/locations/districts?regionId=${regionId}`;
  console.log(`[mockApi] Fetching districts for region ${regionId} from: ${url}`);
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    throw handleFetchError(error, url, `районов для региона ${regionId}`);
  }
};

export const getCitiesByDistrict = async (districtId: number): Promise<CityDto[]> => {
  const url = `${API_BASE_URL}/api/locations/cities?districtId=${districtId}`;
  console.log(`[mockApi] Fetching cities for district ${districtId} from: ${url}`);
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    throw handleFetchError(error, url, `городов для района ${districtId}`);
  }
};


// --- Categories ---

export const getCategoriesAsTree = async (): Promise<CategoryTreeDto[]> => {
  const url = `${API_BASE_URL}/api/categories/tree`;
  console.log(`[mockApi] Fetching category tree from: ${url}`);
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    throw handleFetchError(error, url, "дерева категорий");
  }
};

export const getCategories = async (): Promise<CategoryDto[]> => {
  const url = `${API_BASE_URL}/api/categories`;
  console.log(`[mockApi] Fetching flat categories from: ${url}`);
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    throw handleFetchError(error, url, "категорий");
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
  const url = `${API_BASE_URL}/api/ads/search?${queryParams.toString()}`;
  console.log(`[mockApi] Searching ads with URL: ${url} and token: ${token ? 'Present' : 'Absent'}`);

  try {
    const response = await fetch(url, { headers, cache: 'no-store' }); // Don't cache search results
    if (!response.ok) throw await handleApiError(response, url);
    const data: PageResponseDto<AdvertisementResponseDto> = await response.json();
    data.content = data.content.map(ad => ({ ...ad, previewImageUrl: toAbsoluteImageUrl(ad.previewImageUrl) }));
    return data;
  } catch (error) {
    throw handleFetchError(error, url, "поиска объявлений");
  }
};

export const getAdById = async (id: number): Promise<AdvertisementDetailDto | null> => {
  const url = `${API_BASE_URL}/api/ads/${id}`;
  console.log(`[mockApi] Fetching ad by ID ${id} from: ${url}`);
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw await handleApiError(response, url);
    }
    const ad: AdvertisementDetailDto = await response.json();
    ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
    return ad;
  } catch (error) {
    throw handleFetchError(error, url, `объявления ${id}`);
  }
};

export const createAd = async (data: AdvertisementCreateDto, images: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
  const formData = new FormData();
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (images && images.length > 0) {
    images.forEach(file => formData.append('images', file, file.name));
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_BASE_URL}/api/ads`;
  console.log(`[mockApi] Attempting to create ad at: ${url} with token: ${token ? 'Present' : 'Absent'}`);
  try {
    const response = await fetch(url, { method: 'POST', body: formData, headers });
    if (!response.ok) throw await handleApiError(response, url);
    const ad: AdvertisementDetailDto = await response.json();
    ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
    return ad;
  } catch (error) {
    throw handleFetchError(error, url, "создания объявления");
  }
};

export const updateAd = async (id: number, data: AdvertisementUpdateDto, newImages: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
  const formData = new FormData();
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" }));

  if (newImages && newImages.length > 0) {
    newImages.forEach(file => formData.append('images', file, file.name));
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_BASE_URL}/api/ads/${id}`;
  console.log(`[mockApi] Attempting to update ad ${id} at: ${url} with token: ${token ? 'Present' : 'Absent'}`);
  try {
    const response = await fetch(url, { method: 'PUT', body: formData, headers });
    if (!response.ok) throw await handleApiError(response, url);
    const ad: AdvertisementDetailDto = await response.json();
    ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
    return ad;
  } catch (error) {
    throw handleFetchError(error, url, `обновления объявления ${id}`);
  }
};

export const deleteAd = async (adId: number, token: string): Promise<void> => {
  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_BASE_URL}/api/ads/${adId}`;
  console.log(`[mockApi] Attempting to delete ad ${adId} at: ${url} with token: ${token ? 'Present' : 'Absent'}`);
  try {
    const response = await fetch(url, { method: 'DELETE', headers });
    if (response.status !== 204 && !response.ok) { // Allow 204 No Content
        throw await handleApiError(response, url);
    }
  } catch (error) {
    throw handleFetchError(error, url, `удаления объявления ${adId}`);
  }
};


// --- Auth & Users ---

export const login = async (credentials: LoginRequestDto): Promise<JwtResponseDto> => {
  const url = `${API_BASE_URL}/api/auth/login`;
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
    throw handleFetchError(error, url, "входа в систему");
  }
};

export const register = async (data: UserRegistrationDto, avatar?: File): Promise<UserResponseDto> => {
  const formData = new FormData();
  formData.append('user', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (avatar) {
    formData.append('avatar', avatar, avatar.name);
  }

  const url = `${API_BASE_URL}/api/auth/register`;
  console.log(`[mockApi] Attempting registration for ${data.email} at: ${url}`);
  try {
    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) throw await handleApiError(response, url);
    const userResponse: UserResponseDto = await response.json();
    userResponse.avatarUrl = toAbsoluteImageUrl(userResponse.avatarUrl);
    return userResponse;
  } catch (error) {
    throw handleFetchError(error, url, "регистрации");
  }
};

export const getCurrentUserProfile = async (token: string): Promise<UserProfileDto | null> => {
  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_BASE_URL}/api/users/me`;
  console.log(`[mockApi] Fetching current user profile from: ${url} with token: ${token ? 'Present' : 'Absent'}`);
  try {
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401 || response.status === 404) return null;
        throw await handleApiError(response, url);
    }
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl)!;
    return profile;
  } catch (error) {
    throw handleFetchError(error, url, "текущего профиля пользователя");
  }
};

export const updateUserProfile = async (data: UserUpdateProfileDto, avatar: File | undefined, token: string): Promise<UserProfileDto> => {
  const formData = new FormData();
  formData.append('profile', new Blob([JSON.stringify(data)], { type: "application/json" }) );
  if (avatar) {
    formData.append('avatar', avatar, avatar.name);
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_BASE_URL}/api/users/me`;
  console.log(`[mockApi] Attempting to update user profile at: ${url} with token: ${token ? 'Present' : 'Absent'}`);
  try {
    const response = await fetch(url, { method: 'PUT', body: formData, headers });
    if (!response.ok) throw await handleApiError(response, url);
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl)!;
    return profile;
  } catch (error) {
    throw handleFetchError(error, url, "обновления профиля");
  }
};

export const getUserProfile = async (userId: number, token?: string | null): Promise<UserProfileDto | null> => {
  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
  const url = `${API_BASE_URL}/api/users/${userId}`;
  console.log(`[mockApi] Fetching user profile for ${userId} from: ${url}`);
  try {
    const response = await fetch(url, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 404) return null;
        throw await handleApiError(response, url);
    }
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl)!;
    return profile;
  } catch (error) {
    throw handleFetchError(error, url, `профиля пользователя ${userId}`);
  }
};

// --- Admin Functions ---
export const getHitStatistics = async (token: string): Promise<HitStatisticsDto> => {
    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
    const url = `${API_BASE_URL}/api/admin/hits`;
    console.log(`[mockApi] Fetching hit statistics from: ${url}`);
    try {
        const response = await fetch(url, { headers, cache: 'no-store' });
        if (!response.ok) throw await handleApiError(response, url);
        return response.json();
    } catch (error) {
        throw handleFetchError(error, url, "статистики посещений");
    }
};

export const generateLogReport = async (token: string, date?: string): Promise<LogTaskRequestDto> => {
    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
    const url = new URL(`${API_BASE_URL}/api/admin/logs/tasks/generate`);
    if (date) {
        url.searchParams.append('date', date);
    }
    console.log(`[mockApi] Requesting log generation from: ${url.toString()}`);
    try {
        const response = await fetch(url.toString(), { method: 'POST', headers });
        if (!response.ok) throw await handleApiError(response, url.toString());
        return response.json();
    } catch (error) {
        throw handleFetchError(error, url.toString(), "генерации отчета логов");
    }
};

export const getLogTaskStatus = async (token: string, taskId: string): Promise<LogTaskStatusDto> => {
    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
    const url = `${API_BASE_URL}/api/admin/logs/tasks/${taskId}/status`;
    console.log(`[mockApi] Fetching log task status from: ${url}`);
    try {
        const response = await fetch(url, { headers, cache: 'no-store' });
        if (!response.ok) throw await handleApiError(response, url);
        return response.json();
    } catch (error) {
        throw handleFetchError(error, url, `статуса задачи логов ${taskId}`);
    }
};

export const downloadGeneratedLog = async (token: string, taskId: string): Promise<Blob> => {
    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
    const url = `${API_BASE_URL}/api/admin/logs/tasks/${taskId}/download`;
    console.log(`[mockApi] Downloading generated log from: ${url}`);
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) throw await handleApiError(response, url);
        return response.blob();
    } catch (error) {
        throw handleFetchError(error, url, `скачивания сгенерированного лога ${taskId}`);
    }
};

export const downloadArchivedLog = async (token: string, date: string): Promise<Blob> => {
    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
    const url = new URL(`${API_BASE_URL}/api/admin/logs/download`);
    url.searchParams.append('date', date);
    console.log(`[mockApi] Downloading archived log from: ${url.toString()}`);
    try {
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) throw await handleApiError(response, url.toString());
        return response.blob();
    } catch (error) {
        throw handleFetchError(error, url.toString(), `скачивания архивного лога за ${date}`);
    }
};

export const createCategories = async (token: string, data: CategoryCreateDto[]): Promise<CategoryDto[]> => {
    const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    const url = `${API_BASE_URL}/api/categories`;
    console.log(`[mockApi] Creating categories at: ${url}`);
    try {
        const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
        if (response.status !== 201 && !response.ok) { // Allow 201 Created
             throw await handleApiError(response, url);
        }
        return response.json();
    } catch (error) {
        throw handleFetchError(error, url, "создания категорий");
    }
};


// This function is kept for backwards compatibility with forms that haven't
// been updated to use the full hierarchical location selection yet.
// It assumes `/api/locations/cities` without a districtId returns all cities.
// This might need adjustment if the API doesn't support it.
export const getAllCitiesFlat = async (): Promise<CityDto[]> => {
  const url = `${API_BASE_URL}/api/locations/cities`; 
  console.log(`[mockApi] Fetching all cities (flat) from: ${url}`);
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) throw await handleApiError(response, url);
    return response.json();
  } catch (error) {
    throw handleFetchError(error, url, "получения всех городов");
  }
};

export const getCities = async (): Promise<CityDto[]> => {
   console.warn("[mockApi] getCities is called, typically for forms. Consider updating forms to use hierarchical location selection if needed.");
   return getAllCitiesFlat();
};
