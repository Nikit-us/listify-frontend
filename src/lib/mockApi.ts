
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
  CategoryTreeDto, 
  RegionDto,
  DistrictDto,
  AdvertisementSearchCriteriaDto,
  AdvertisementImageDto,
} from '@/types/api';

const API_BASE_URL_FROM_ENV = process.env.NEXT_PUBLIC_API_BASE_URL;
const FALLBACK_API_BASE_URL = 'https://listify-app.site/api';

const isValidApiBaseUrl = (url?: string): boolean => {
  if (!url || url.trim() === "" || url.toLowerCase() === "undefined") {
    return false;
  }
  try {
    new URL(url); 
    return true;
  } catch (e) {
    console.warn(`Предоставленный API_BASE_URL "${url}" не является валидным URL.`);
    return false;
  }
};

const API_BASE_URL = isValidApiBaseUrl(API_BASE_URL_FROM_ENV) ? API_BASE_URL_FROM_ENV : FALLBACK_API_BASE_URL;


const getAssetBaseUrl = (): string => {
  if (!API_BASE_URL) return '';
  try {
    const url = new URL(API_BASE_URL);
    let basePath = url.origin;
    // Если URL API заканчивается на /api, нужно его убрать для базового URL ассетов
    if (url.pathname.endsWith('/api')) {
        basePath += url.pathname.substring(0, url.pathname.length - '/api'.length);
    } else if (url.pathname !== '/') {
        basePath += url.pathname; // Если есть какой-то другой путь, не /api
    }
    return basePath.replace(/\/$/, ''); // Убираем слэш в конце, если он есть

  } catch (error) {
    // Эта логика для относительных путей, если API_BASE_URL_FROM_ENV, например, "/api"
    return API_BASE_URL_FROM_ENV && API_BASE_URL_FROM_ENV.startsWith('/') ? API_BASE_URL_FROM_ENV.replace(/\/api$/, '').replace(/\/$/, '') : '';
  }
};


const toAbsoluteImageUrl = (relativePath?: string): string | undefined => {
  if (!relativePath) return undefined;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  const assetBase = getAssetBaseUrl();
  if (assetBase && relativePath.startsWith('/')) {
    return `${assetBase}${relativePath}`;
  }
  if (assetBase) return `${assetBase}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
  // Если assetBase пустой (например, если API_BASE_URL был невалидным и не определен),
  // и relativePath не абсолютный, вернем как есть.
  // Это может быть полезно для плейсхолдеров или если пути уже абсолютные с другого хоста.
  return relativePath; 
};

let mockRegions: RegionDto[] = [
  { id: 1, name: "Минская область" },
  { id: 2, name: "Гомельская область" },
  { id: 3, name: "Брестская область" },
];

let mockDistricts: DistrictDto[] = [
  { id: 11, name: "Минский район" }, { id: 12, name: "Борисовский район" }, { id: 13, name: "Солигорский район" },
  { id: 21, name: "Гомельский район" }, { id: 22, name: "Жлобинский район" }, { id: 23, name: "Речицкий район" },
  { id: 31, name: "Брестский район" }, { id: 32, name: "Барановичский район" }, { id: 33, name: "Пинский район" },
];
const mockDistrictToRegionMap: { [districtId: number]: number } = { 11:1, 12:1, 13:1, 21:2, 22:2, 23:2, 31:3, 32:3, 33:3 };

let mockCities: CityDto[] = [
  { id: 1, name: 'Минск' }, { id: 2, name: 'Гомель' }, { id: 3, name: 'Борисов' }, { id: 4, name: 'Жлобин' },
  { id: 5, name: 'Солигорск' }, { id: 6, name: 'Речица' }, { id: 7, name: 'Брест' }, { id: 8, name: 'Барановичи' }, { id: 9, name: 'Пинск' }
];
const mockCityToDistrictMap: { [cityId: number]: number } = { 1:11, 3:12, 5:13, 2:21, 4:22, 6:23, 7:31, 8:32, 9:33 };

let mockCategoryTree: CategoryTreeDto[] = [
  { id: 1, name: 'Электроника', children: [
    { id: 11, name: 'Телефоны и Аксессуары', children: [
        { id: 111, name: 'Мобильные телефоны', children: [] },
        { id: 112, name: 'Чехлы', children: [] },
    ]},
    { id: 12, name: 'Компьютеры и Сети', children: [
      { id: 121, name: 'Ноутбуки', children: [] },
      { id: 122, name: 'Комплектующие', children: [] },
      { id: 123, name: 'Сетевое оборудование', children: [] },
    ]},
  ]},
  { id: 2, name: 'Недвижимость', children: [
    { id: 21, name: 'Квартиры', children: [] },
    { id: 22, name: 'Дома и дачи', children: [] },
  ] },
  { id: 3, name: 'Хобби и отдых', children: [
    { id: 31, name: 'Спорттовары', children: [] },
    { id: 32, name: 'Книги и журналы', children: [] },
  ]},
];

let mockAds: AdvertisementDetailDto[] = Array.from({ length: 25 }, (_, i) => ({
  id: 101 + i,
  title: `Продам ${i % 2 === 0 ? 'ноутбук' : 'велосипед'} #${101 + i}`,
  price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
  cityId: (i % 9) + 1, 
  cityName: mockCities.find(c=>c.id === (i%9)+1)?.name || 'Неизвестный город',
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  previewImageUrl: toAbsoluteImageUrl(`https://placehold.co/300x200.png?text=Ad+${101 + i}`),
  description: `Отличный товар #${101 + i}, почти новый. Использовался очень бережно, продаю в связи с переездом. Много текста чтобы описание было длинным и занимало несколько строк.`,
  updatedAt: new Date().toISOString(),
  status: 'ACTIVE',
  condition: i % 2 === 0 ? 'USED_GOOD' : 'NEW',
  categoryId: i % 3 === 0 ? 121 : (i % 3 === 1 ? 111 : 21), 
  categoryName: i % 3 === 0 ? 'Ноутбуки' : (i % 3 === 1 ? 'Мобильные телефоны' : 'Квартиры'),
  sellerId: 12 + (i % 2),
  sellerName: i % 2 === 0 ? 'Иван Петров' : 'Анна Иванова',
  images: [
    { id: 201 + i * 3, imageUrl: `https://placehold.co/600x400.png?text=Image+1+Ad+${101+i}`, isPreview: true },
    { id: 202 + i * 3, imageUrl: `https://placehold.co/600x400.png?text=Image+2+Ad+${101+i}`, isPreview: false },
    { id: 203 + i * 3, imageUrl: `https://placehold.co/600x400.png?text=Image+3+Ad+${101+i}`, isPreview: false },
  ].map(img => ({...img, imageUrl: toAbsoluteImageUrl(img.imageUrl!)!})),
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
    avatarUrl: toAbsoluteImageUrl('https://placehold.co/100x100.png?text=IP'),
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
    avatarUrl: toAbsoluteImageUrl('https://placehold.co/100x100.png?text=AI'),
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

export const getRegions = async (): Promise<RegionDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для getRegions");
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.parse(JSON.stringify(mockRegions));
  }
  const url = `${API_BASE_URL}/locations/regions`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Не удалось прочитать текст ошибки из ${url}`);
      console.error(`Не удалось получить регионы. Статус: ${response.status}, URL: ${url}, Ответ: ${errorText}`);
      throw new Error(`Не удалось получить регионы. Статус: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при получении регионов из ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при получении регионов. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getDistrictsByRegion = async (regionId: number): Promise<DistrictDto[]> => {
   if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для getDistrictsByRegion");
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.parse(JSON.stringify(mockDistricts.filter(d => mockDistrictToRegionMap[d.id] === regionId)));
  }
  const url = `${API_BASE_URL}/locations/districts?regionId=${regionId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Не удалось прочитать текст ошибки из ${url}`);
      console.error(`Не удалось получить районы для региона ${regionId}. Статус: ${response.status}, URL: ${url}, Ответ: ${errorText}`);
      throw new Error(`Не удалось получить районы для региона ${regionId}. Статус: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при получении районов для региона ${regionId} из ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при получении районов. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getCitiesByDistrict = async (districtId: number): Promise<CityDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для getCitiesByDistrict");
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.parse(JSON.stringify(mockCities.filter(c => mockCityToDistrictMap[c.id] === districtId)));
  }
  const url = `${API_BASE_URL}/locations/cities?districtId=${districtId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Не удалось прочитать текст ошибки из ${url}`);
      console.error(`Не удалось получить города для района ${districtId}. Статус: ${response.status}, URL: ${url}, Ответ: ${errorText}`);
      throw new Error(`Не удалось получить города для района ${districtId}. Статус: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при получении городов для района ${districtId} из ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при получении городов. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getCategoriesAsTree = async (): Promise<CategoryTreeDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для getCategoriesAsTree");
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.parse(JSON.stringify(mockCategoryTree));
  }
  const url = `${API_BASE_URL}/categories/tree`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Не удалось прочитать текст ошибки из ${url}`);
      console.error(`Не удалось получить дерево категорий. Статус: ${response.status}, URL: ${url}, Ответ: ${errorText}`);
      throw new Error(`Не удалось получить дерево категорий. Статус: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при получении дерева категорий из ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при получении дерева категорий. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const searchAds = async (
  criteria: AdvertisementSearchCriteriaDto,
  token?: string | null
): Promise<Page<AdvertisementResponseDto>> => {
  const { page = 0, size = 12, sort = 'createdAt,desc', ...filters } = criteria;

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для searchAds");
    await new Promise(resolve => setTimeout(resolve, 100));
    let filteredMockAds = [...mockAds];
    if (filters.keyword) filteredMockAds = filteredMockAds.filter(ad => ad.title.toLowerCase().includes(filters.keyword!.toLowerCase()) || ad.description.toLowerCase().includes(filters.keyword!.toLowerCase()));
    if (filters.cityId) filteredMockAds = filteredMockAds.filter(ad => ad.cityId === filters.cityId);
    if (filters.regionId) {
      const districtsInRegion = mockDistricts.filter(d => mockDistrictToRegionMap[d.id] === filters.regionId).map(d => d.id);
      const citiesInRegion = mockCities.filter(c => districtsInRegion.includes(mockCityToDistrictMap[c.id])).map(c => c.id);
      filteredMockAds = filteredMockAds.filter(ad => citiesInRegion.includes(ad.cityId));
    }
     if (filters.districtId) {
      const citiesInDistrict = mockCities.filter(c => mockCityToDistrictMap[c.id] === filters.districtId).map(c => c.id);
      filteredMockAds = filteredMockAds.filter(ad => citiesInDistrict.includes(ad.cityId));
    }
    if (filters.minPrice) filteredMockAds = filteredMockAds.filter(ad => ad.price >= filters.minPrice!);
    if (filters.maxPrice) filteredMockAds = filteredMockAds.filter(ad => ad.price <= filters.maxPrice!);
    if (filters.categoryId) {
      const getAllChildCategoryIds = (tree: CategoryTreeDto[], parentId: number): number[] => {
        let ids: number[] = [];
        const findInChildren = (nodes: CategoryTreeDto[], targetId: number) => {
            for (const node of nodes) {
                if (node.id === targetId) {
                    ids.push(node.id);
                    const collectChildren = (n: CategoryTreeDto) => {
                        ids.push(n.id);
                        if (n.children) n.children.forEach(collectChildren);
                    };
                    if (node.children) node.children.forEach(collectChildren);
                    return true; 
                }
                if (node.children && findInChildren(node.children, targetId)) return true;
            }
            return false;
        };
        findInChildren(tree, parentId);
        return ids.length > 0 ? ids : [parentId]; 
      };
      const categoryIdsToFilter = getAllChildCategoryIds(mockCategoryTree, filters.categoryId);
      filteredMockAds = filteredMockAds.filter(ad => categoryIdsToFilter.includes(ad.categoryId));
    }
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
      const errorText = await response.text().catch(() => `Не удалось прочитать текст ошибки для searchAds из ${url}`);
      console.error(`Не удалось найти объявления. Статус: ${response.status}, URL: ${url}, Ответ: ${errorText}`);
      throw new Error(`Не удалось найти объявления. Статус: ${response.status}. ${errorText}`);
    }
    const data: Page<AdvertisementResponseDto> = await response.json();
    data.content = data.content.map(ad => ({ ...ad, previewImageUrl: toAbsoluteImageUrl(ad.previewImageUrl) }));
    return data;
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при поиске объявлений из ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при поиске объявлений. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};


export const getAdById = async (id: number): Promise<AdvertisementDetailDto | null> => {
   if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для getAdById");
    await new Promise(resolve => setTimeout(resolve, 100));
    const ad = mockAds.find(ad_ => ad_.id === id);
    if (ad) {
      const clonedAd = JSON.parse(JSON.stringify(ad)); 
      clonedAd.images = clonedAd.images.map((img: AdvertisementImageDto) => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl!)! }));
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
      const errorText = await response.text().catch(() => `Не удалось прочитать текст ошибки из ${url}`);
      console.error(`Не удалось получить объявление ${id}. Статус: ${response.status}, URL: ${url}, Ответ: ${errorText}`);
      throw new Error(`Не удалось получить объявление ${id}. Статус: ${response.status}. ${errorText}`);
    }
    const ad: AdvertisementDetailDto = await response.json();
    if (ad) {
      ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
      ad.previewImageUrl = ad.images.find(img => img.isPreview)?.imageUrl || toAbsoluteImageUrl(ad.images[0]?.imageUrl) || toAbsoluteImageUrl(ad.previewImageUrl);
    }
    return ad;
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при получении объявления ${id} из ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при получении объявления ${id}. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const login = async (credentials: LoginRequestDto): Promise<JwtResponseDto> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для login");
    await new Promise(resolve => setTimeout(resolve, 100));
    const user = mockUsers.find(u => u.email === credentials.email);
    if (user && credentials.password === 'password123') { 
      return { token: `mock-jwt-token-for-${user.email}`, type: 'Bearer', userId: user.id, email: user.email, roles: ['ROLE_USER'] };
    }
    throw new Error('Неверные учетные данные (мок)');
  }
  const url = `${API_BASE_URL}/auth/login`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Вход не удался с не-JSON ответом' }));
      console.error(`Вход не удался. Статус: ${response.status}, URL: ${url}, Ответ: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Вход не удался. Статус: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL во время входа на ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL во время входа. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const register = async (data: UserRegistrationDto, avatar?: File): Promise<UserResponseDto> => {
  const formData = new FormData();
  formData.append('user', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (avatar) {
    formData.append('avatar', avatar);
  }

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для register");
    await new Promise(resolve => setTimeout(resolve, 100));
    if (mockUsers.some(u => u.email === data.email)) throw new Error('Пользователь с таким email уже существует (мок)');
    const newUserId = Math.max(...mockUsers.map(u => u.id), 0) + 1;
    const newUserProfileData: UserProfileDto = {
      id: newUserId, email: data.email, fullName: data.fullName, phoneNumber: data.phoneNumber, cityId: data.cityId,
      cityName: mockCities.find(c=>c.id === data.cityId)?.name || "Неизвестный Город", registeredAt: new Date().toISOString(),
      avatarUrl: avatar ? toAbsoluteImageUrl(`/uploads/avatars/mock-avatar-${newUserId}.jpg`) : undefined,
      totalActiveAdvertisements: 0,
    };
    mockUsers.push(newUserProfileData);
    const { totalActiveAdvertisements, cityName, ...userResponsePartial } = newUserProfileData;
    const finalUserResponse: UserResponseDto = {
        ...userResponsePartial,
        cityId: newUserProfileData.cityId, 
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
      const errorData = await response.json().catch(() => ({ message: 'Регистрация не удалась с не-JSON ответом' }));
      console.error(`Регистрация не удалась. Статус: ${response.status}, URL: ${url}, Ответ: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Регистрация не удалась. Статус: ${response.status}`);
    }
    const userResponse: UserResponseDto = await response.json();
    userResponse.avatarUrl = toAbsoluteImageUrl(userResponse.avatarUrl);
    return userResponse;
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL во время регистрации на ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL во время регистрации. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const createAd = async (data: AdvertisementCreateDto, images: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
  const formData = new FormData();
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (images && images.length > 0) {
    images.forEach(file => formData.append('images', file));
  }

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для createAd");
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
      cityName: mockCities.find(c => c.id === data.cityId)?.name || 'Неизвестный Город',
      categoryName: mockCategoryTree.flatMap(ct => ct.children && ct.children.length > 0 ? ct.children : [ct]).find(c => c.id === data.categoryId)?.name || 'Неизвестная Категория', // simplified mock
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
      const errorData = await response.json().catch(() => ({ message: 'Не удалось создать объявление с не-JSON ответом' }));
      console.error(`Не удалось создать объявление. Статус: ${response.status}, URL: ${url}, Ответ: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Не удалось создать объявление. Статус: ${response.status}`);
    }
    const ad: AdvertisementDetailDto = await response.json();
    ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
    ad.previewImageUrl = ad.images.find(img => img.isPreview)?.imageUrl || toAbsoluteImageUrl(ad.images[0]?.imageUrl) || toAbsoluteImageUrl(ad.previewImageUrl);
    return ad;
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при создании объявления на ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при создании объявления. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const updateAd = async (id: number, data: AdvertisementUpdateDto, newImages: File[] | undefined, token: string): Promise<AdvertisementDetailDto> => {
  const formData = new FormData();
  // В AdvertisementUpdateDto уже должен быть imageIdsToDelete
  formData.append('advertisement', new Blob([JSON.stringify(data)], { type: "application/json" }));

  if (newImages && newImages.length > 0) {
    newImages.forEach(file => formData.append('images', file));
  }

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для updateAd");
    await new Promise(resolve => setTimeout(resolve, 100));
    const adIndex = mockAds.findIndex(ad => ad.id === id);
    if (adIndex === -1) throw new Error('Объявление не найдено (мок)');
    
    const existingAd = mockAds[adIndex];
    let updatedAd: AdvertisementDetailDto = { ...existingAd, ...data, updatedAt: new Date().toISOString() };
    if (data.cityId) updatedAd.cityName = mockCities.find(c => c.id === data.cityId)?.name || existingAd.cityName;
    
    const findCategoryName = (categories: CategoryTreeDto[], categoryId: number): string | undefined => {
        for (const category of categories) {
            if (category.id === categoryId) return category.name;
            if (category.children && category.children.length > 0) {
                const foundName = findCategoryName(category.children, categoryId);
                if (foundName) return foundName;
            }
        }
        return undefined;
    };
    if (data.categoryId) updatedAd.categoryName = findCategoryName(mockCategoryTree, data.categoryId) || existingAd.categoryName;


    if (data.imageIdsToDelete && data.imageIdsToDelete.length > 0) {
        updatedAd.images = updatedAd.images.filter(img => !data.imageIdsToDelete?.includes(img.id));
    }
    if (newImages && newImages.length > 0) {
        const addedImages: AdvertisementImageDto[] = newImages.map((img, i) => ({
            id: Date.now() + i + 2000, 
            imageUrl: toAbsoluteImageUrl(`/uploads/ads/mock-updated-ad${id}-newimg${i+1}.jpg`)!,
            isPreview: updatedAd.images.length === 0 && i === 0, 
        }));
        updatedAd.images = [...updatedAd.images, ...addedImages];
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
      const errorData = await response.json().catch(() => ({ message: 'Не удалось обновить объявление с не-JSON ответом' }));
      console.error(`Не удалось обновить объявление. Статус: ${response.status}, URL: ${url}, Ответ: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Не удалось обновить объявление. Статус: ${response.status}`);
    }
    const ad: AdvertisementDetailDto = await response.json();
    ad.images = ad.images.map(img => ({ ...img, imageUrl: toAbsoluteImageUrl(img.imageUrl)! }));
    ad.previewImageUrl = ad.images.find(img => img.isPreview)?.imageUrl || toAbsoluteImageUrl(ad.images[0]?.imageUrl) || toAbsoluteImageUrl(ad.previewImageUrl);
    return ad;
  } catch (error) {
     console.error(`Сетевая ошибка или неверный URL при обновлении объявления ${id} на ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при обновлении объявления ${id}. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getUserProfile = async (userId: number): Promise<UserProfileDto | null> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для getUserProfile");
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
        console.warn(`Профиль пользователя для userId ${userId} не найден (404) по адресу ${url}.`);
        return null;
      }
      const errorText = await response.text().catch(() => `Не удалось прочитать текст ошибки из ${url}`);
      console.error(`Не удалось получить профиль пользователя ${userId}. Статус: ${response.status}, URL: ${url}, Ответ: ${errorText}`);
      throw new Error(`Не удалось получить профиль пользователя ${userId}. Статус: ${response.status}. ${errorText}`);
    }
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl);
    return profile;
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при получении профиля пользователя ${userId} из ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при получении профиля пользователя ${userId}. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getCurrentUserProfile = async (token: string): Promise<UserProfileDto | null> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для getCurrentUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    const mockJwtUser = mockUsers.find(u => `mock-jwt-token-for-${u.email}` === token) || mockUsers[0]; 
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
        console.warn(`Текущий профиль пользователя не найден или не авторизован (статус: ${response.status}) по адресу ${url}.`);
        return null;
      }
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || await response.text().catch(() => `Не удалось прочитать текст ошибки для getCurrentUserProfile из ${url}`);
      console.error(`Не удалось получить текущий профиль пользователя. Статус: ${response.status}, URL: ${url}, Ответ: ${errorMessage}`);
      throw new Error(`Не удалось получить текущий профиль пользователя. Статус: ${response.status}. ${errorMessage}`);
    }
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl);
    return profile;
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при получении текущего профиля пользователя из ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при получении текущего профиля пользователя. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const updateUserProfile = async (data: UserUpdateProfileDto, avatar: File | undefined, token: string): Promise<UserProfileDto> => {
  const formData = new FormData();
  formData.append('profile', new Blob([JSON.stringify(data)], { type: "application/json" }) );
  if (avatar) {
    formData.append('avatar', avatar);
  }

  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для updateUserProfile");
    await new Promise(resolve => setTimeout(resolve, 100));
    let userToUpdateIdx = mockUsers.findIndex(u => `mock-jwt-token-for-${u.email}` === token);
    if (userToUpdateIdx === -1 && mockUsers.length > 0) userToUpdateIdx = 0; 

    if (userToUpdateIdx !== -1) {
        const userToUpdate = mockUsers[userToUpdateIdx];
        const updatedUser: UserProfileDto = { ...userToUpdate, ...data, id: userToUpdate.id, email: userToUpdate.email, registeredAt: userToUpdate.registeredAt, totalActiveAdvertisements: userToUpdate.totalActiveAdvertisements };
        if (data.cityId) updatedUser.cityName = mockCities.find(c=>c.id === data.cityId)?.name || userToUpdate.cityName;
        if (avatar) updatedUser.avatarUrl = toAbsoluteImageUrl(`/uploads/avatars/mock-avatar-updated-${userToUpdate.id}.jpg`);

        mockUsers[userToUpdateIdx] = updatedUser;
        return JSON.parse(JSON.stringify(updatedUser));
    }
    throw new Error('Пользователь не найден для обновления (мок)');
  }

  const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
  const url = `${API_BASE_URL}/users/me`;
  try {
    const response = await fetch(url, { method: 'PUT', body: formData, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Не удалось обновить профиль с не-JSON ответом' }));
      console.error(`Не удалось обновить профиль. Статус: ${response.status}, URL: ${url}, Ответ: ${JSON.stringify(errorData)}`);
      throw new Error(errorData.message || `Не удалось обновить профиль. Статус: ${response.status}`);
    }
    const profile: UserProfileDto = await response.json();
    profile.avatarUrl = toAbsoluteImageUrl(profile.avatarUrl);
    return profile;
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при обновлении профиля на ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при обновлении профиля. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};


export const deleteAd = async (adId: number, token: string): Promise<void> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для deleteAd");
    await new Promise(resolve => setTimeout(resolve, 100));
    const adIndex = mockAds.findIndex(ad => ad.id === adId);
    const mockCurrentUser = mockUsers.find(u => `mock-jwt-token-for-${u.email}` === token) || mockUsers[0];
    if (adIndex === -1 || (mockCurrentUser && mockAds[adIndex].sellerId !== mockCurrentUser.id) ) {
        throw new Error('Объявление не найдено или пользователь не авторизован для удаления (мок)');
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

    if (!response.ok) {
      let errorMessage = `Не удалось удалить объявление. Статус: ${response.status}`;
      try {
        const errorBody = await response.text(); 
        if (errorBody) {
            errorMessage += `. ${errorBody}`;
        }
      } catch (e) { /* ignore if cannot read body */ }
      console.error(`Не удалось удалить объявление. Статус: ${response.status}, URL: ${url}`);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при удалении объявления ${adId} на ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при удалении объявления ${adId}. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getCategories = async (): Promise<CategoryDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для getCategories (плоский)");
    await new Promise(resolve => setTimeout(resolve, 100));
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
      const errorText = await response.text().catch(() => `Не удалось прочитать текст ошибки из ${url}`);
      console.error(`Не удалось получить категории. Статус: ${response.status}, URL: ${url}, Ответ: ${errorText}`);
      throw new Error(`Не удалось получить категории. Статус: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при получении категорий из ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при получении категорий. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

export const getAllCitiesFlat = async (): Promise<CityDto[]> => {
  if (!API_BASE_URL) {
    console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для getAllCitiesFlat");
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.parse(JSON.stringify(mockCities)); 
  }
  const url = `${API_BASE_URL}/locations/cities`; // Предполагаем, что без districtId возвращает все
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Не удалось прочитать текст ошибки из ${url}`);
      console.error(`Не удалось получить все города. Статус: ${response.status}, URL: ${url}, Ответ: ${errorText}`);
      throw new Error(`Не удалось получить все города. Статус: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при получении всех городов из ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при получении всех городов. URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};

// Используется RegisterForm и ProfileForm для плоского списка городов.
// В идеале, эти формы также должны использовать иерархический выбор или API должен предоставлять такой эндпоинт, если необходимо.
export const getCities = async (): Promise<CityDto[]> => {
  // Временно вызываем getAllCitiesFlat. В реальном API это может быть другой эндпоинт,
  // или эти формы должны быть переделаны под иерархический выбор.
  if (!API_BASE_URL) {
     console.warn("API_BASE_URL не установлен или невалиден, используются мок-данные для getCities (плоский список через getAllCitiesFlat)");
     return getAllCitiesFlat(); // Используем существующие моки
  }
  // Если есть реальный API_BASE_URL, пытаемся получить все города.
  // Это предполагает, что GET /api/locations/cities без districtId возвращает все города.
  // Если это не так, эта функция потребует корректировки или должна быть удалена,
  // а использующие ее компоненты должны быть переделаны.
  const url = `${API_BASE_URL}/locations/cities`; 
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Не удалось прочитать текст ошибки из ${url}`);
      console.error(`Не удалось получить города (плоский список). Статус: ${response.status}, URL: ${url}, Ответ: ${errorText}`);
      throw new Error(`Не удалось получить города (плоский список). Статус: ${response.status}. ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Сетевая ошибка или неверный URL при получении городов (плоский список) из ${url}:`, error);
    throw new Error(`Сетевая ошибка или неверный URL при получении городов (плоский список). URL: ${url}. Исходная ошибка: ${(error as Error).message}`);
  }
};
