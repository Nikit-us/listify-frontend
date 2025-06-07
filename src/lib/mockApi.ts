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

const MOCK_DELAY = 500;

// Mock Data Storage
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
  filters?: { keyword?: string; cityId?: number; minPrice?: number; maxPrice?: number, categoryId?: number }
): Promise<Page<AdvertisementResponseDto>> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  let filteredAds = [...mockAds].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (filters) {
    if (filters.keyword) {
      filteredAds = filteredAds.filter(ad => ad.title.toLowerCase().includes(filters.keyword!.toLowerCase()) || ad.description.toLowerCase().includes(filters.keyword!.toLowerCase()));
    }
    if (filters.cityId) {
      filteredAds = filteredAds.filter(ad => ad.cityId === filters.cityId);
    }
    if (filters.minPrice) {
      filteredAds = filteredAds.filter(ad => ad.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      filteredAds = filteredAds.filter(ad => ad.price <= filters.maxPrice!);
    }
    if (filters.categoryId) {
      filteredAds = filteredAds.filter(ad => ad.categoryId === filters.categoryId);
    }
  }

  const totalElements = filteredAds.length;
  const totalPages = Math.ceil(totalElements / size);
  const content = filteredAds.slice(page * size, (page + 1) * size).map(toAdvertisementResponseDto);
  
  return {
    content,
    totalPages,
    totalElements,
    size,
    number: page,
  };
};

export const getAdById = async (id: number): Promise<AdvertisementDetailDto | null> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const ad = mockAds.find(ad => ad.id === id);
  return ad || null;
};

export const login = async (credentials: LoginRequestDto): Promise<JwtResponseDto> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const user = mockUsers.find(u => u.email === credentials.email);
  // In a real app, you'd verify the password
  if (user && credentials.password === 'password123') { // Simplified password check
    return {
      token: `mock-jwt-token-for-${user.email}`,
      type: 'Bearer',
      userId: user.id,
      email: user.email,
      roles: ['ROLE_USER'],
    };
  }
  throw new Error('Invalid credentials');
};

export const register = async (data: UserRegistrationDto, avatar?: File): Promise<UserResponseDto> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  if (mockUsers.some(u => u.email === data.email)) {
    throw new Error('User with this email already exists');
  }
  const newUserId = Math.max(...mockUsers.map(u => u.id), 0) + 1;
  const newUser: UserProfileDto = {
    id: newUserId,
    email: data.email,
    fullName: data.fullName,
    phoneNumber: data.phoneNumber,
    cityId: data.cityId,
    cityName: mockCities.find(c=>c.id === data.cityId)?.name || "Unknown City",
    registeredAt: new Date().toISOString(),
    avatarUrl: avatar ? `https://placehold.co/100x100.png?text=${data.fullName.substring(0,2).toUpperCase()}` : undefined,
    totalActiveAdvertisements: 0,
  };
  mockUsers.push(newUser);
  const { totalActiveAdvertisements, ...userResponse } = newUser;
  return userResponse;
};

export const createAd = async (data: AdvertisementCreateDto, images?: File[], userId?: number): Promise<AdvertisementDetailDto> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  if (!userId) throw new Error("User not authenticated");
  
  const seller = mockUsers.find(u => u.id === userId);
  if (!seller) throw new Error("Seller not found");

  const newAdId = Math.max(...mockAds.map(ad => ad.id), 0) + 1;
  const newAd: AdvertisementDetailDto = {
    id: newAdId,
    ...data,
    cityName: mockCities.find(c => c.id === data.cityId)?.name || 'Unknown City',
    categoryName: mockCategories.find(c => c.id === data.categoryId)?.name || 'Unknown Category',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'ACTIVE',
    sellerId: seller.id,
    sellerName: seller.fullName,
    images: images?.map((img, i) => ({
      id: Date.now() + i,
      imageUrl: `https://placehold.co/600x400.png?text=NewAd+${newAdId}+Img${i+1}`,
      isPreview: i === 0,
    })) || [{ id: Date.now(), imageUrl: `https://placehold.co/600x400.png?text=NewAd+${newAdId}`, isPreview: true }],
  };
  mockAds.unshift(newAd); // Add to the beginning
  seller.totalActiveAdvertisements +=1;
  return newAd;
};

export const updateAd = async (id: number, data: AdvertisementUpdateDto, images?: File[]): Promise<AdvertisementDetailDto> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const adIndex = mockAds.findIndex(ad => ad.id === id);
  if (adIndex === -1) {
    throw new Error('Advertisement not found');
  }
  const existingAd = mockAds[adIndex];
  const updatedAd: AdvertisementDetailDto = {
    ...existingAd,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  if (data.cityId) updatedAd.cityName = mockCities.find(c => c.id === data.cityId)?.name || existingAd.cityName;
  if (data.categoryId) updatedAd.categoryName = mockCategories.find(c => c.id === data.categoryId)?.name || existingAd.categoryName;

  if (images && images.length > 0) {
    updatedAd.images = images.map((img, i) => ({
      id: Date.now() + i + 1000, // ensure unique IDs
      imageUrl: `https://placehold.co/600x400.png?text=UpdatedAd+${id}+Img${i+1}`,
      isPreview: i === 0,
    }));
  }
  
  mockAds[adIndex] = updatedAd;
  return updatedAd;
};

export const getUserProfile = async (userId: number): Promise<UserProfileDto | null> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    // Recalculate total active ads, in case some were created/deleted by mock fns
    user.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === userId && ad.status === 'ACTIVE').length;
  }
  return user || null;
};

export const updateUserProfile = async (userId: number, data: UserUpdateProfileDto, avatar?: File): Promise<UserProfileDto> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  const existingUser = mockUsers[userIndex];
  const updatedUser: UserProfileDto = {
    ...existingUser,
    ...data,
  };
  if (data.cityId) {
    updatedUser.cityName = mockCities.find(c=>c.id === data.cityId)?.name || existingUser.cityName;
  }
  if (avatar) {
    updatedUser.avatarUrl = `https://placehold.co/100x100.png?text=${updatedUser.fullName.substring(0,2).toUpperCase()}_new`;
  }
  mockUsers[userIndex] = updatedUser;
  return updatedUser;
};

export const getCities = async (): Promise<CityDto[]> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return mockCities;
};

export const getCategories = async (): Promise<CategoryDto[]> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return mockCategories;
};

export const deleteAd = async (adId: number, userId: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const adIndex = mockAds.findIndex(ad => ad.id === adId && ad.sellerId === userId);
  if (adIndex === -1) {
    throw new Error('Ad not found or user not authorized to delete');
  }
  mockAds.splice(adIndex, 1);
  const seller = mockUsers.find(u => u.id === userId);
  if (seller) {
    seller.totalActiveAdvertisements = mockAds.filter(ad => ad.sellerId === userId && ad.status === 'ACTIVE').length;
  }
};
