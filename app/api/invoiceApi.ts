import http from "@/lib/http";
import { AddMoreAppointmentRes } from "@/types/appointment";
import { InvoiceRes } from "@/types/invoice";

const invoiceApiRequest = {
  getInvoice: (id: string) =>
    http.get<InvoiceRes>(`cuspackage/${id}/invoices`, { apiPrefix: "appointment" }),
  createInvoice: (id: string) =>
    http.patch<AddMoreAppointmentRes>(`invoices/${id}/create-payment-url`, null, {
      apiPrefix: "notification",
    }),
};

export default invoiceApiRequest;
  