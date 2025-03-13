export type CategoryInfo = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
};

export type Service = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  estDuration: string;
  status: string;
};

export type CategoryWithServices = {
  "category-info": CategoryInfo;
  "list-services": Service[];
};

export type CategoryWithServicesRes = {
  status: number;
  data: CategoryWithServices[];
};
