
import type {
  Page,
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
  CategoryDto, // For flat list if needed
  CategoryTreeDto, // For hierarchical categories
  RegionDto,
  DistrictDto,
  AdvertisementSearchCriteriaDto,
  AdvertisementImageDto,
} from '@/types/api';

const API_BASE_URL_FROM_ENV = process.env.NEXT_PUBLIC_API_BASE_URL;

const isValidApiBaseUrl = (url?: string): boolean => {
  if (!url || url.trim() === "" || url.toLowerCase() === "undefined") {
    return false;
  }
  try {
    new URL(url); // check if it's a valid URL structure
    return true;
  } catch (e) {
    console.warn(`Provided API_BASE_URL "${url}" is not a valid URL.`);
    return false;
  }
};

const API_BASE_URL = isValidApiBaseUrl(API_BASE_URL_FROM_ENV) ? API_BASE_URL_FROM_ENV : undefined;


const getAssetBaseUrl = (): string => {
  if (!API_BASE_URL) return '';
  try {
    const url = new URL(API_BASE_URL);
    let basePath = url.origin;
    // If API_BASE_URL includes /api, remove it for asset base
    if (url.pathname.endsWith('/api')) {
        basePath += url.pathname.substring(0, url.pathname.length - '/api'.length);
    } else {
        basePath += url.pathname; // Or just use the pathname if it doesn't end with /api
    }
    // Ensure no trailing slash for consistency
    return basePath.replace(/\/$/, '');

  } catch (error) {
    // Fallback for relative paths if API_BASE_URL is just a path like /api
    return API_BASE_URL_FROM_ENV && API_BASE_URL_FROM_ENV.startsWith('/') ? API_BASE_URL_FROM_ENV.replace(/\/api$/, '').replace(/\/$/, '') : '';
  }
};


const toAbsoluteImageUrl = (relativePath?: string): string | undefined => {
  if (!relativePath) return undefined;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  const assetBase = getAssetBaseUrl();
  // Ensure relativePath starts with a slash if assetBase is present
  if (assetBase && relativePath.startsWith('/')) {
    return `${assetBase}${relativePath}`;
  }
  // If assetBase is empty (e.g. API_BASE_URL was just /api), and relativePath is /uploads/...
  // it might correctly resolve if the Next.js app serves from root.
  // Or if assetBase is like http://localhost:8080 and relativePath is uploads/... (no leading slash)
  // this might need adjustment based on actual API response. Assuming API provides /uploads/...
  if (assetBase) return `${assetBase}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
  return relativePath; // Fallback, might be incorrect if assetBase is needed
};


// MOCK DATA (simplified for brevity, extend as needed)
let mockRegions: RegionDto[] = [
  { id: 1, name: "Минская область" },
  { id: 2, name: "Гомельская область" },
];

let mockDistricts: DistrictDto[] = [
  { id: 11, name: "Минский район" }, { id: 12, name: "Борисовский район" },
  { id: 21, name: "Гомельский район" }, { id: 22, name: "Жлобинский район" },
];
// Simulate relation: districtId to regionId (not in DTO but needed for mock)
const mockDistrictToRegionMap: { [districtId: number]: number } = { 11:1, 12:1, 21:2, 22:2 };


let mockCities: CityDto[] = [
  { id: 1, name: 'Минск' }, { id: 2, name: 'Гомель' }, { id: 3, name: 'Борисов' }, { id: 4, name: 'Жлобин' }
];
// Simulate relation: cityId to districtId
const mockCityToDistrictMap: { [cityId: number]: number } = { 1:11, 2:21, 3:12, 4:22 };


let mockCategoryTree: CategoryTreeDto[] = [
  { id: 1, name: 'Электроника', children: [
    { id: 11, name: 'Телефоны', children: [] },
    { id: 12, name: 'Компьютеры', children: [
      { id: 121, name: 'Ноутбуки', children: [] },
      { id: 122, name: 'Комплектующие', children: [] },
    ]},
  ]},
  { id: 2, name: 'Недвижимость', children: [] },
  { id: 3, name: 'Хобби и отдых', children: [] },
];

let mockAds: AdvertisementDetailDto[] = Array.from({ length: 25 }, (_, i) => ({
  id: 101 + i,
  title: `Продам ${i % 2 === 0 ? 'ноутбук' : 'велосипед'} #${101 + i}`,
  price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
  cityId: (i % 4) + 1, // Use one of the 4 mock cities
  cityName: mockCities.find(c=>c.id === (i%4)+1)?.name || 'Неизвестный город',
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  previewImageUrl: `https://placehold.co/300x200.png?text=Ad+${101 + i}`,
  description: `Отличный товар #${101 + i}, почти новый. Использовался очень бережно, продаю в связи с переездом. Много текста чтобы описание было длинным и занимало несколько строк.`,
  updatedAt: new Date().toISOString(),
  status: 'ACTIVE',
  condition: i % 2 === 0 ? 'USED_GOOD' : 'NEW',
  categoryId: i % 3 === 0 ? 121 : (i % 3 === 1 ? 11 : 2), // Example category IDs from tree
  categoryName: i % 3 === 0 ? 'Ноутбуки' : (i % 3 === 1 ? 'Телефоны' : 'Недвижимость'),
  sellerId: 12 + (i % 2),
  sellerName: i % 2 === 0 ? 'Иван Петров' : 'Анна Иванова',
  images: [
    { id: 201 + i * 3, imageUrl: `https://placehold.co/600x400.png?text=Image+1+Ad+${101+i}`, isPreview: true },
    { id: 202 + i * 3, imageUrl: `https://placehold.co/600x400.png?text=Image+2+Ad+${101+i}`, isPreview: false },
    { id: 203 + i * 3, imageUrl: `https://placehold.co/600x400.png?text=Image+3+Ad+${101+i}`, isPreview: false },
  ].map(img => ({...img, imageUrl: img.imageUrl!})),
}));

let mockUsers: UserProfileDto[] = [
  {
    id: 12,
    fullName: 'Иван Петров',
    email: 'user@example.com',
    cityId: 1,
    cityName: 'Минск',
    phoneNumber: '375291234567',
    registeredAt: '2025-01-15T14:30:00.000Z',
    totalActiveAdvertisements: mockAds.filter(ad => ad.sellerId === 12 && ad.status === 'ACTIVE').length,
    avatarUrl: 'https://placehold.co/100x100.png?text=IP',
  },
  {
    id: 13,
    fullName: 'Анна Иванова',
    email: 'anna@example.com',
    cityId: 2,
    cityName: 'Гомель',
    phoneNumber: '375337654321',
    registeredAt: '2024-11-10T10:20:00.000Z',
    totalActiveAdvertisements: mockAds.filter(ad => ad.sellerId === 13 && ad.status === 'ACTIVE').length,
    avatarUrl: 'https://placehold.co/100x100.png?text=AI',
  },
];

const toAdvertisementResponseDto = (ad: AdvertisementDetailDto | AdvertisementResponseDto): AdvertisementResponseDto => ({
  id: ad.id,
  title: ad.title,
  price: ad.price,
  cityId: ad.cityId,
  cityName: ad.cityName,
  createdAt: ad.createdAt,
  previewImageUrl: toAbsoluteImageUrl(ad.previewImageUrl || (ad as AdvertisementDetailDto).images?.find(img => img.isPreview)?.imageUrl),
});

// --- API Functions ---

export const getRegions = async (): Promise<RegionDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for getRegions");
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockRegions];
  }
  const url = `${API_BASE_URL}/locations/regions`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Could not read error response text from ${url}`);
      console.error(`Failed to fetch regions. Status: ${response.status}, URL: ${url}, Response: ${errorText}`);
      throw new Error(`Failed to fetch regions. Status: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Network error or invalid URL when fetching regions from ${url}:`, error);
    throw new Error(`Network error or invalid URL when fetching regions. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

export const getDistrictsByRegion = async (regionId: number): Promise<DistrictDto[]> => {
   if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for getDistrictsByRegion");
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockDistricts.filter(d => mockDistrictToRegionMap[d.id] === regionId);
  }
  const url = `${API_BASE_URL}/locations/districts?regionId=${regionId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Could not read error response text from ${url}`);
      console.error(`Failed to fetch districts for region ${regionId}. Status: ${response.status}, URL: ${url}, Response: ${errorText}`);
      throw new Error(`Failed to fetch districts for region ${regionId}. Status: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Network error or invalid URL when fetching districts for region ${regionId} from ${url}:`, error);
    throw new Error(`Network error or invalid URL when fetching districts. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

export const getCitiesByDistrict = async (districtId: number): Promise<CityDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for getCitiesByDistrict");
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockCities.filter(c => mockCityToDistrictMap[c.id] === districtId);
  }
  const url = `${API_BASE_URL}/locations/cities?districtId=${districtId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Could not read error response text from ${url}`);
      console.error(`Failed to fetch cities for district ${districtId}. Status: ${response.status}, URL: ${url}, Response: ${errorText}`);
      throw new Error(`Failed to fetch cities for district ${districtId}. Status: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Network error or invalid URL when fetching cities for district ${districtId} from ${url}:`, error);
    throw new Error(`Network error or invalid URL when fetching cities. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

export const getCategoriesAsTree = async (): Promise<CategoryTreeDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for getCategoriesAsTree");
    await new Promise(resolve => setTimeout(resolve, 100));
    // Deep clone mock data to prevent accidental modification
    return JSON.parse(JSON.stringify(mockCategoryTree));
  }
  const url = `${API_BASE_URL}/categories/tree`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Could not read error response text from ${url}`);
      console.error(`Failed to fetch category tree. Status: ${response.status}, URL: ${url}, Response: ${errorText}`);
      throw new Error(`Failed to fetch category tree. Status: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Network error or invalid URL when fetching category tree from ${url}:`, error);
    throw new Error(`Network error or invalid URL when fetching category tree. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

export const searchAds = async (
  criteria: AdvertisementSearchCriteriaDto,
  token?: string | null
): Promise<Page<AdvertisementResponseDto>> => {
  const { page = 0, size = 12, sort = 'createdAt,desc', ...filters } = criteria;

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for searchAds");
    await new Promise(resolve => setTimeout(resolve, 100));
    let filteredMockAds = [...mockAds];
    if (filters.keyword) filteredMockAds = filteredMockAds.filter(ad => ad.title.toLowerCase().includes(filters.keyword!.toLowerCase()) || ad.description.toLowerCase().includes(filters.keyword!.toLowerCase()));
    if (filters.cityId) filteredMockAds = filteredMockAds.filter(ad => ad.cityId === filters.cityId);
    // Add filtering for regionId and districtId if needed for mock, though API likely handles this server-side based on cityId.
    // For mock, we might need to derive cityIds from region/district if those are passed.
    if (filters.minPrice) filteredMockAds = filteredMockAds.filter(ad => ad.price >= filters.minPrice!);
    if (filters.maxPrice) filteredMockAds = filteredMockAds.filter(ad => ad.price <= filters.maxPrice!);
    if (filters.categoryId) filteredMockAds = filteredMockAds.filter(ad => ad.categoryId === filters.categoryId); // Or check against a flattened tree
    if (filters.condition) filteredMockAds = filteredMockAds.filter(ad => ad.condition === filters.condition);
    if (filters.sellerId) filteredMockAds = filteredMockAds.filter(ad => ad.sellerId === filters.sellerId);

    if (sort === 'createdAt,desc') {
        filteredMockAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const totalElements = filteredMockAds.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = filteredMockAds.slice(page * size, (page + 1) * size).map(toAdvertisementResponseDto);
    return { content, totalPages, totalElements, size, number: page, pageable: {} as any, sort: {} as any, last: page >= totalPages -1, first: page === 0, numberOfElements: content.length, empty: content.length === 0 };
  }

  const queryParams = new URLSearchParams({ page: page.toString(), size: size.toString(), sort: sort });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) queryParams.append(key, String(value));
  });
  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
  const url = `${API_BASE_URL}/ads/search?${queryParams.toString()}`;

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Could not read error response text for searchAds from ${url}`);
      console.error(`Failed to search ads. Status: ${response.status}, URL: ${url}, Response: ${errorText}`);
      throw new Error(`Failed to search ads. Status: ${response.status}. ${errorText}`);
    }
    const data: Page<AdvertisementResponseDto> = await response.json();
    data.content = data.content.map(ad => ({ ...ad, previewImageUrl: toAbsoluteImageUrl(ad.previewImageUrl) }));
    return data;
  } catch (error) {
    console.error(`Network error or invalid URL when searching ads from ${url}:`, error);
    throw new Error(`Network error or invalid URL when searching ads. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};


export const getAdById = async (id: number): Promise<AdvertisementDetailDto | null> => {
   if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for getAdById");
    await new Promise(resolve => setTimeout(resolve, 100));
    const ad = mockAds.find(ad_ => ad_.id === id);
    if (ad) {
      const clonedAd = JSON.parse(JSON.stringify(ad)); // Deep clone
      clonedAd.images = clonedAd.images.map((img: AdvertisementImageDto) => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
      clonedAd.previewImageUrl = clonedAd.images.find((img: AdvertisementImageDto) => img.isPreview)?.imageUrl || toAbsoluteImageUrl(clonedAd.images[0]?.imageUrl);
      return clonedAd;
    }
    return null;
  }
  const url = `${API_BASE_URL}/ads/${id}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) return null;
      const errorText = await response.text().catch(() => `Could not read error response text from ${url}`);
      console.error(`Failed to fetch ad ${id}. Status: ${response.status}, URL: ${url}, Response: ${errorText}`);
      throw new Error(`Failed to fetch ad ${id}. Status: ${response.status}. ${errorText}`);
    }
    const ad: AdvertisementDetailDto = await response.json();
    if (ad) {
      ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
      ad.previewImageUrl = ad.images.find(img => img.isPreview)?.imageUrl || toAbsoluteImageUrl(ad.images[0]?.imageUrl) || toAbsoluteImageUrl(ad.previewImageUrl);
    }
    return ad;
  } catch (error) {
    console.error(`Network error or invalid URL when fetching ad ${id} from ${url}:`, error);
    throw new Error(`Network error or invalid URL when fetching ad ${id}. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

export const login = async (credentials: LoginRequestDto): Promise<JwtResponseDto> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for login");
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = mockUsers.find(u => u.email === credentials.email);
    if (user && credentials.password === 'password123') { // Simple mock password check
      return { token: `mock-jwt-token-for-${user.email}`, type: 'Bearer', userId: user.id, email: user.email, roles: ['ROLE_USER'] };
    }
    throw new Error('Invalid credentials (mock)');
  }
  const url = `${API_BASE_URL}/auth/login`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed with non-JSON response' }));
      console.error(`Login failed. Status: ${response.status}, URL: ${url}, Response: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Login failed. Status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Network error or invalid URL during login to ${url}:`, error);
    throw new Error(`Network error or invalid URL during login. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

export const register = async (data: UserRegistrationDto, avatar?: File): Promise<UserResponseDto> => {
  const formData = new FormData();
  formData.append('user', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (avatar) {
    formData.append('avatar', avatar);
  }

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for register");
    await new Promise(resolve => setTimeout(resolve, 100));
    if (mockUsers.some(u => u.email === data.email)) throw new Error('User with this email already exists (mock)');
    const newUserId = Math.max(...mockUsers.map(u => u.id), 0) + 1;
    const newUserProfileData: UserProfileDto = {
      id: newUserId, email: data.email, fullName: data.fullName, phoneNumber: data.phoneNumber, cityId: data.cityId,
      cityName: mockCities.find(c=>c.id === data.cityId)?.name || "Unknown City", registeredAt: new Date().toISOString(),
      avatarUrl: avatar ? toAbsoluteImageUrl(`/uploads/avatars/mock-avatar-${newUserId}.jpg`) : undefined,
      totalActiveAdvertisements: 0,
    };
    mockUsers.push(newUserProfileData);
    const { totalActiveAdvertisements, cityName, ...userResponsePartial } = newUserProfileData;
    const finalUserResponse: UserResponseDto = {
        ...userResponsePartial,
        cityId: newUserProfileData.cityId, // ensure cityId is part of UserResponseDto if not optional
        registeredAt: newUserProfileData.registeredAt,
    };
    return finalUserResponse;
  }
  const url = `${API_BASE_URL}/auth/register`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed with non-JSON response' }));
      console.error(`Registration failed. Status: ${response.status}, URL: ${url}, Response: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Registration failed. Status: ${response.status}`);
    }
    const userResponse: UserResponseDto = await response.json();
    userResponse.avatarUrl = toAbsoluteImageUrl(userResponse.avatarUrl);
    return userResponse;
  } catch (error) {
    console.error(`Network error or invalid URL during registration at ${url}:`, error);
    throw new Error(`Network error or invalid URL during registration. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

export const createAd = async (data: AdvertisementCreateDto, images: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
  const formData = new FormData();
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (images && images.length > 0) {
    images.forEach(file => formData.append('images', file));
  }

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for createAd");
    await new Promise(resolve => setTimeout(resolve, 100));
    const mockSeller = mockUsers[0];
    const newAdId = Math.max(...mockAds.map(ad => ad.id), 0) + 1;
    const createdImages: AdvertisementImageDto[] = images?.map((img, i) => ({
        id: Date.now() + i,
        imageUrl: toAbsoluteImageUrl(`/uploads/ads/mock-ad${newAdId}-img${i+1}.jpg`)!,
        isPreview: i === 0,
    })) || [{
        id: Date.now(),
        imageUrl: toAbsoluteImageUrl(`/uploads/ads/mock-ad${newAdId}.jpg`)!,
        isPreview: true
    }];
    const newAd: AdvertisementDetailDto = {
      id: newAdId, ...data,
      cityName: mockCities.find(c => c.id === data.cityId)?.name || 'Unknown City',
      categoryName: mockCategoryTree.flatMap(ct => ct.children.length > 0 ? ct.children : [ct]).find(c => c.id === data.categoryId)?.name || 'Unknown Category', // simplified mock
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'ACTIVE',
      sellerId: mockSeller.id, sellerName: mockSeller.fullName,
      images: createdImages,
      previewImageUrl: createdImages.find(img => img.isPreview)?.imageUrl,
    };
    mockAds.unshift(newAd);
    const sellerProfile = mockUsers.find(u => u.id === mockSeller.id);
    if (sellerProfile) sellerProfile.totalActiveAdvertisements +=1;
    return JSON.parse(JSON.stringify(newAd));
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_BASE_URL}/ads`;
  try {
    const response = await fetch(url, { method: 'POST', body: formData, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create ad with non-JSON response' }));
      console.error(`Failed to create ad. Status: ${response.status}, URL: ${url}, Response: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Failed to create ad. Status: ${response.status}`);
    }
    const ad: AdvertisementDetailDto = await response.json();
    ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
    ad.previewImageUrl = ad.images.find(img => img.isPreview)?.imageUrl || toAbsoluteImageUrl(ad.images[0]?.imageUrl) || toAbsoluteImageUrl(ad.previewImageUrl);
    return ad;
  } catch (error) {
    console.error(`Network error or invalid URL when creating ad at ${url}:`, error);
    throw new Error(`Network error or invalid URL when creating ad. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

export const updateAd = async (id: number, data: AdvertisementUpdateDto, newImages: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
  const formData = new FormData();
  // The 'advertisement' part should contain fields like title, description, price, categoryId, cityId, condition, status, AND imageIdsToDelete
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" }));

  if (newImages && newImages.length > 0) {
    newImages.forEach(file => formData.append('images', file));
  }

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for updateAd");
    await new Promise(resolve => setTimeout(resolve, 100));
    const adIndex = mockAds.findIndex(ad => ad.id === id);
    if (adIndex === -1) throw new Error('Advertisement not found (mock)');
    
    const existingAd = mockAds[adIndex];
    let updatedAd: AdvertisementDetailDto = { ...existingAd, ...data, updatedAt: new Date().toISOString() };
    if (data.cityId) updatedAd.cityName = mockCities.find(c => c.id === data.cityId)?.name || existingAd.cityName;
    if (data.categoryId) updatedAd.categoryName = mockCategoryTree.flatMap(ct => ct.children.length > 0 ? ct.children : [ct]).find(c => c.id === data.categoryId)?.name || existingAd.categoryName; // simplified mock

    // Handle imageIdsToDelete for mock
    if (data.imageIdsToDelete && data.imageIdsToDelete.length > 0) {
        updatedAd.images = updatedAd.images.filter(img => !data.imageIdsToDelete?.includes(img.id));
    }
    // Handle newImages for mock
    if (newImages && newImages.length > 0) {
        const addedImages: AdvertisementImageDto[] = newImages.map((img, i) => ({
            id: Date.now() + i + 2000, // ensure unique ID
            imageUrl: toAbsoluteImageUrl(`/uploads/ads/mock-updated-ad${id}-newimg${i+1}.jpg`)!,
            isPreview: updatedAd.images.length === 0 && i === 0, // make first new image preview if no existing images left
        }));
        updatedAd.images = [...updatedAd.images, ...addedImages];
        // Ensure only one preview
        let hasPreview = false;
        updatedAd.images = updatedAd.images.map(img => {
            if (img.isPreview && !hasPreview) { hasPreview = true; return img; }
            return {...img, isPreview: false};
        });
        if (!hasPreview && updatedAd.images.length > 0) updatedAd.images[0].isPreview = true;

    }
    updatedAd.previewImageUrl = updatedAd.images.find(img => img.isPreview)?.imageUrl || (updatedAd.images.length > 0 ? toAbsoluteImageUrl(updatedAd.images[0].imageUrl) : undefined);
    mockAds[adIndex] = updatedAd;
    return JSON.parse(JSON.stringify(updatedAd));
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_BASE_URL}/ads/${id}`;
  try {
    const response = await fetch(url, { method: 'PUT', body: formData, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update ad with non-JSON response' }));
      console.error(`Failed to update ad. Status: ${response.status}, URL: ${url}, Response: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Failed to update ad. Status: ${response.status}`);
    }
    const ad: AdvertisementDetailDto = await response.json();
    ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
    ad.previewImageUrl = ad.images.find(img => img.isPreview)?.imageUrl || toAbsoluteImageUrl(ad.images[0]?.imageUrl) || toAbsoluteImageUrl(ad.previewImageUrl);
    return ad;
  } catch (error) {
     console.error(`Network error or invalid URL when updating ad ${id} at ${url}:`, error);
    throw new Error(`Network error or invalid URL when updating ad ${id}. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

export const getUserProfile = async (userId: number): Promise<UserProfileDto | null> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for getUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
        const clonedUser = JSON.parse(JSON.stringify(user));
        clonedUser.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === userId && ad.status === 'ACTIVE').length;
        clonedUser.avatarUrl = toAbsoluteImageUrl(clonedUser.avatarUrl);
        return clonedUser;
    }
    return null;
  }

  const url = `${API_BASE_URL}/users/${userId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`User profile for userId ${userId} not found (404) at ${url}.`);
        return null;
      }
      const errorText = await response.text().catch(() => `Could not read error response text from ${url}`);
      console.error(`Failed to fetch user profile ${userId}. Status: ${response.status}, URL: ${url}, Response: ${errorText}`);
      throw new Error(`Failed to fetch user profile ${userId}. Status: ${response.status}. ${errorText}`);
    }
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl);
    return profile;
  } catch (error) {
    console.error(`Network error or invalid URL when fetching user profile ${userId} from ${url}:`, error);
    throw new Error(`Network error or invalid URL when fetching user profile ${userId}. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

export const getCurrentUserProfile = async (token: string): Promise<UserProfileDto | null> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for getCurrentUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    const mockJwtUser = mockUsers.find(u => `mock-jwt-token-for-${u.email}` === token) || mockUsers[0]; // Fallback to first user if specific token not matched
    if (mockJwtUser) {
        const clonedUser = JSON.parse(JSON.stringify(mockJwtUser));
        clonedUser.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === clonedUser.id && ad.status === 'ACTIVE').length;
        clonedUser.avatarUrl = toAbsoluteImageUrl(clonedUser.avatarUrl);
        return clonedUser;
    }
    return null;
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_BASE_URL}/users/me`;
  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404 || response.status === 401) {
        console.warn(`Current user profile not found or unauthorized (status: ${response.status}) at ${url}.`);
        return null;
      }
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || await response.text().catch(() => `Could not read error response text for getCurrentUserProfile from ${url}`);
      console.error(`Failed to fetch current user profile. Status: ${response.status}, URL: ${url}, Response: ${errorMessage}`);
      throw new Error(`Failed to fetch current user profile. Status: ${response.status}. ${errorMessage}`);
    }
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl);
    return profile;
  } catch (error) {
    console.error(`Network error or invalid URL when fetching current user profile from ${url}:`, error);
    throw new Error(`Network error or invalid URL when fetching current user profile. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

export const updateUserProfile = async (data: UserUpdateProfileDto, avatar: File | undefined, token: string): Promise<UserProfileDto> => {
  const formData = new FormData();
  formData.append('profile', new Blob([JSON.stringify(data)], { type: "application/json" }) );
  if (avatar) {
    formData.append('avatar', avatar);
  }

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for updateUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    let userToUpdateIdx = mockUsers.findIndex(u => `mock-jwt-token-for-${u.email}` === token);
    if (userToUpdateIdx === -1 && mockUsers.length > 0) userToUpdateIdx = 0; // Fallback for mock

    if (userToUpdateIdx !== -1) {
        const userToUpdate = mockUsers[userToUpdateIdx];
        const updatedUser: UserProfileDto = { ...userToUpdate, ...data, id: userToUpdate.id, email: userToUpdate.email, registeredAt: userToUpdate.registeredAt, totalActiveAdvertisements: userToUpdate.totalActiveAdvertisements };
        if (data.cityId) updatedUser.cityName = mockCities.find(c=>c.id === data.cityId)?.name || userToUpdate.cityName;
        if (avatar) updatedUser.avatarUrl = toAbsoluteImageUrl(`/uploads/avatars/mock-avatar-updated-${userToUpdate.id}.jpg`);

        mockUsers[userToUpdateIdx] = updatedUser;
        return JSON.parse(JSON.stringify(updatedUser));
    }
    throw new Error('User not found for update (mock)');
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_BASE_URL}/users/me`;
  try {
    const response = await fetch(url, { method: 'PUT', body: formData, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update profile with non-JSON response' }));
      console.error(`Failed to update profile. Status: ${response.status}, URL: ${url}, Response: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Failed to update profile. Status: ${response.status}`);
    }
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl);
    return profile;
  } catch (error) {
    console.error(`Network error or invalid URL when updating profile at ${url}:`, error);
    throw new Error(`Network error or invalid URL when updating profile. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};


export const deleteAd = async (adId: number, token: string): Promise<void> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for deleteAd");
    await new Promise(resolve => setTimeout(resolve, 100));
    const adIndex = mockAds.findIndex(ad => ad.id === adId);
    const mockCurrentUser = mockUsers.find(u => `mock-jwt-token-for-${u.email}` === token) || mockUsers[0];
    if (adIndex === -1 || (mockCurrentUser && mockAds[adIndex].sellerId !== mockCurrentUser.id) ) {
        throw new Error('Ad not found or user not authorized to delete (mock)');
    }
    const sellerId = mockAds[adIndex].sellerId;
    mockAds.splice(adIndex, 1);
    const seller = mockUsers.find(u => u.id === sellerId);
    if (seller) seller.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === sellerId && ad.status === 'ACTIVE').length;
    return;
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_BASE_URL}/ads/${adId}`;
  try {
    const response = await fetch(url, { method: 'DELETE', headers });

    if (!response.ok) { // For DELETE, 204 No Content is a success, response.ok will be true
      let errorMessage = `Failed to delete ad. Status: ${response.status}`;
      try {
        const errorBody = await response.text(); // Errors from your API might be text
        if (errorBody) {
            errorMessage += `. ${errorBody}`;
        }
      } catch (e) { /* ignore if cannot read body */ }
      console.error(`Failed to delete ad. Status: ${response.status}, URL: ${url}`);
      throw new Error(errorMessage);
    }
    // No return for 204
  } catch (error) {
    console.error(`Network error or invalid URL when deleting ad ${adId} at ${url}:`, error);
    throw new Error(`Network error or invalid URL when deleting ad ${adId}. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};
// Old getCategories (flat list) - might be deprecated or used for simpler scenarios
export const getCategories = async (): Promise<CategoryDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for getCategories (flat)");
    await new Promise(resolve => setTimeout(resolve, 100));
    // Flatten the tree for mock
    const flatten = (categories: CategoryTreeDto[]): CategoryDto[] => {
        let flat: CategoryDto[] = [];
        for (const cat of categories) {
            flat.push({ id: cat.id, name: cat.name });
            if (cat.children && cat.children.length > 0) {
                flat = flat.concat(flatten(cat.children));
            }
        }
        return flat;
    };
    return flatten(mockCategoryTree);
  }
  const url = `${API_BASE_URL}/categories`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Could not read error response text from ${url}`);
      console.error(`Failed to fetch categories. Status: ${response.status}, URL: ${url}, Response: ${errorText}`);
      throw new Error(`Failed to fetch categories. Status: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Network error or invalid URL when fetching categories from ${url}:`, error);
    throw new Error(`Network error or invalid URL when fetching categories. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

// Old getCities (flat list of all cities) - might be deprecated
// The new API suggests getting cities by district.
// If a flat list of all cities is still needed and supported by API at /api/cities (without params):
export const getAllCitiesFlat = async (): Promise<CityDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set or invalid, using mock data for getAllCitiesFlat");
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockCities]; // Returns all mock cities
  }
  // Check if your API supports a GET /api/cities or similar for all cities
  const url = `${API_BASE_URL}/locations/cities`; // Assuming /api/locations/cities without districtId returns all
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Could not read error response text from ${url}`);
      console.error(`Failed to fetch all cities. Status: ${response.status}, URL: ${url}, Response: ${errorText}`);
      throw new Error(`Failed to fetch all cities. Status: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Network error or invalid URL when fetching all cities from ${url}:`, error);
    throw new Error(`Network error or invalid URL when fetching all cities. URL: ${url}. Original error: ${(error as Error).message}`);
  }
};

// Function to get a flat list of all cities for RegisterForm/ProfileForm, if API doesn't provide by district
// This is a placeholder; ideally, the API would provide a way to get all cities or the forms would use the hierarchy.
export const getCities = async (): Promise<CityDto[]> => {
  // For now, let's assume this means "get all cities" for simplicity in forms that used it before.
  // In a real app, this might need to be more sophisticated or forms adapted to hierarchical selection.
  return getAllCitiesFlat();
};
