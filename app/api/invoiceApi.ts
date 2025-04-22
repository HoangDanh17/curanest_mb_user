import http from "@/lib/http";
import { InvoiceRes } from "@/types/invoice";

const invoiceApiRequest = {
  getInvoice: (id: string) =>
    http.get<InvoiceRes>(`cuspackage/${id}/invoices`, { apiPrefix: "appointment" }),
};

export default invoiceApiRequest;
