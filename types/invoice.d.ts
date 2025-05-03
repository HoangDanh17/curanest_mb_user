export type Invoice = {
  id: string;
  "cuspackage-id": string;
  "order-code": number;
  "total-fee": number;
  status: string;
  note: string;
  "payos-url": string;
  "created-at": string;
};

export type InvoiceRes = {
  status: number;
  data: Invoice[];
};

export type InvoiceList = {
  id: string;
  "cuspackage-id": string;
  "total-fee": number;
  status: string;
  "created-at": string;
};

export type InvoiceListRes = {
  status: number;
  data: InvoiceList[];
};
