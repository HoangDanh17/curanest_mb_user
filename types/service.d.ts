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

export type ServicePack = {
  id: string;
  "service-id": string;
  name: string;
  description: string;
  "combo-days": number;
  discount: number;
  "time-interval": number;
  status: string;
  "created-at": number;
};

export type ServicePackRes = {
  status: number;
  data: ServicePack[];
};

export type ServiceTask = {
  id: string;
  "svcpackage-id": string;
  "is-must-have": boolean;
  "task-order"?: number;
  name: string;
  description?: string;
  "staff-advice"?: string;
  "est-duration": number;
  cost: number;
  "additional-cost": number;
  "additional-cost-desc"?: string;
  unit: string;
  "price-of-step": number;
  status?: string;
};

export type ServiceTaskRes = {
  status: number;
  data: ServiceTask[];
};
