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
