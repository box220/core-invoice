export interface CompanyInfo {
  name: string;
  tagline: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  companyCode: string;
  vatNumber: string;
  email: string;
  phone: string;
}

export interface ClientInfo {
  name: string;
  address: string;
  building?: string;
  floor?: string;
  city: string;
  country: string;
  uic: string;
  vatNumber: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string;
  servicePeriodStart: string;
  servicePeriodEnd: string;
}

export interface ServiceItem {
  id: string;
  description: string;
  additionalInfo?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PaymentInfo {
  bankName: string;
  iban: string;
  swift: string;
  currency: string;
  paymentTermsDays: number;
}

export interface ReverseChargeInfo {
  applicable: boolean;
  article44Text: string;
  article13Text: string;
  customerVAT: string;
}

export interface Invoice {
  id: string;
  templateName?: string;
  company: CompanyInfo;
  client: ClientInfo;
  details: InvoiceDetails;
  services: ServiceItem[];
  payment: PaymentInfo;
  reverseCharge: ReverseChargeInfo;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  footerNote?: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  invoice: Partial<Invoice>;
  createdAt: string;
  updatedAt: string;
}
