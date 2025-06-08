
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
  CategoryDto,
  AdvertisementSearchCriteriaDto,
  AdvertisementImageDto,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper to get the base URL for assets, removing /api if present
const getAssetBaseUrl = (): string => {
  if (!API_BASE_URL) return '';
  return API_BASE_URL.replace(/\/api$/, '');
};

// Helper to convert relative image URLs to absolute ones
const toAbsoluteImageUrl = (relativePath?: string): string | undefined => {
  if (!relativePath) return undefined;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath; // Already absolute
  }
  const assetBase = getAssetBaseUrl();
  if (assetBase && relativePath.startsWith('/')) {
    return `${assetBase}${relativePath}`;
  }
  // If API_BASE_URL is not set, or path is not relative starting with /, return as is.
  // This might mean some mock images won't load if API_BASE_URL isn't set and they are relative.
  return relativePath;
};


// Mock Data Storage
let mockAds: AdvertisementDetailDto[] = Array.from({ length: 25 }, (_, i) => ({
  id: 101 + i,
  title: `Продам ${i % 2 === 0 ? 'ноутбук' : 'велосипед'} #${101 + i}`,
  price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
  cityId: (i % 3) + 1,
  cityName: ['Минск', 'Гомель', 'Брест'][i % 3],
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  previewImageUrl: `https://placehold.co/300x200.png?text=Ad+${101 + i}`, // Placeholder, absolute
  description: `Отличный товар #${101 + i}, почти новый. Использовался очень бережно, продаю в связи с переездом. Много текста чтобы описание было длинным и занимало несколько строк.`,
  updatedAt: new Date().toISOString(),
  status: 'ACTIVE',
  condition: i % 2 === 0 ? 'USED_GOOD' : 'NEW',
  categoryId: (i % 5) + 1,
  categoryName: ['Ноутбуки', 'Велосипеды', 'Телефоны', 'Мебель', 'Книги'][i % 5],
  sellerId: 12 + (i % 2),
  sellerName: i % 2 === 0 ? 'Иван Петров' : 'Анна Иванова',
  images: [
    { id: 201 + i * 3, imageUrl: `https://placehold.co/600x400.png?text=Image+1+Ad+${101+i}`, isPreview: true },
    { id: 202 + i * 3, imageUrl: `https://placehold.co/600x400.png?text=Image+2+Ad+${101+i}`, isPreview: false },
    { id: 203 + i * 3, imageUrl: `https://placehold.co/600x400.png?text=Image+3+Ad+${101+i}`, isPreview: false },
  ].map(img => ({...img, imageUrl: img.imageUrl!})), // Ensure imageUrl is string for map
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
    avatarUrl: 'https://placehold.co/100x100.png?text=IP', // Placeholder, absolute
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
    avatarUrl: 'https://placehold.co/100x100.png?text=AI', // Placeholder, absolute
  },
];

const mockCities: CityDto[] = [
  { id: 1, name: 'Минск' }, { id: 2, name: 'Гомель' }, { id: 3, name: 'Брест' },
  { id: 4, name: 'Витебск' }, { id: 5, name: 'Гродно' }, { id: 6, name: 'Могилев' },
];

const mockCategories: CategoryDto[] = [
  { id: 1, name: 'Электроника' }, { id: 2, name: 'Недвижимость' }, { id: 3, name: 'Хобби и отдых' },
  { id: 4, name: 'Мебель' }, { id: 5, name: 'Книги' }, { id: 6, name: 'Автомобили' }, { id: 7, name: 'Одежда' },
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


export const getAds = async (
  page: number = 0,
  size: number = 10,
  sort: string = 'createdAt,desc',
  token?: string | null
): Promise<Page<AdvertisementResponseDto>> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for getAds (simple list)");
    await new Promise(resolve => setTimeout(resolve, 100));
    let sortedAds = [...mockAds];
    if (sort === 'createdAt,desc') {
        sortedAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const totalElements = sortedAds.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = sortedAds.slice(page * size, (page + 1) * size).map(toAdvertisementResponseDto);
    return { content, totalPages, totalElements, size, number: page, pageable: {} as any, sort: {} as any, last: page >= totalPages -1, first: page === 0, numberOfElements: content.length, empty: content.length === 0 };
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: sort,
  });
  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
  const response = await fetch(`${API_BASE_URL}/ads?${queryParams.toString()}`, { headers });

  if (!response.ok) {
    const errorText = await response.text().catch(() => `Could not read error response text from ${response.url}`);
    console.error(`Failed to fetch ads (simple list). Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to fetch ads. Status: ${response.status}. ${errorText}`);
  }
  const data: Page<AdvertisementResponseDto> = await response.json();
  data.content = data.content.map(ad => ({ ...ad, previewImageUrl: toAbsoluteImageUrl(ad.previewImageUrl) }));
  return data;
};

export const searchAds = async (
  criteria: AdvertisementSearchCriteriaDto,
  token?: string | null
): Promise<Page<AdvertisementResponseDto>> => {
  const { page = 0, size = 12, sort = 'createdAt,desc', ...filters } = criteria;

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for searchAds");
    await new Promise(resolve => setTimeout(resolve, 100));
    let filteredMockAds = [...mockAds];
    if (filters.keyword) filteredMockAds = filteredMockAds.filter(ad => ad.title.toLowerCase().includes(filters.keyword!.toLowerCase()) || ad.description.toLowerCase().includes(filters.keyword!.toLowerCase()));
    if (filters.cityId) filteredMockAds = filteredMockAds.filter(ad => ad.cityId === filters.cityId);
    if (filters.minPrice) filteredMockAds = filteredMockAds.filter(ad => ad.price >= filters.minPrice!);
    if (filters.maxPrice) filteredMockAds = filteredMockAds.filter(ad => ad.price <= filters.maxPrice!);
    if (filters.categoryId) filteredMockAds = filteredMockAds.filter(ad => ad.categoryId === filters.categoryId);
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
    if (value !== undefined) queryParams.append(key, String(value));
  });
  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
  const response = await fetch(`${API_BASE_URL}/ads/search?${queryParams.toString()}`, { headers });

  if (!response.ok) {
    const errorText = await response.text().catch(() => `Could not read error response text for searchAds from ${response.url}`);
    console.error(`Failed to search ads. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to search ads. Status: ${response.status}. ${errorText}`);
  }
  const data: Page<AdvertisementResponseDto> = await response.json();
  data.content = data.content.map(ad => ({ ...ad, previewImageUrl: toAbsoluteImageUrl(ad.previewImageUrl) }));
  return data;
};


export const getAdById = async (id: number): Promise<AdvertisementDetailDto | null> => {
   if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for getAdById");
    await new Promise(resolve => setTimeout(resolve, 100));
    const ad = mockAds.find(ad => ad.id === id);
    if (ad) {
      // Ensure mock data also uses absolute URLs if API_BASE_URL is hypothetically set for mocks, though current mocks use placehold.co
      ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
      ad.previewImageUrl = ad.images.find(img => img.isPreview)?.imageUrl || toAbsoluteImageUrl(ad.images[0]?.imageUrl);
    }
    return ad || null;
  }
  const response = await fetch(`${API_BASE_URL}/ads/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorText = await response.text().catch(() => `Could not read error response text from ${response.url}`);
    console.error(`Failed to fetch ad ${id}. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to fetch ad ${id}. Status: ${response.status}. ${errorText}`);
  }
  const ad: AdvertisementDetailDto = await response.json();
  if (ad) {
    ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
    // Ensure previewImageUrl is also absolute if derived or present
    ad.previewImageUrl = ad.images.find(img => img.isPreview)?.imageUrl || toAbsoluteImageUrl(ad.images[0]?.imageUrl) || toAbsoluteImageUrl(ad.previewImageUrl);
  }
  return ad;
};

export const login = async (credentials: LoginRequestDto): Promise<JwtResponseDto> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for login");
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = mockUsers.find(u => u.email === credentials.email);
    if (user && credentials.password === 'password123') { 
      return { token: `mock-jwt-token-for-${user.email}`, type: 'Bearer', userId: user.id, email: user.email, roles: ['ROLE_USER'] };
    }
    throw new Error('Invalid credentials (mock)');
  }

  const response = await fetch(`${API_BASE_URL}/auth/login`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
    console.error(`Login failed. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || `Login failed. Status: ${response.status}`);
  }
  return response.json();
};

export const register = async (data: UserRegistrationDto, avatar?: File): Promise<UserResponseDto> => {
  const formData = new FormData();
  formData.append('user', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (avatar) {
    formData.append('avatar', avatar);
  }

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for register");
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
    const { totalActiveAdvertisements, cityName, ...userResponse } = newUserProfileData as Omit<UserProfileDto, 'cityName'> & { cityName?: string }; // Cast to handle potential undefined cityName from find
    return userResponse as UserResponseDto;
  }

  const response = await fetch(`${API_BASE_URL}/auth/register`, { 
    method: 'POST',
    body: formData, 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
    console.error(`Registration failed. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || `Registration failed. Status: ${response.status}`);
  }
  const userResponse: UserResponseDto = await response.json();
  userResponse.avatarUrl = toAbsoluteImageUrl(userResponse.avatarUrl);
  return userResponse;
};

export const createAd = async (data: AdvertisementCreateDto, images: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
  const formData = new FormData();
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (images) {
    images.forEach(file => formData.append('images', file));
  }
  
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for createAd");
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
      categoryName: mockCategories.find(c => c.id === data.categoryId)?.name || 'Unknown Category',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'ACTIVE',
      sellerId: mockSeller.id, sellerName: mockSeller.fullName,
      images: createdImages,
      previewImageUrl: createdImages.find(img => img.isPreview)?.imageUrl,
    };
    mockAds.unshift(newAd);
    mockSeller.totalActiveAdvertisements +=1;
    return newAd;
  }
  
  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const response = await fetch(`${API_BASE_URL}/ads`, { method: 'POST', body: formData, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create ad' }));
    console.error(`Failed to create ad. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || `Failed to create ad. Status: ${response.status}`);
  }
  const ad: AdvertisementDetailDto = await response.json();
  ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
  ad.previewImageUrl = ad.images.find(img => img.isPreview)?.imageUrl || toAbsoluteImageUrl(ad.images[0]?.imageUrl) || toAbsoluteImageUrl(ad.previewImageUrl);
  return ad;
};

export const updateAd = async (id: number, data: AdvertisementUpdateDto, images: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
  const formData = new FormData();
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (images) {
    images.forEach(file => formData.append('images', file));
  }

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for updateAd");
    await new Promise(resolve => setTimeout(resolve, 100));
    const adIndex = mockAds.findIndex(ad => ad.id === id);
    if (adIndex === -1) throw new Error('Advertisement not found (mock)');
    const existingAd = mockAds[adIndex];
    let updatedAd: AdvertisementDetailDto = { ...existingAd, ...data, updatedAt: new Date().toISOString() };
    if (data.cityId) updatedAd.cityName = mockCities.find(c => c.id === data.cityId)?.name || existingAd.cityName;
    if (data.categoryId) updatedAd.categoryName = mockCategories.find(c => c.id === data.categoryId)?.name || existingAd.categoryName;
    
    if (images && images.length > 0) {
      updatedAd.images = images.map((img, i) => ({ id: Date.now() + i + 1000, imageUrl: toAbsoluteImageUrl(`/uploads/ads/mock-updated-ad${id}-img${i+1}.jpg`)!, isPreview: i === 0 }));
    } else if (images && images.length === 0) {
        updatedAd.images = [];
    }
    updatedAd.previewImageUrl = updatedAd.images.find(img => img.isPreview)?.imageUrl || (updatedAd.images.length > 0 ? updatedAd.images[0].imageUrl : undefined);
    mockAds[adIndex] = updatedAd;
    return updatedAd;
  }
  
  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const response = await fetch(`${API_BASE_URL}/ads/${id}`, { method: 'PUT', body: formData, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update ad' }));
    console.error(`Failed to update ad. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || `Failed to update ad. Status: ${response.status}`);
  }
  const ad: AdvertisementDetailDto = await response.json();
  ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
  ad.previewImageUrl = ad.images.find(img => img.isPreview)?.imageUrl || toAbsoluteImageUrl(ad.images[0]?.imageUrl) || toAbsoluteImageUrl(ad.previewImageUrl);
  return ad;
};

export const getUserProfile = async (userId: number): Promise<UserProfileDto | null> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for getUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
        user.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === userId && ad.status === 'ACTIVE').length;
        user.avatarUrl = toAbsoluteImageUrl(user.avatarUrl); // Though mock uses placehold.co
    }
    return user || null;
  }
  
  const response = await fetch(`${API_BASE_URL}/users/${userId}`); 
  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`User profile for userId ${userId} not found (404) at ${response.url}.`);
      return null;
    }
    const errorText = await response.text().catch(() => `Could not read error response text from ${response.url}`);
    console.error(`Failed to fetch user profile ${userId}. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to fetch user profile ${userId}. Status: ${response.status}. ${errorText}`);
  }
  const profile: UserProfileDto = await response.json();
  profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl);
  return profile;
};

export const getCurrentUserProfile = async (token: string): Promise<UserProfileDto | null> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for getCurrentUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    const mockJwtUser = mockUsers.find(u => `mock-jwt-token-for-${u.email}` === token) || mockUsers[0];
    if (mockJwtUser) {
        mockJwtUser.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === mockJwtUser.id && ad.status === 'ACTIVE').length;
        mockJwtUser.avatarUrl = toAbsoluteImageUrl(mockJwtUser.avatarUrl); // Though mock uses placehold.co
        return mockJwtUser;
    }
    return null;
  }
  
  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const response = await fetch(`${API_BASE_URL}/users/me`, { headers }); 

  if (!response.ok) {
    if (response.status === 404 || response.status === 401) {
      console.warn(`User profile not found or unauthorized (status: ${response.status}) at ${response.url}.`);
      return null;
    }
    const errorText = await response.text().catch(() => `Could not read error response text for getCurrentUserProfile from ${response.url}`);
    console.error(`Failed to fetch current user profile. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to fetch current user profile. Status: ${response.status}. ${errorText}`);
  }
  const profile: UserProfileDto = await response.json();
  profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl);
  return profile;
};

export const updateUserProfile = async (data: UserUpdateProfileDto, avatar: File | undefined, token: string): Promise<UserProfileDto> => {
  const formData = new FormData();
  formData.append('profile', new Blob([JSON.stringify(data)], { type: "application/json" }) );
  if (avatar) {
    formData.append('avatar', avatar);
  }

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for updateUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    let userToUpdate: UserProfileDto | undefined = mockUsers.find(u => `mock-jwt-token-for-${u.email}` === token);
    if (!userToUpdate && mockUsers.length > 0) userToUpdate = mockUsers[0]; // Fallback

    if (userToUpdate) {
        const updatedUser: UserProfileDto = { ...userToUpdate, ...data };
        if (data.cityId) updatedUser.cityName = mockCities.find(c=>c.id === data.cityId)?.name || userToUpdate.cityName;
        if (avatar) updatedUser.avatarUrl = toAbsoluteImageUrl(`/uploads/avatars/mock-avatar-updated-${userToUpdate.id}.jpg`);
        
        const userIndex = mockUsers.findIndex(u => u.id === userToUpdate!.id);
        if (userIndex !== -1) mockUsers[userIndex] = updatedUser;
        return updatedUser;
    }
    throw new Error('User not found for update (mock)');
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const response = await fetch(`${API_BASE_URL}/users/me`, { method: 'PUT', body: formData, headers });

  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
    console.error(`Failed to update profile. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || `Failed to update profile. Status: ${response.status}`);
  }
  const profile: UserProfileDto = await response.json();
  profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl);
  return profile;
};

export const getCities = async (): Promise<CityDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for getCities");
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockCities;
  }
  const response = await fetch(`${API_BASE_URL}/cities`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Could not read error response text from ${response.url}`);
    console.error(`Failed to fetch cities. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to fetch cities. Status: ${response.status}. ${errorText}`);
  }
  return response.json();
};

export const getCategories = async (): Promise<CategoryDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for getCategories");
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockCategories;
  }
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Could not read error response text from ${response.url}`);
    console.error(`Failed to fetch categories. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to fetch categories. Status: ${response.status}. ${errorText}`);
  }
  return response.json();
};

export const deleteAd = async (adId: number, token: string): Promise<void> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for deleteAd");
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
  const response = await fetch(`${API_BASE_URL}/ads/${adId}`, { method: 'DELETE', headers });

  if (!response.ok) { 
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete ad' }));
    console.error(`Failed to delete ad. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || `Failed to delete ad. Status: ${response.status}`);
  }
};
