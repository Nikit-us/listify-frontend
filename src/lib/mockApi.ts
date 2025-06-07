
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
  ImageDto,
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
    roles: ['ROLE_USER'],
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
    roles: ['ROLE_USER'],
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
  { id: 1, name: 'Ноутбуки' },
  { id: 2, name: 'Велосипеды' },
  { id: 3, name: 'Телефоны' },
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


export const getAds = async (
  page: number = 0,
  size: number = 10,
  filters?: { keyword?: string; cityId?: number; minPrice?: number; maxPrice?: number, categoryId?: number },
  token?: string | null
): Promise<Page<AdvertisementResponseDto>> => {
  if (!API_BASE_URL) { 
    console.warn("API_BASE_URL not set, using mock data for getAds");
    await new Promise(resolve => setTimeout(resolve, 100)); 
    let filteredAds = [...mockAds].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (filters) {
      if (filters.keyword) filteredAds = filteredAds.filter(ad => ad.title.toLowerCase().includes(filters.keyword!.toLowerCase()) || ad.description.toLowerCase().includes(filters.keyword!.toLowerCase()));
      if (filters.cityId) filteredAds = filteredAds.filter(ad => ad.cityId === filters.cityId);
      if (filters.minPrice) filteredAds = filteredAds.filter(ad => ad.price >= filters.minPrice!);
      if (filters.maxPrice) filteredAds = filteredAds.filter(ad => ad.price <= filters.maxPrice!);
      if (filters.categoryId) filteredAds = filteredAds.filter(ad => ad.categoryId === filters.categoryId);
    }
    const totalElements = filteredAds.length;
    const totalPages = Math.ceil(totalElements / size);
    const content = filteredAds.slice(page * size, (page + 1) * size).map(toAdvertisementResponseDto);
    return { content, totalPages, totalElements, size, number: page };
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  if (filters?.keyword) queryParams.append('keyword', filters.keyword);
  if (filters?.cityId) queryParams.append('cityId', filters.cityId.toString());
  if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
  if (filters?.categoryId) queryParams.append('categoryId', filters.categoryId.toString());
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/advertisements?${queryParams.toString()}`, { headers });
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Could not read error response text from ${response.url}`);
    console.error(`Failed to fetch ads. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error('Failed to fetch ads');
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
  const response = await fetch(`${API_BASE_URL}/advertisements/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorText = await response.text().catch(() => `Could not read error response text from ${response.url}`);
    console.error(`Failed to fetch ad ${id}. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to fetch ad ${id}`);
  }
  return response.json();
};

export const login = async (credentials: LoginRequestDto): Promise<JwtResponseDto> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for login");
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = mockUsers.find(u => u.email === credentials.email);
    if (user && credentials.password === 'password123') { // Ensure mockUsers have roles
      return { token: `mock-jwt-token-for-${user.email}`, type: 'Bearer', userId: user.id, email: user.email, roles: user.roles || ['ROLE_USER'] };
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
    throw new Error(errorData.message || 'Login failed');
  }
  return response.json();
};

export const register = async (data: UserRegistrationDto, avatar?: File): Promise<UserResponseDto> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for register");
    await new Promise(resolve => setTimeout(resolve, 100));
    if (mockUsers.some(u => u.email === data.email)) throw new Error('User with this email already exists (mock)');
    const newUserId = Math.max(...mockUsers.map(u => u.id), 0) + 1;
    const newUser: UserProfileDto = {
      id: newUserId, email: data.email, fullName: data.fullName, phoneNumber: data.phoneNumber, cityId: data.cityId,
      cityName: mockCities.find(c=>c.id === data.cityId)?.name || "Unknown City", registeredAt: new Date().toISOString(),
      avatarUrl: avatar ? `https://placehold.co/100x100.png?text=${data.fullName.substring(0,2).toUpperCase()}` : undefined,
      totalActiveAdvertisements: 0,
      roles: ['ROLE_USER'],
    };
    mockUsers.push(newUser);
    const { totalActiveAdvertisements, roles, ...userResponse } = newUser; // Exclude roles from UserResponseDto if not part of it
    return userResponse as UserResponseDto; // Cast if UserResponseDto doesn't include roles
  }

  const formData = new FormData();
  formData.append('userDto', new Blob([JSON.stringify(data)], { type: "application/json" }));
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
    throw new Error(errorData.message || 'Registration failed');
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
      images: images?.map((img, i) => ({ id: Date.now() + i, imageUrl: `https://placehold.co/600x400.png?text=NewAd+${newAdId}+Img${i+1}`, isPreview: i === 0, })) || [{ id: Date.now(), imageUrl: `https://placehold.co/600x400.png?text=NewAd+${newAdId}`, isPreview: true }],
    };
    mockAds.unshift(newAd);
    mockSeller.totalActiveAdvertisements +=1;
    return newAd;
  }
  
  const formData = new FormData();
  formData.append('adDto', new Blob([JSON.stringify(data)], { type: "application/json" }));

  if (images) {
    images.forEach(file => formData.append('images', file));
  }

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/advertisements`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create ad' }));
    console.error(`Failed to create ad. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || 'Failed to create ad');
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
      updatedAd.images = images.map((img, i) => ({ id: Date.now() + i + 1000, imageUrl: `https://placehold.co/600x400.png?text=UpdatedAd+${id}+Img${i+1}`, isPreview: i === 0, }));
    }
    mockAds[adIndex] = updatedAd;
    return updatedAd;
  }

  const formData = new FormData();
  formData.append('adDto', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (images && images.length > 0) {
    images.forEach(file => formData.append('images', file));
  }
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/advertisements/${id}`, {
    method: 'PUT',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update ad' }));
    console.error(`Failed to update ad. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || 'Failed to update ad');
  }
  return response.json();
};

export const getUserProfile = async (userId: number, token?: string): Promise<UserProfileDto | null> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for getUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = mockUsers.find(u => u.id === userId);
    if (user) user.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === userId && ad.status === 'ACTIVE').length;
    return user || null;
  }
  
  const headers: HeadersInit = {};
  if (token) { 
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, { headers }); 
  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`User profile for userId ${userId} not found (404) at ${response.url}. Check if the user exists or if the API endpoint is correct.`);
      return null;
    }
    const errorText = await response.text().catch(() => `Could not read error response text from ${response.url}`);
    console.error(`Failed to fetch user profile ${userId}. Status: ${response.status}, URL: ${response.url}, Response: ${errorText}`);
    throw new Error(`Failed to fetch user profile ${userId}`);
  }
  return response.json();
};

export const updateUserProfile = async (userId: number, data: UserUpdateProfileDto, avatar: File | undefined, token: string): Promise<UserProfileDto> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for updateUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found (mock)');
    const existingUser = mockUsers[userIndex];
    const updatedUser: UserProfileDto = { ...existingUser, ...data };
    if (data.cityId) updatedUser.cityName = mockCities.find(c=>c.id === data.cityId)?.name || existingUser.cityName;
    if (avatar) updatedUser.avatarUrl = `https://placehold.co/100x100.png?text=${updatedUser.fullName.substring(0,2).toUpperCase()}_new`;
    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  }

  const formData = new FormData();
  formData.append('profileDto', new Blob([JSON.stringify(data)], { type: "application/json" }) );
  if (avatar) {
    formData.append('avatar', avatar);
  }

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, { 
    method: 'PUT',
    body: formData,
    headers,
  });

  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
    console.error(`Failed to update profile. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || 'Failed to update profile');
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
    throw new Error('Failed to fetch cities');
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
    throw new Error('Failed to fetch categories');
  }
  return response.json();
};

export const deleteAd = async (adId: number, token: string): Promise<void> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL not set, using mock data for deleteAd");
    await new Promise(resolve => setTimeout(resolve, 100));
    const adIndex = mockAds.findIndex(ad => ad.id === adId);
    if (adIndex === -1) throw new Error('Ad not found or user not authorized to delete (mock)');
    const sellerId = mockAds[adIndex].sellerId;
    mockAds.splice(adIndex, 1);
    const seller = mockUsers.find(u => u.id === sellerId);
    if (seller) seller.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === sellerId && ad.status === 'ACTIVE').length;
    return;
  }

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/advertisements/${adId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete ad' }));
    console.error(`Failed to delete ad. Status: ${response.status}, URL: ${response.url}, Response: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.message || 'Failed to delete ad');
  }
};

// Ensure mock users have roles for consistent mock login responses
mockUsers = mockUsers.map(u => ({ ...u, roles: u.roles || ['ROLE_USER'] }));

    