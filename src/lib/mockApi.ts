
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
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Mock Data Storage (оставляем на случай, если API_BASE_URL не задан или для отладки)
let mockAds: AdvertisementDetailDto[] = Array.from({ length: 25 }, (_, i) => ({
  id: 101 + i,
  title: `Продам ${i % 2 === 0 ? 'ноутбук' : 'велосипед'} #${101 + i}`,
  price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
  cityId: (i % 3) + 1,
  cityName: ['Минск', 'Гомель', 'Брест'][i % 3],
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  previewImageUrl: `https://placehold.co/300x200.png?text=Ad+${101 + i}`,
  description: `Отличный товар #${101 + i}, почти новый. Использовался очень бережно, продаю в связи с переездом. Много текста чтобы описание было длинным и занимало несколько строк.`,
  updatedAt: new Date().toISOString(),
  status: 'ACTIVE',
  condition: i % 2 === 0 ? 'USED_GOOD' : 'NEW',
  categoryId: (i % 5) + 1,
  categoryName: ['Ноутбуки', 'Велосипеды', 'Телефоны', 'Мебель', 'Книги'][i % 5],
  sellerId: 12 + (i % 2),
  sellerName: i % 2 === 0 ? 'Иван Петров' : 'Анна Иванова',
  images: [
    { id: 201 + i * 2, imageUrl: `https://placehold.co/600x400.png?text=Image+1+Ad+${101+i}`, isPreview: true },
    { id: 202 + i * 2, imageUrl: `https://placehold.co/600x400.png?text=Image+2+Ad+${101+i}`, isPreview: false },
    { id: 203 + i * 2, imageUrl: `https://placehold.co/600x400.png?text=Image+3+Ad+${101+i}`, isPreview: false },
  ],
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
    // roles: ['ROLE_USER'], // Roles are part of JwtResponseDto as per spec
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
    // roles: ['ROLE_USER'],
  },
];

const mockCities: CityDto[] = [
  { id: 1, name: 'Минск' },
  { id: 2, name: 'Гомель' },
  { id: 3, name: 'Брест' },
  { id: 4, name: 'Витебск' },
  { id: 5, name: 'Гродно' },
  { id: 6, name: 'Могилев' },
];

const mockCategories: CategoryDto[] = [
  { id: 1, name: 'Электроника' },
  { id: 2, name: 'Недвижимость' },
  { id: 3, name: 'Хобби и отдых' },
  { id: 4, name: 'Мебель' },
  { id: 5, name: 'Книги' },
  { id: 6, name: 'Автомобили' },
  { id: 7, name: 'Одежда' },
];

const toAdvertisementResponseDto = (ad: AdvertisementDetailDto): AdvertisementResponseDto => ({
  id: ad.id,
  title: ad.title,
  price: ad.price,
  cityId: ad.cityId,
  cityName: ad.cityName,
  createdAt: ad.createdAt,
  previewImageUrl: ad.images.find(img => img.isPreview)?.imageUrl || ad.images[0]?.imageUrl,
});

// For GET /api/ads (simple paginated list)
export const getAds = async (
  page: number = 0,
  size: number = 10,
  sort: string = 'createdAt,desc', // Default sort as per API spec example
  token?: string | null
): Promise<Page<AdvertisementResponseDto>> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for getAds (simple list)");
    await new Promise(resolve => setTimeout(resolve, 100));
    let sortedAds = [...mockAds];
    if (sort === 'createdAt,desc') {
        sortedAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // Add other sorting if necessary based on `sort` param
    const totalElements = sortedAds.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = sortedAds.slice(page * size, (page + 1) * size).map(toAdvertisementResponseDto);
    return { content, totalPages, totalElements, size, number: page };
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: sort,
  });

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/ads?${queryParams.toString()}`, { headers });
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Could not read error response text from ${response.url}`);
    console.error(`Failed to fetch ads (simple list). Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to fetch ads. Status: ${response.status}. ${errorText}`);
  }
  return response.json();
};

// For GET /api/ads/search (filtered and paginated list)
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
    return { content, totalPages, totalElements, size, number: page };
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: sort,
  });

  if (filters.keyword) queryParams.append('keyword', filters.keyword);
  if (filters.cityId) queryParams.append('cityId', filters.cityId.toString());
  if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
  if (filters.categoryId) queryParams.append('categoryId', filters.categoryId.toString());
  if (filters.condition) queryParams.append('condition', filters.condition);
  if (filters.sellerId) queryParams.append('sellerId', filters.sellerId.toString());

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/ads/search?${queryParams.toString()}`, { headers });
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Could not read error response text for searchAds from ${response.url}`);
    console.error(`Failed to search ads. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to search ads. Status: ${response.status}. ${errorText}`);
  }
  return response.json();
};


export const getAdById = async (id: number): Promise<AdvertisementDetailDto | null> => {
   if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for getAdById");
    await new Promise(resolve => setTimeout(resolve, 100));
    const ad = mockAds.find(ad => ad.id === id);
    return ad || null;
  }
  const response = await fetch(`${API_BASE_URL}/ads/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorText = await response.text().catch(() => `Could not read error response text from ${response.url}`);
    console.error(`Failed to fetch ad ${id}. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to fetch ad ${id}. Status: ${response.status}. ${errorText}`);
  }
  return response.json();
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
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for register");
    await new Promise(resolve => setTimeout(resolve, 100));
    if (mockUsers.some(u => u.email === data.email)) throw new Error('User with this email already exists (mock)');
    const newUserId = Math.max(...mockUsers.map(u => u.id), 0) + 1;
    const newUserProfile: UserProfileDto = {
      id: newUserId, email: data.email, fullName: data.fullName, phoneNumber: data.phoneNumber, cityId: data.cityId,
      cityName: mockCities.find(c=>c.id === data.cityId)?.name || "Unknown City", registeredAt: new Date().toISOString(),
      avatarUrl: avatar ? `/uploads/avatars/mock-avatar-${newUserId}.jpg` : undefined,
      totalActiveAdvertisements: 0,
    };
    mockUsers.push(newUserProfile);
    const { totalActiveAdvertisements, ...userResponse } = newUserProfile; 
    return userResponse as UserResponseDto; 
  }

  const formData = new FormData();
  formData.append('user', new Blob([JSON.stringify(data)], { type: "application/json" })); // Changed 'userDto' to 'user'
  if (avatar) {
    formData.append('avatar', avatar);
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
  return response.json();
};

export const createAd = async (data: AdvertisementCreateDto, images: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
   if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for createAd");
    await new Promise(resolve => setTimeout(resolve, 100));
    const mockSeller = mockUsers[0]; 
    const newAdId = Math.max(...mockAds.map(ad => ad.id), 0) + 1;
    const newAd: AdvertisementDetailDto = {
      id: newAdId, ...data, cityName: mockCities.find(c => c.id === data.cityId)?.name || 'Unknown City',
      categoryName: mockCategories.find(c => c.id === data.categoryId)?.name || 'Unknown Category',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'ACTIVE',
      sellerId: mockSeller.id, sellerName: mockSeller.fullName,
      images: images?.map((img, i) => ({ id: Date.now() + i, imageUrl: `/uploads/ads/mock-ad${newAdId}-img${i+1}.jpg`, isPreview: i === 0, })) || [{ id: Date.now(), imageUrl: `/uploads/ads/mock-ad${newAdId}.jpg`, isPreview: true }],
    };
    mockAds.unshift(newAd);
    mockSeller.totalActiveAdvertisements +=1;
    return newAd;
  }
  
  const formData = new FormData();
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" })); // Changed 'adDto' to 'advertisement'

  if (images) {
    images.forEach(file => formData.append('images', file));
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };

  const response = await fetch(`${API_BASE_URL}/ads`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create ad' }));
    console.error(`Failed to create ad. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || `Failed to create ad. Status: ${response.status}`);
  }
  return response.json();
};

export const updateAd = async (id: number, data: AdvertisementUpdateDto, images: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for updateAd");
    await new Promise(resolve => setTimeout(resolve, 100));
    const adIndex = mockAds.findIndex(ad => ad.id === id);
    if (adIndex === -1) throw new Error('Advertisement not found (mock)');
    const existingAd = mockAds[adIndex];
    const updatedAd: AdvertisementDetailDto = { ...existingAd, ...data, updatedAt: new Date().toISOString() };
    if (data.cityId) updatedAd.cityName = mockCities.find(c => c.id === data.cityId)?.name || existingAd.cityName;
    if (data.categoryId) updatedAd.categoryName = mockCategories.find(c => c.id === data.categoryId)?.name || existingAd.categoryName;
    if (images && images.length > 0) {
      updatedAd.images = images.map((img, i) => ({ id: Date.now() + i + 1000, imageUrl: `/uploads/ads/mock-updated-ad${id}-img${i+1}.jpg`, isPreview: i === 0, }));
    } else if (images && images.length === 0) { // Empty list sent, remove all images
        updatedAd.images = [];
    } // If images part is omitted, existing images are not changed (handled by spread existingAd)

    mockAds[adIndex] = updatedAd;
    return updatedAd;
  }

  const formData = new FormData();
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" })); // Changed 'adDto' to 'advertisement'
  if (images) { // If images array is provided (even if empty to delete all)
    images.forEach(file => formData.append('images', file));
  }
  
  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };

  const response = await fetch(`${API_BASE_URL}/ads/${id}`, {
    method: 'PUT',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update ad' }));
    console.error(`Failed to update ad. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || `Failed to update ad. Status: ${response.status}`);
  }
  return response.json();
};

// Get User Profile by ID (Public)
export const getUserProfile = async (userId: number): Promise<UserProfileDto | null> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for getUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = mockUsers.find(u => u.id === userId);
    if (user) user.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === userId && ad.status === 'ACTIVE').length;
    return user || null;
  }
  
  // Token is not required for this public endpoint as per spec
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
  return response.json();
};

// Get Current User's Profile (Authenticated)
export const getCurrentUserProfile = async (token: string): Promise<UserProfileDto | null> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for getCurrentUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    // Try to find user based on mock token or first user for simplicity
    const mockJwtUser = mockUsers.find(u => `mock-jwt-token-for-${u.email}` === token) || mockUsers[0];
    if (mockJwtUser) {
        mockJwtUser.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === mockJwtUser.id && ad.status === 'ACTIVE').length;
        return mockJwtUser;
    }
    return null;
  }
  
  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };

  const response = await fetch(`${API_BASE_URL}/users/me`, { headers }); 
  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`Current user profile not found (404) at ${response.url}. This might happen if token is invalid or user deleted.`);
      return null;
    }
     if (response.status === 401) { // Handle unauthorized specifically
      console.warn(`Unauthorized to fetch current user profile (401) at ${response.url}. Token might be expired or invalid.`);
      return null; 
    }
    const errorText = await response.text().catch(() => `Could not read error response text for getCurrentUserProfile from ${response.url}`);
    console.error(`Failed to fetch current user profile. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to fetch current user profile. Status: ${response.status}. ${errorText}`);
  }
  return response.json();
};

export const updateUserProfile = async (data: UserUpdateProfileDto, avatar: File | undefined, token: string): Promise<UserProfileDto> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for updateUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    const userIndex = mockUsers.findIndex(u => `mock-jwt-token-for-${u.email}` === token); // Mock: find by token
    if (userIndex === -1 && mockUsers.length > 0) { // fallback to first user if not found by mock token
        const firstUserIndex = 0;
        const existingUser = mockUsers[firstUserIndex];
        const updatedUser: UserProfileDto = { ...existingUser, ...data };
        if (data.cityId) updatedUser.cityName = mockCities.find(c=>c.id === data.cityId)?.name || existingUser.cityName;
        if (avatar) updatedUser.avatarUrl = `/uploads/avatars/mock-avatar-updated-${existingUser.id}.jpg`;
        mockUsers[firstUserIndex] = updatedUser;
        return updatedUser;
    } else if (userIndex !== -1) {
        const existingUser = mockUsers[userIndex];
        const updatedUser: UserProfileDto = { ...existingUser, ...data };
        if (data.cityId) updatedUser.cityName = mockCities.find(c=>c.id === data.cityId)?.name || existingUser.cityName;
        if (avatar) updatedUser.avatarUrl = `/uploads/avatars/mock-avatar-updated-${existingUser.id}.jpg`;
        mockUsers[userIndex] = updatedUser;
        return updatedUser;
    }
    throw new Error('User not found for update (mock)');
  }

  const formData = new FormData();
  formData.append('profile', new Blob([JSON.stringify(data)], { type: "application/json" }) ); // Changed 'profileDto' to 'profile'
  if (avatar) {
    formData.append('avatar', avatar);
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  
  const response = await fetch(`${API_BASE_URL}/users/me`, { // Endpoint is /api/users/me
    method: 'PUT',
    body: formData,
    headers,
  });

  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
    console.error(`Failed to update profile. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || `Failed to update profile. Status: ${response.status}`);
  }
  return response.json();
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
    // Mock authorization: assume token is for mockUsers[0] and check if they are seller
    const mockCurrentUser = mockUsers[0];
    if (adIndex === -1 || (mockAds[adIndex].sellerId !== mockCurrentUser.id) ) {
        throw new Error('Ad not found or user not authorized to delete (mock)');
    }
    const sellerId = mockAds[adIndex].sellerId;
    mockAds.splice(adIndex, 1);
    const seller = mockUsers.find(u => u.id === sellerId);
    if (seller) seller.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === sellerId && ad.status === 'ACTIVE').length;
    return;
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };

  const response = await fetch(`${API_BASE_URL}/ads/${adId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) { // Expect 204 No Content for success
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete ad' }));
    console.error(`Failed to delete ad. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || `Failed to delete ad. Status: ${response.status}`);
  }
  // For 204 No Content, there is no body to parse, so we just return
};
